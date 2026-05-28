import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'
import cors from 'cors'
import express from 'express'
import morgan from 'morgan'
import { v4 as uuidv4 } from 'uuid'

const PORT = Number(process.env.EVENT_API_PORT || 3001)
const DB_PATH = process.env.EVENT_DB_PATH || path.join(process.cwd(), 'data/events.sqlite')
const WEBHOOK_TOKEN = process.env.EVENT_WEBHOOK_TOKEN || ''

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })

const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  command TEXT NOT NULL,
  device_id TEXT,
  device_name TEXT,
  alarm_event INTEGER,
  alarm_event_name TEXT,
  alarm_id TEXT,
  alarm_time TEXT,
  alarm_unique_id TEXT,
  alarm_state INTEGER,
  alarm_if_record INTEGER,
  record_res_url TEXT,
  record_sub_res_url TEXT,
  managed_message_id TEXT,
  managed_state TEXT,
  dedupe_key TEXT NOT NULL UNIQUE,
  received_at TEXT NOT NULL,
  raw_payload TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_received_at ON events(received_at);
CREATE INDEX IF NOT EXISTS idx_events_device_id ON events(device_id);
CREATE INDEX IF NOT EXISTS idx_events_alarm_unique_id ON events(alarm_unique_id);
CREATE INDEX IF NOT EXISTS idx_events_managed_message_id ON events(managed_message_id);
CREATE INDEX IF NOT EXISTS idx_events_command ON events(command);
CREATE INDEX IF NOT EXISTS idx_events_dedupe_key ON events(dedupe_key);
`)

const insertEvent = db.prepare(`
INSERT OR IGNORE INTO events (
  id,
  command,
  device_id,
  device_name,
  alarm_event,
  alarm_event_name,
  alarm_id,
  alarm_time,
  alarm_unique_id,
  alarm_state,
  alarm_if_record,
  record_res_url,
  record_sub_res_url,
  managed_message_id,
  managed_state,
  dedupe_key,
  received_at,
  raw_payload
) VALUES (
  @id,
  @command,
  @deviceId,
  @deviceName,
  @alarmEvent,
  @alarmEventName,
  @alarmId,
  @alarmTime,
  @alarmUniqueId,
  @alarmState,
  @alarmIfRecord,
  @recordResUrl,
  @recordSubResUrl,
  @managedMessageId,
  @managedState,
  @dedupeKey,
  @receivedAt,
  @rawPayload
)
`)

const app = express()

app.use(morgan(':remote-addr :method :url :status :response-time ms'))
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:5173',
}))
app.use(express.json({
  limit: '1mb',
  verify: (req, _res, buf) => {
    req.rawBody = buf.toString('utf8')
  },
}))

function requireWebhookToken(req, res, next) {
  if (!WEBHOOK_TOKEN) {
    next()
    return
  }

  const token = req.get('X-Webhook-Token')
  if (token === WEBHOOK_TOKEN) {
    next()
    return
  }

  res.status(401).json({ code: 401, msg: 'invalid webhook token' })
}

function toStringValue(value) {
  if (value === undefined || value === null) return undefined
  return String(value)
}

function toNumberValue(value) {
  if (value === undefined || value === null || value === '') return undefined
  const num = Number(value)
  return Number.isFinite(num) ? num : undefined
}

function safeAlarmUniqueId(value) {
  if (value === undefined || value === null) return undefined
  if (typeof value === 'number' && value > Number.MAX_SAFE_INTEGER) {
    console.warn(`alarmUniqueId exceeds safe integer: ${value}`)
  }
  return String(value)
}

function stableJson(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableJson).join(',')}]`
  }
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`
  }
  return JSON.stringify(value)
}

function hash(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

function buildAlarmDedupeKey(item, command) {
  const alarmUniqueId = safeAlarmUniqueId(item.alarmUniqueId)
  if (alarmUniqueId) {
    return `alarm:${alarmUniqueId}`
  }
  return [
    command,
    toStringValue(item.deviceId) || '',
    toStringValue(item.alarmId) || '',
    toStringValue(item.alarmTime) || '',
    toStringValue(item.alarmState) || '',
  ].join('|')
}

function normalizeEvents(message, rawPayload, receivedAt) {
  const command = typeof message.command === 'string' ? message.command : 'unknown'

  if (command === 'message.device.alarm') {
    const list = Array.isArray(message.payload?.list) ? message.payload.list : []
    return list.map(item => ({
      id: uuidv4(),
      command,
      deviceId: toStringValue(item.deviceId),
      deviceName: toStringValue(item.deviceName),
      alarmEvent: toNumberValue(item.alarmEvent),
      alarmEventName: toStringValue(item.alarmEventName),
      alarmId: toStringValue(item.alarmId),
      alarmTime: toStringValue(item.alarmTime),
      alarmUniqueId: safeAlarmUniqueId(item.alarmUniqueId),
      alarmState: toNumberValue(item.alarmState),
      alarmIfRecord: toNumberValue(item.alarmIfRecord),
      recordResUrl: toStringValue(item.recordResUrl),
      recordSubResUrl: toStringValue(item.recordSubResUrl),
      managedMessageId: undefined,
      managedState: undefined,
      dedupeKey: buildAlarmDedupeKey(item, command),
      receivedAt,
      rawPayload,
    }))
  }

  if (command === 'message.device.managed' || command === 'message.device.cancelManaged') {
    const deviceList = Array.isArray(message.payload?.deviceList) ? message.payload.deviceList : []
    const managedMessageId = toStringValue(message.id)
    return deviceList.map(item => {
      const deviceId = toStringValue(item.deviceId)
      return {
        id: uuidv4(),
        command,
        deviceId,
        deviceName: undefined,
        alarmEvent: undefined,
        alarmEventName: undefined,
        alarmId: undefined,
        alarmTime: undefined,
        alarmUniqueId: undefined,
        alarmState: undefined,
        alarmIfRecord: undefined,
        recordResUrl: undefined,
        recordSubResUrl: undefined,
        managedMessageId,
        managedState: toStringValue(message.payload?.state),
        dedupeKey: [command, managedMessageId || '', deviceId || ''].join('|'),
        receivedAt,
        rawPayload,
      }
    })
  }

  return [{
    id: uuidv4(),
    command: 'unknown',
    deviceId: undefined,
    deviceName: undefined,
    alarmEvent: undefined,
    alarmEventName: undefined,
    alarmId: undefined,
    alarmTime: undefined,
    alarmUniqueId: undefined,
    alarmState: undefined,
    alarmIfRecord: undefined,
    recordResUrl: undefined,
    recordSubResUrl: undefined,
    managedMessageId: undefined,
    managedState: undefined,
    dedupeKey: `unknown:${hash(stableJson(message))}`,
    receivedAt,
    rawPayload,
  }]
}

function mapRow(row) {
  if (!row) return null
  return {
    id: row.id,
    command: row.command,
    deviceId: row.device_id ?? undefined,
    deviceName: row.device_name ?? undefined,
    alarmEvent: row.alarm_event ?? undefined,
    alarmEventName: row.alarm_event_name ?? undefined,
    alarmId: row.alarm_id ?? undefined,
    alarmTime: row.alarm_time ?? undefined,
    alarmUniqueId: row.alarm_unique_id ?? undefined,
    alarmState: row.alarm_state ?? undefined,
    alarmIfRecord: row.alarm_if_record ?? undefined,
    recordResUrl: row.record_res_url ?? undefined,
    recordSubResUrl: row.record_sub_res_url ?? undefined,
    managedMessageId: row.managed_message_id ?? undefined,
    managedState: row.managed_state ?? undefined,
    receivedAt: row.received_at,
    rawPayload: row.raw_payload,
  }
}

app.get('/api/events/stats', (_req, res) => {
  const total = db.prepare('SELECT COUNT(*) AS count FROM events').get().count
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const today = db.prepare('SELECT COUNT(*) AS count FROM events WHERE received_at >= ?').get(todayStart.toISOString()).count
  const byAlarmState = Object.fromEntries(
    db.prepare('SELECT alarm_state AS key, COUNT(*) AS count FROM events WHERE alarm_state IS NOT NULL GROUP BY alarm_state').all()
      .map(row => [String(row.key), row.count])
  )
  const byCommand = Object.fromEntries(
    db.prepare('SELECT command AS key, COUNT(*) AS count FROM events GROUP BY command').all()
      .map(row => [row.key, row.count])
  )

  res.json({ total, today, byAlarmState, byCommand })
})

app.get('/api/events/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.get('/api/events', (req, res) => {
  const page = Math.max(Number(req.query.page || 1), 1)
  const pageSize = Math.min(Math.max(Number(req.query.pageSize || req.query.limit || 20), 1), 100)
  const offset = req.query.offset !== undefined ? Math.max(Number(req.query.offset), 0) : (page - 1) * pageSize
  const where = []
  const params = {}

  if (req.query.deviceId) {
    where.push('device_id = @deviceId')
    params.deviceId = String(req.query.deviceId)
  }
  if (req.query.command) {
    where.push('command = @command')
    params.command = String(req.query.command)
  }
  if (req.query.alarmState !== undefined && req.query.alarmState !== '') {
    where.push('alarm_state = @alarmState')
    params.alarmState = Number(req.query.alarmState)
  }
  if (req.query.startTime) {
    where.push('received_at >= @startTime')
    params.startTime = String(req.query.startTime)
  }
  if (req.query.endTime) {
    where.push('received_at <= @endTime')
    params.endTime = String(req.query.endTime)
  }
  if (req.query.keyword) {
    where.push('(device_id LIKE @keyword OR device_name LIKE @keyword OR alarm_event_name LIKE @keyword OR alarm_id LIKE @keyword)')
    params.keyword = `%${String(req.query.keyword)}%`
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : ''
  const total = db.prepare(`SELECT COUNT(*) AS count FROM events ${whereClause}`).get(params).count
  const rows = db.prepare(`
    SELECT * FROM events
    ${whereClause}
    ORDER BY received_at DESC
    LIMIT @limit OFFSET @offset
  `).all({ ...params, limit: pageSize, offset })

  res.json({
    items: rows.map(mapRow),
    page,
    pageSize,
    offset,
    limit: pageSize,
    total,
  })
})

app.get('/api/events/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id)
  if (!row) {
    res.status(404).json({ message: 'Event not found' })
    return
  }
  res.json(mapRow(row))
})

app.delete('/api/events/:id', (req, res) => {
  const result = db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id)
  res.json({ deleted: result.changes })
})

app.post('/api/events/push', requireWebhookToken, (req, res) => {
  const rawPayload = req.rawBody || JSON.stringify(req.body)
  const receivedAt = new Date().toISOString()
  const records = normalizeEvents(req.body, rawPayload, receivedAt)
  const tx = db.transaction(items => {
    let inserted = 0
    for (const item of items) {
      inserted += insertEvent.run(item).changes
    }
    return inserted
  })

  const inserted = tx(records)
  res.json({ code: 0, inserted, ignored: records.length - inserted })
})

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(400).json({ code: 400, msg: err instanceof Error ? err.message : 'bad request' })
})

app.listen(PORT, () => {
  console.log(`event-api listening on ${PORT}, db=${DB_PATH}`)
  console.log(WEBHOOK_TOKEN ? 'webhook token is enabled' : 'webhook token is disabled')
})
