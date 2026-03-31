export interface DeviceCredentials {
  username: string
  password: string
}

export interface RemoteAddr {
  remote_addr: string
  port: string
  username: string
  password: string
}

export interface DeviceConnection {
  httpAddr?: RemoteAddr    // HTTP/API端口 (443)
  rtspAddr?: RemoteAddr    // RTSP视频流端口 (554)
}

export interface DeviceInfo {
  id: string
  name: string
  type?: string
  credentials: DeviceCredentials
  connection?: DeviceConnection
  lastConnected?: string
  online?: boolean
}

export interface DeviceStatus {
  info: { mac: string; version: string; releasedate: string; model: string }
  wifi: { mode: string; ssid: string; rssi: number }
  network: { idhcp: boolean; address: string; submask: string; gateway: string; dns: string; httpport: number; httpsport: number }
  tfcard: { exist: boolean; totalsum: number; freesum: number }
  time: { timezone: string; datatime: string }
  mirror: string
  vionoff: string
  irMode: string
  ledStatus: string
  motionDetection: { enabled: boolean; sensitivity: number; range: string }
  humanDetection: { enabled: boolean; whistleEnabled: boolean; alarmlightEnabled: boolean }
  recordConfig: { recordstream: string; prerecord: number; redundancy: boolean; recordcontrol: string }
}

export interface VolumeConfig {
  talk: { max_level: number; min_level: number; level: number }
  prompt: { max_level: number; min_level: number; level: number }
  keypad?: { max_level: number; min_level: number; level: number }
}

export interface AlarmDetailInfo {
  alarmtype: number
  config: { channel: { id: number; enabled: number; sensitivity: number; max_sensitivity: number; interval: { value: number; range: number[] }; schedule_mode: string; smart_filter: { peds: number } } }
}

export interface RecordSchedule {
  schedule: Array<{ week: string; time: Array<{ section: string; enabled: number; start: string; end: string }> }>
}

export interface NetworkConfig {
  idhcp: boolean; address: string; submask: string; gateway: string; dns: string; secondarydns: string; httpport: number; httpsport: number
}

export interface FpsMode { mode: number }
export interface ImageFlip { mode: number }
export interface DeviceTime { timezone: string; datatime: string }
