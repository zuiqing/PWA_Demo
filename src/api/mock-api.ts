import type { DeviceStatus, DeviceInfo, NetworkConfig, FpsMode, AlarmDetailInfo, RecordSchedule, DeviceConnection, DeviceCredentials } from '../types/device'

// 模拟设备数据
export const mockDeviceStatus: DeviceStatus = {
  info: {
    mac: '00:11:22:33:44:55',
    version: 'V2.1.8',
    releasedate: '2025-03-01',
    model: 'QV-IPC-1080P',
  },
  wifi: {
    mode: 'sta',
    ssid: 'Home-WiFi',
    rssi: -65,
  },
  network: {
    idhcp: false,
    address: '192.168.1.100',
    submask: '255.255.255.0',
    gateway: '192.168.1.1',
    dns: '8.8.8.8',
    httpport: 80,
    httpsport: 443,
  },
  tfcard: {
    exist: true,
    totalsum: 64,
    freesum: 46,
  },
  time: {
    timezone: 'Asia/Shanghai',
    datatime: new Date().toISOString().replace('T', ' ').substring(0, 19),
  },
  mirror: 'off',
  vionoff: 'on',
  irMode: 'auto',
  ledStatus: 'off',
  motionDetection: {
    enabled: true,
    sensitivity: 80,
    range: 'all',
  },
  humanDetection: {
    enabled: false,
    whistleEnabled: false,
    alarmlightEnabled: false,
  },
  recordConfig: {
    recordstream: 'main',
    prerecord: 5,
    redundancy: false,
    recordcontrol: 'manual',
  },
}

export const mockNetworkConfig: NetworkConfig = {
  idhcp: false,
  address: '192.168.1.100',
  submask: '255.255.255.0',
  gateway: '192.168.1.1',
  dns: '8.8.8.8',
  secondarydns: '8.8.4.4',
  httpport: 80,
  httpsport: 443,
}

export const mockFpsMode: FpsMode = {
  mode: 0,
}

export const mockAlarmConfig: AlarmDetailInfo = {
  alarmtype: 1,
  config: { channel: { id: 0, enabled: 1, sensitivity: 80, max_sensitivity: 100, interval: { value: 5, range: [1, 10] }, schedule_mode: 'always', smart_filter: { peds: 0 } } },
}

export const mockRecordSchedule: RecordSchedule = {
  schedule: [
    { week: 'monday', time: [{ section: '1', enabled: 1, start: '08:00', end: '18:00' }] },
    { week: 'tuesday', time: [{ section: '1', enabled: 1, start: '08:00', end: '18:00' }] },
    { week: 'wednesday', time: [{ section: '1', enabled: 1, start: '08:00', end: '18:00' }] },
    { week: 'thursday', time: [{ section: '1', enabled: 1, start: '08:00', end: '18:00' }] },
    { week: 'friday', time: [{ section: '1', enabled: 1, start: '08:00', end: '18:00' }] },
    { week: 'saturday', time: [{ section: '1', enabled: 0, start: '00:00', end: '00:00' }] },
    { week: 'sunday', time: [{ section: '1', enabled: 0, start: '00:00', end: '00:00' }] },
  ],
}

// 模拟 API 客户端
export class MockDeviceApiClient {
  private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  async getDeviceStatus(ip: string, port: number, username: string, password: string): Promise<DeviceStatus> {
    await this.delay(800)
    return { ...mockDeviceStatus }
  }

  async getProductInfo(ip: string, port: number, username: string, password: string): Promise<DeviceInfo> {
    await this.delay(500)
    return {
      id: 'demo-device-001',
      name: '演示设备（客厅）',
      credentials: { username, password },
      connection: {
        httpAddr: { remote_addr: ip, port: port.toString(), username, password },
        rtspAddr: { remote_addr: '27.124.24.191', port: '55004', username: 'admin', password: 'admin' }
      },
      online: true,
      lastConnected: new Date().toISOString(),
    }
  }

  async getSystemInfo(ip: string, port: number, username: string, password: string) {
    await this.delay(500)
    return mockDeviceStatus.time
  }

  async getNetworkConfig(ip: string, port: number, username: string, password: string): Promise<NetworkConfig> {
    await this.delay(500)
    return mockNetworkConfig
  }

  async setNetworkConfig(ip: string, port: number, username: string, password: string, config: NetworkConfig): Promise<boolean> {
    await this.delay(800)
    console.log('模拟设置网络配置:', config)
    return true
  }

  async getImageFlip(ip: string, port: number, username: string, password: string) {
    await this.delay(300)
    return { mode: mockDeviceStatus.mirror === 'on' ? 1 : 0 }
  }

  async setImageFlip(ip: string, port: number, username: string, password: string, enabled: boolean, mode?: string): Promise<boolean> {
    await this.delay(500)
    console.log('模拟设置图像翻转:', { enabled, mode })
    return true
  }

  async getAudioVolume(ip: string, port: number, username: string, password: string) {
    await this.delay(300)
    return { talk: { max_level: 12, min_level: 0, level: 3 }, prompt: { max_level: 12, min_level: 0, level: 3 } }
  }

  async setAudioVolume(ip: string, port: number, username: string, password: string, volume: number, muted?: boolean): Promise<boolean> {
    await this.delay(500)
    console.log('模拟设置音量:', { volume, muted })
    return true
  }

  async getFpsMode(ip: string, port: number, username: string, password: string): Promise<FpsMode> {
    await this.delay(300)
    return mockFpsMode
  }

  async setFpsMode(ip: string, port: number, username: string, password: string, mode: string): Promise<boolean> {
    await this.delay(500)
    console.log('模拟设置帧率模式:', mode)
    return true
  }

  async getAlarmConfig(ip: string, port: number, username: string, password: string): Promise<AlarmDetailInfo> {
    await this.delay(500)
    return mockAlarmConfig
  }

  async setAlarmConfig(ip: string, port: number, username: string, password: string, config: AlarmDetailInfo): Promise<boolean> {
    await this.delay(800)
    console.log('模拟设置报警配置:', config)
    return true
  }

  async getRecordSchedule(ip: string, port: number, username: string, password: string): Promise<RecordSchedule> {
    await this.delay(500)
    return mockRecordSchedule
  }

  async setRecordSchedule(ip: string, port: number, username: string, password: string, schedule: RecordSchedule): Promise<boolean> {
    await this.delay(800)
    console.log('模拟设置录像计划:', schedule)
    return true
  }

  async rebootDevice(ip: string, port: number, username: string, password: string): Promise<boolean> {
    await this.delay(1500)
    console.log('模拟重启设备')
    return true
  }

  async factoryReset(ip: string, port: number, username: string, password: string): Promise<boolean> {
    await this.delay(2000)
    console.log('模拟恢复出厂设置')
    return true
  }
}

// 模拟云 API
export class MockCloudApiClient {
  private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  async getAuthorizationAddress(apiKeyId: string, apiKeySecret: string, deviceId: string): Promise<{ remote_addr: string; port: string; username: string; password: string }> {
    await this.delay(1200)
    return {
      remote_addr: '192.168.1.100',
      port: '80',
      username: 'admin',
      password: '123456',
    }
  }

  async connectToDevice(credentials: DeviceCredentials, deviceId: string): Promise<DeviceConnection> {
    await this.delay(1500)
    return {
      httpAddr: {
        remote_addr: 'demo-http.qvcloud.net',
        port: '443',
        username: credentials.username,
        password: credentials.password,
      },
      rtspAddr: {
        remote_addr: '27.124.24.191',
        port: '55004',
        username: 'admin',
        password: 'admin',
      }
    }
  }
}