import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert, AppBar, Box, Button, Card, CardContent, Chip, CircularProgress,
  Container, Dialog, DialogContent, DialogTitle, Divider, FormControl,
  IconButton, InputLabel, MenuItem, Select, Snackbar, TextField, Toolbar,
  Typography, BottomNavigation, BottomNavigationAction,
} from '@mui/material'
import {
  ArrowBack, Delete, NotificationsActive, Refresh, Settings, Videocam,
} from '@mui/icons-material'
import { deleteEvent, fetchEventDetail, fetchEvents, fetchEventStats } from '../api/event-api'
import { useLanguage } from '../context/LanguageContext'
import type { AlarmEventRecord, EventCommand, EventStats } from '../types/event'

const PAGE_SIZE = 20
const SAFE_PROTOCOLS = ['https:', 'http:']

function getAlarmStateLabel(state: number | undefined, language: 'en' | 'zh'): string {
  const labels = language === 'zh'
    ? { 0: '停止/离线', 1: '开始/在线', 2: '设备故障', 3: '硬盘满' }
    : { 0: 'Stopped/Offline', 1: 'Started/Online', 2: 'Device Fault', 3: 'Disk Full' }
  if (state === undefined) return language === 'zh' ? '无状态' : 'No State'
  return labels[state as keyof typeof labels] || String(state)
}

function getCommandLabel(command: EventCommand, language: 'en' | 'zh'): string {
  const labels: Record<EventCommand, string> = language === 'zh'
    ? {
        'message.device.alarm': '设备报警',
        'message.device.managed': '托管设备',
        'message.device.cancelManaged': '取消托管',
        unknown: '未知消息',
      }
    : {
        'message.device.alarm': 'Alarm',
        'message.device.managed': 'Managed',
        'message.device.cancelManaged': 'Cancel Managed',
        unknown: 'Unknown',
      }
  return labels[command]
}

function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return SAFE_PROTOCOLS.includes(parsed.protocol)
  } catch {
    return false
  }
}

function formatTime(value: string | undefined, language: 'en' | 'zh'): string {
  if (!value) return '-'
  const normalized = value.includes('T') ? value : value.replace(' ', 'T')
  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US')
}

function compactId(value: string | undefined): string {
  if (!value) return '-'
  if (value.length <= 18) return value
  return `${value.slice(0, 8)}...${value.slice(-6)}`
}

function formatRawPayload(rawPayload: string): string {
  try {
    return JSON.stringify(JSON.parse(rawPayload), null, 2)
  } catch {
    return rawPayload
  }
}

export default function AlarmListPage() {
  const navigate = useNavigate()
  const { language, t } = useLanguage()
  const [items, setItems] = useState<AlarmEventRecord[]>([])
  const [stats, setStats] = useState<EventStats | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [command, setCommand] = useState<EventCommand | ''>('')
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState<AlarmEventRecord | null>(null)
  const [toast, setToast] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({ open: false, msg: '', severity: 'success' })

  const totalPages = useMemo(() => Math.max(Math.ceil(total / PAGE_SIZE), 1), [total])

  const loadData = async () => {
    setLoading(true)
    try {
      const [eventResponse, statResponse] = await Promise.all([
        fetchEvents({ page, pageSize: PAGE_SIZE, keyword, command }),
        fetchEventStats(),
      ])
      setItems(eventResponse.items)
      setTotal(eventResponse.total)
      setStats(statResponse)
    } catch (err) {
      setToast({ open: true, msg: err instanceof Error ? err.message : t('error.unknown'), severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [page, command])

  useEffect(() => {
    const timer = window.setInterval(() => {
      loadData()
    }, 5000)
    return () => window.clearInterval(timer)
  }, [page, keyword, command])

  const handleSearch = () => {
    setPage(1)
    loadData()
  }

  const handleOpenDetail = async (item: AlarmEventRecord) => {
    try {
      setDetail(await fetchEventDetail(item.id))
    } catch (err) {
      setToast({ open: true, msg: err instanceof Error ? err.message : t('error.unknown'), severity: 'error' })
    }
  }

  const handleDelete = async (item: AlarmEventRecord) => {
    if (!confirm(language === 'zh' ? '确定删除这条报警记录？' : 'Delete this alarm record?')) return
    try {
      await deleteEvent(item.id)
      setToast({ open: true, msg: language === 'zh' ? '报警记录已删除' : 'Alarm record deleted', severity: 'success' })
      loadData()
    } catch (err) {
      setToast({ open: true, msg: err instanceof Error ? err.message : t('error.unknown'), severity: 'error' })
    }
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#F6F8FA' }}>
      <AppBar position="fixed" elevation={0} sx={{ background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 100%)' }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => navigate('/')} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
          <NotificationsActive sx={{ mr: 1.5 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>{t('common.alarms')}</Typography>
          <IconButton color="inherit" onClick={loadData} disabled={loading}>
            <Refresh sx={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ flex: 1, pt: 10, pb: 12, overflow: 'auto' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, gap: 1.5, mb: 2 }}>
          <Card><CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}><Typography variant="caption" color="text.secondary">{t('alarm.stats.total')}</Typography><Typography variant="h5">{stats?.total ?? 0}</Typography></CardContent></Card>
          <Card><CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}><Typography variant="caption" color="text.secondary">{t('alarm.stats.today')}</Typography><Typography variant="h5">{stats?.today ?? 0}</Typography></CardContent></Card>
          <Card><CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}><Typography variant="caption" color="text.secondary">{getCommandLabel('message.device.alarm', language)}</Typography><Typography variant="h5">{stats?.byCommand?.['message.device.alarm'] ?? 0}</Typography></CardContent></Card>
          <Card><CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}><Typography variant="caption" color="text.secondary">{getCommandLabel('message.device.managed', language)}</Typography><Typography variant="h5">{stats?.byCommand?.['message.device.managed'] ?? 0}</Typography></CardContent></Card>
        </Box>

        <Card sx={{ mb: 2 }}>
          <CardContent sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 180px auto' }, gap: 1.5 }}>
            <TextField
              size="small"
              label={t('alarm.filter.keyword')}
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
            />
            <FormControl size="small">
              <InputLabel>{t('alarm.filter.command')}</InputLabel>
              <Select label={t('alarm.filter.command')} value={command} onChange={(event) => { setCommand(event.target.value as EventCommand | ''); setPage(1) }}>
                <MenuItem value="">{t('common.all')}</MenuItem>
                <MenuItem value="message.device.alarm">{getCommandLabel('message.device.alarm', language)}</MenuItem>
                <MenuItem value="message.device.managed">{getCommandLabel('message.device.managed', language)}</MenuItem>
                <MenuItem value="message.device.cancelManaged">{getCommandLabel('message.device.cancelManaged', language)}</MenuItem>
                <MenuItem value="unknown">{getCommandLabel('unknown', language)}</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" onClick={handleSearch}>{t('common.search')}</Button>
          </CardContent>
        </Card>

        {loading && items.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}><CircularProgress /></Box>
        ) : items.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
            <NotificationsActive sx={{ fontSize: 72, color: '#B0BEC5', mb: 2 }} />
            <Typography>{t('alarm.empty')}</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {items.map(item => (
              <Card key={item.id} sx={{ '&:hover': { boxShadow: '0 4px 18px rgba(0,0,0,0.10)' } }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }} onClick={() => handleOpenDetail(item)}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                        <Chip size="small" color={item.command === 'message.device.alarm' ? 'error' : 'primary'} label={getCommandLabel(item.command, language)} />
                        <Typography variant="caption" color="text.secondary">{t('alarm.receivedAt')}: {formatTime(item.receivedAt, language)}</Typography>
                      </Box>
                      <Typography variant="subtitle1" fontWeight={600} noWrap>
                        {item.deviceName || item.alarmEventName || item.managedState || t('alarm.record')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        Device: {compactId(item.deviceId)} {item.alarmId ? ` / ${t('alarm.alarmId')}: ${item.alarmId}` : ''}
                      </Typography>
                      {item.alarmTime && (
                        <Typography variant="caption" color="text.secondary">
                          {t('alarm.alarmTime')}: {formatTime(item.alarmTime, language)}
                        </Typography>
                      )}
                    </Box>
                    <IconButton size="small" onClick={() => handleDelete(item)}>
                      <Delete sx={{ color: '#D32F2F' }} />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
          <Button disabled={page <= 1} onClick={() => setPage(page - 1)}>{t('common.prev')}</Button>
          <Typography variant="body2" color="text.secondary">{page} / {totalPages}</Typography>
          <Button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>{t('common.next')}</Button>
        </Box>
      </Container>

      <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, bgcolor: 'background.paper', borderTop: '1px solid #E0E0E0' }}>
        <BottomNavigation value={1} showLabels>
          <BottomNavigationAction label={t('common.devices')} icon={<Videocam />} onClick={() => navigate('/')} />
          <BottomNavigationAction label={t('common.alarms')} icon={<NotificationsActive />} onClick={() => navigate('/alarms')} />
          <BottomNavigationAction label={t('common.settings')} icon={<Settings />} onClick={() => navigate('/settings')} />
        </BottomNavigation>
      </Box>

      <Dialog open={Boolean(detail)} onClose={() => setDetail(null)} fullWidth maxWidth="sm">
        <DialogTitle>{t('alarm.detail')}</DialogTitle>
        <DialogContent>
          {detail && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography variant="body2"><strong>{t('alarm.command')}:</strong> {getCommandLabel(detail.command, language)}</Typography>
              <Typography variant="body2"><strong>Device:</strong> {detail.deviceName || '-'} / {detail.deviceId || '-'}</Typography>
              {detail.alarmId && <Typography variant="body2"><strong>{t('alarm.alarmId')}:</strong> {detail.alarmId}</Typography>}
              {detail.alarmTime && <Typography variant="body2"><strong>{t('alarm.alarmTime')}:</strong> {formatTime(detail.alarmTime, language)}</Typography>}
              <Typography variant="body2"><strong>{t('alarm.receivedAt')}:</strong> {formatTime(detail.receivedAt, language)}</Typography>
              {detail.recordResUrl && isSafeUrl(detail.recordResUrl) && (
                <Button variant="outlined" href={detail.recordResUrl} target="_blank" rel="noopener noreferrer">{t('alarm.openRecord')}</Button>
              )}
              {detail.recordSubResUrl && isSafeUrl(detail.recordSubResUrl) && (
                <Button variant="outlined" href={detail.recordSubResUrl} target="_blank" rel="noopener noreferrer">{t('alarm.openSubRecord')}</Button>
              )}
              <Divider />
              <Typography variant="subtitle2">{t('alarm.rawPayload')}</Typography>
              <Box component="pre" sx={{ bgcolor: '#F5F5F5', p: 1.5, borderRadius: 1, overflow: 'auto', fontSize: 12, maxHeight: 320 }}>
                {formatRawPayload(detail.rawPayload)}
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={toast.severity} onClose={() => setToast(p => ({ ...p, open: false }))}>{toast.msg}</Alert>
      </Snackbar>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </Box>
  )
}
