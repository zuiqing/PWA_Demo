export type EventCommand =
  | 'message.device.alarm'
  | 'message.device.managed'
  | 'message.device.cancelManaged'
  | 'unknown'

export interface AlarmEventRecord {
  id: string
  command: EventCommand
  deviceId?: string
  deviceName?: string
  alarmEvent?: number
  alarmEventName?: string
  alarmId?: string
  alarmTime?: string
  alarmUniqueId?: string
  alarmState?: number
  alarmIfRecord?: number
  recordResUrl?: string
  recordSubResUrl?: string
  managedMessageId?: string
  managedState?: string
  receivedAt: string
  rawPayload: string
}

export interface EventListResponse {
  items: AlarmEventRecord[]
  page: number
  pageSize: number
  offset: number
  limit: number
  total: number
}

export interface EventStats {
  total: number
  today: number
  byAlarmState: Record<string, number>
  byCommand: Record<string, number>
}

export interface EventQuery {
  page?: number
  pageSize?: number
  deviceId?: string
  command?: EventCommand | ''
  alarmState?: number | ''
  keyword?: string
}
