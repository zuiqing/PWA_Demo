import axios from 'axios'
import type { DeviceCgiJsonBody, DeviceCgiResponse } from '../types/api'
import type { DeviceStatus, VolumeConfig, AlarmDetailInfo, RecordSchedule, NetworkConfig, FpsMode, ImageFlip, DeviceTime, RemoteAddr } from '../types/device'
import { parseXmlResponse, buildXmlRequest } from '../utils/xml-parser'

// CGI错误码定义
export const CGI_ERROR_NOT_SUPPORTED = -1 // 功能不支持

// 自定义错误类：功能不支持
export class FeatureNotSupportedError extends Error {
  constructor(message: string = 'This feature is not supported by the device') {
    super(message)
    this.name = 'FeatureNotSupportedError'
  }
}

const CGI_PATH = '/tdkcgi'
const CGI_TIMEOUT = 20000 // 20秒超时

const JSON_COMMANDS = new Set([
  'get.alarm.detailInfo', 'set.alarm.detailInfo',
  'get.record.schedule', 'set.record.schedule',
  'get.fps.mode', 'set.fps.mode',
  'get.image.flip', 'set.image.flip',
  'get.audio.outvolume', 'set.audio.outvolume',
  'get.system.info', 'set.subdevice.name',
])

export class DeviceApiClient {
  private remoteAddrObj: RemoteAddr
  private username: string
  private password: string

  constructor(remoteAddr: RemoteAddr, username: string, password: string) {
    // 验证参数是否有效
    if (!remoteAddr) {
      throw new Error('Device remote address is required')
    }
    if (!remoteAddr.remote_addr || remoteAddr.remote_addr.trim() === '') {
      throw new Error('Device remote address is empty')
    }
    if (!username || username.trim() === '') {
      throw new Error('Device username is required')
    }
    
    this.remoteAddrObj = remoteAddr
    this.username = username
    this.password = password
    console.log('DeviceApiClient constructor:', { remoteAddr, username, password: password ? '***' : 'empty' })
  }

  private buildUrl(): string {
    const remoteAddr = this.remoteAddrObj.remote_addr
    console.log('DeviceApiClient.buildUrl() original addr:', remoteAddr)
    
    // 验证设备地址是否有效
    if (!remoteAddr || remoteAddr.trim() === '') {
      throw new Error('Device remote address is empty or undefined')
    }
    
    // 验证地址格式（应该包含主机和端口）
    if (!remoteAddr.includes(':')) {
      throw new Error(`Invalid device address format: ${remoteAddr}. Expected format: host:port`)
    }
    
    // 移除协议前缀
    const hostPort = remoteAddr.replace(/^https?:\/\//, '')
    
    // 再次验证去除协议后的地址是否有效
    if (!hostPort || hostPort.trim() === '') {
      throw new Error('Invalid device address after removing protocol prefix')
    }
    
    // 开发环境和生产环境都使用代理路径
    // 开发环境：Vite代理会设置 secure: false 跳过SSL验证
    // 生产环境：Nginx代理会处理SSL证书问题
    const httpsUrl = `/api/device-proxy-https/${hostPort}${CGI_PATH}`
    const httpUrl = `/api/device-proxy-http/${hostPort}${CGI_PATH}`
    
    const isDev = import.meta.env.DEV
    console.log(`[${isDev ? 'DEV' : 'PROD'}] Using proxy URLs:`, { httpsUrl, httpUrl })
    
    return `${httpsUrl}||${httpUrl}`
  }

  private isJsonCommand(command: string): boolean {
    return JSON_COMMANDS.has(command)
  }

  async sendCommand(command: string, content: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const combined = this.buildUrl()
    const [httpsUrl, httpUrl] = combined.split('||')
    const urlsToTry = [httpsUrl, httpUrl].filter(Boolean)
    let lastErr: Error | null = null
    for (const url of urlsToTry) {
      try {
        if (this.isJsonCommand(command)) {
          return await this.sendJsonCommand(url, command, content)
        } else {
          return await this.sendXmlCommand(url, command, content)
        }
      } catch (e: any) {
        lastErr = e instanceof Error ? e : new Error(String(e))
        console.warn('sendCommand failed on url, will try next if available:', url, lastErr.message)
        continue
      }
    }
    throw lastErr ?? new Error('sendCommand failed on all proxy URLs')
  }

  private async sendXmlCommand(url: string, command: string, content: Record<string, unknown>): Promise<Record<string, unknown>> {
    const xmlBody = buildXmlRequest(this.username, this.password, command, content)
    console.log('Sending XML command to:', url, 'command:', command)
    console.log('Request body:', xmlBody)

    try {
      console.log('Using fetch to:', url)

      // 使用 AbortController 实现超时
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), CGI_TIMEOUT)

      // 尝试使用fetch，但需要处理SSL证书问题
      // 对于自签名证书，浏览器会拒绝，但我们可以尝试不同的方法
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
        },
        body: xmlBody,
        mode: 'cors', // 尝试cors模式
        credentials: 'omit',
        signal: controller.signal,
        // 注意：浏览器不允许在fetch中完全禁用SSL验证
        // 我们需要在开发环境中处理这个问题
      })

      clearTimeout(timeoutId)
      
      console.log('Fetch response status:', response.status, 'ok:', response.ok)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Fetch error response:', errorText)
        throw new Error(`HTTP error ${response.status}: ${errorText}`)
      }
      
      const responseText = await response.text()
      console.log('Fetch response text (first 500 chars):', responseText.substring(0, 500))

      const parsed = parseXmlResponse(responseText)
      const error = parsed.error as number

      // 特殊处理 error === -1，表示设备不支持该功能
      if (error === CGI_ERROR_NOT_SUPPORTED) {
        throw new FeatureNotSupportedError(`Command not supported: ${command}`)
      }

      if (error !== undefined && error !== 0) {
        throw new Error(`CGI error: ${error}`)
      }
      return parsed.content as Record<string, unknown> || {}
    } catch (error: any) {
      // 检查是否是超时错误
      if (error.name === 'AbortError') {
        throw new Error(`Request timed out after ${CGI_TIMEOUT / 1000} seconds`)
      }
      console.error('sendXmlCommand error details:', {
        url,
        command,
        errorMessage: error.message,
        errorName: error.name,
        errorStack: error.stack,
      })

      // 如果fetch失败，尝试使用XMLHttpRequest作为备选方案
      console.log('Fetch failed, trying XMLHttpRequest as fallback...')
      return this.sendXmlCommandWithXHR(url, command, xmlBody)
    }
  }

  private async sendJsonCommand(url: string, command: string, content: Record<string, unknown>): Promise<Record<string, unknown>> {
    const requestBody = {
      header: {
        security: 'username',
        username: this.username,
        password: this.password,
        passwordencode: "1" // 改为字符串 "1" 并默认启用
      },
      body: { command, content },
    }
    console.log('Sending JSON command to:', url, 'command:', command)
    console.log('Request body:', JSON.stringify(requestBody, null, 2))

    try {
      // 使用 AbortController 实现超时
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), CGI_TIMEOUT)

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        mode: 'cors',
        credentials: 'omit',
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      
      console.log('Fetch response status:', response.status, 'ok:', response.ok)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Fetch error response:', errorText)
        throw new Error(`HTTP error ${response.status}: ${errorText}`)
      }
      
      const jsonText = await response.text()
      console.log('Fetch response text:', jsonText)
      
      let responseData: any
      try {
        responseData = JSON.parse(jsonText)
      } catch (e) {
        throw new Error(`Invalid JSON response: ${jsonText.substring(0, 100)}`)
      }

      console.log('Parsed response data:', responseData)

      // 兼容两种结构：直接在根部的 body 或嵌套 of body
      const resBody = responseData.body || responseData
      const error = resBody.error !== undefined ? resBody.error : resBody.code

      // 特殊处理 error === -1，表示设备不支持该功能
      if (error === CGI_ERROR_NOT_SUPPORTED) {
        throw new FeatureNotSupportedError(`Command not supported: ${command}`)
      }

      if (error !== 0 && error !== undefined) {
        throw new Error(`CGI error: ${error}`)
      }
      return (resBody.content as Record<string, unknown>) || resBody.data || {}
    } catch (error: any) {
      // 检查是否是超时错误
      if (error.name === 'AbortError') {
        throw new Error(`Request timed out after ${CGI_TIMEOUT / 1000} seconds`)
      }
      console.error('sendJsonCommand error details:', {
        url,
        command,
        errorMessage: error.message,
        errorName: error.name,
        errorStack: error.stack,
      })
      throw error
    }
  }

  private sendXmlCommandWithXHR(url: string, command: string, xmlBody: string): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
      console.log('Using XMLHttpRequest to:', url)
      
      const xhr = new XMLHttpRequest()
      xhr.open('POST', url, true)
      xhr.setRequestHeader('Content-Type', 'application/xml')
      
      // 设置超时
      xhr.timeout = CGI_TIMEOUT
      
      xhr.onload = () => {
        console.log('XHR response status:', xhr.status, 'readyState:', xhr.readyState)
        
        if (xhr.status >= 200 && xhr.status < 300) {
          const responseText = xhr.responseText
          console.log('XHR response text (first 500 chars):', responseText.substring(0, 500))

          try {
            const parsed = parseXmlResponse(responseText)
            const error = parsed.error as number

            // 特殊处理 error === -1，表示设备不支持该功能
            if (error === CGI_ERROR_NOT_SUPPORTED) {
              reject(new FeatureNotSupportedError(`Command not supported: ${command}`))
            } else if (error !== undefined && error !== 0) {
              reject(new Error(`CGI error: ${error}`))
            } else {
              resolve(parsed.content as Record<string, unknown> || {})
            }
          } catch (parseError: any) {
            console.error('XHR parse error:', parseError)
            reject(new Error(`Failed to parse response: ${parseError.message}`))
          }
        } else {
          const errorText = xhr.responseText || 'No response text'
          console.error('XHR error response:', errorText)
          reject(new Error(`HTTP error ${xhr.status}: ${errorText}`))
        }
      }
      
      xhr.onerror = () => {
        console.error('XHR onerror called')
        reject(new Error('Network error or CORS policy blocked the request'))
      }
      
      xhr.ontimeout = () => {
        console.error('XHR timeout')
        reject(new Error(`Request timed out after ${CGI_TIMEOUT / 1000} seconds`))
      }
      
      xhr.send(xmlBody)
    })
  }

  async getDeviceStatus(): Promise<DeviceStatus> {
    console.log('getDeviceStatus called')
    const c = await this.sendCommand('get.device.status')
    const info = (c.info || {}) as Record<string, unknown>
    const wifi = (c.wifiinfo || {}) as Record<string, unknown>
    const network = (c.network || {}) as Record<string, unknown>
    const tfcard = (c.tfcard || {}) as Record<string, unknown>
    const time = (c.time || {}) as Record<string, unknown>
    const channel = (c.channel || {}) as Record<string, unknown>
    const md = (channel.motiondetection || c.motiondetection || {}) as Record<string, unknown>
    const hd = (c.humandetection || {}) as Record<string, unknown>
    const rc = (channel.recordconfig || c.recordconfig || {}) as Record<string, unknown>

    return {
      info: { 
        mac: (info.mac as string) || '', 
        version: (info.version as string) || '', 
        releasedate: (info.releasedate as string) || '', 
        model: (info.model as string) || '' 
      },
      wifi: { 
        mode: (wifi.mode as string) || '', 
        ssid: (wifi.ssid as string) || '', 
        rssi: parseInt(wifi.rssi as string) || 0 
      },
      network: { 
        idhcp: network.idhcp === 'true' || network.idhcp === true, 
        address: (network.address as string) || '', 
        submask: (network.submask as string) || '', 
        gateway: (network.gateway as string) || '', 
        dns: (network.dns as string) || '', 
        httpport: parseInt(network.httpport as string) || 80, 
        httpsport: parseInt(network.httpsport as string) || 443 
      },
      tfcard: { 
        exist: tfcard.exist === 'true' || tfcard.exist === true, 
        totalsum: parseInt(tfcard.totalsum as string) || 0, 
        freesum: parseInt(tfcard.freesum as string) || 0 
      },
      time: { 
        timezone: (time.timezone as string) || '', 
        datatime: (time.datatime as string) || '' 
      },
      mirror: (c.mirror as any)?.value || (c.mirror as string) || '', 
      vionoff: (c.vionoff as any)?.value || (c.vionoff as string) || '',
      irMode: ((c.IRMode as Record<string, unknown>)?.mode as string) || '',
      ledStatus: ((c.ledstatus as Record<string, unknown>)?.value as string) || '',
      motionDetection: { 
        enabled: md.enabled === 'true' || md.enabled === true || md.enabled === 1 || md.enabled === '1', 
        sensitivity: parseInt(md.sensitivity as string) || 3, 
        range: (md.range as string) || '' 
      },
      humanDetection: { 
        enabled: hd.enabled === 'true' || hd.enabled === true, 
        whistleEnabled: hd.whistle_enabled === 'true' || hd.whistle_enabled === true, 
        alarmlightEnabled: hd.alarmlight_enabled === 'true' || hd.alarmlight_enabled === true 
      },
      recordConfig: { 
        recordstream: (rc.recordstream as string) || 'main', 
        prerecord: parseInt(rc.prerecord as string) || 5, 
        redundancy: rc.redundancy === 'true' || rc.redundancy === true, 
        recordcontrol: (rc.recordcontrol as string) || 'schedule' 
      },
    }
  }

  async getProductTime(): Promise<DeviceTime> {
    const content = await this.sendCommand('get.product.time')
    const time = (content.time || {}) as Record<string, unknown>
    return { timezone: (time.timezone as string) || '', datatime: (time.datatime as string) || '' }
  }

  async setProductTime(timezone: string, datetime: string): Promise<void> {
    await this.sendCommand('set.product.time', { time: { timezone, datetime } })
  }

  async getImageFlip(): Promise<ImageFlip> {
    const content = await this.sendCommand('get.image.flip')
    return { mode: parseInt(content.mode as string) || 0 }
  }

  async setImageFlip(mode: number): Promise<void> {
    await this.sendCommand('set.image.flip', { mode })
  }

  async getVolume(): Promise<VolumeConfig> {
    const content = await this.sendCommand('get.audio.outvolume')
    return content as unknown as VolumeConfig
  }

  async setVolume(talkLevel: number, promptLevel: number, keypadLevel?: number): Promise<void> {
    const ct: Record<string, unknown> = { talk: { level: talkLevel }, prompt: { level: promptLevel } }
    if (keypadLevel !== undefined) ct.keypad = { level: keypadLevel }
    await this.sendCommand('set.audio.outvolume', ct)
  }

  async getNetworkConfig(): Promise<NetworkConfig> {
    const content = await this.sendCommand('get.network.config')
    const net = (content.network || {}) as Record<string, unknown>
    return { idhcp: net.idhcp === 'true', address: (net.address as string) || '', submask: (net.submask as string) || '', gateway: (net.gateway as string) || '', dns: (net.dns as string) || '', secondarydns: (net.secondarydns as string) || '', httpport: parseInt(net.httpport as string) || 80, httpsport: parseInt(net.httpsport as string) || 443 }
  }

  async setNetworkConfig(config: NetworkConfig): Promise<void> {
    await this.sendCommand('set.network.config', { network: { idhcp: String(config.idhcp), address: config.address, submask: config.submask, gateway: config.gateway, dns: config.dns, secondarydns: config.secondarydns, httpport: config.httpport, httpsport: config.httpsport } })
  }

  async getFpsMode(): Promise<FpsMode> {
    const content = await this.sendCommand('get.fps.mode')
    return { mode: parseInt(content.mode as string) || 0 }
  }

  async setFpsMode(mode: number): Promise<void> {
    await this.sendCommand('set.fps.mode', { mode })
  }

  async getAlarmDetail(alarmtype: number = 2, channelid: number = 1): Promise<AlarmDetailInfo> {
    const content = await this.sendCommand('get.alarm.detailInfo', { alarmtype, channelid })
    return content as unknown as AlarmDetailInfo
  }

  async setAlarmDetail(config: AlarmDetailInfo): Promise<void> {
    await this.sendCommand('set.alarm.detailInfo', config as unknown as Record<string, unknown>)
  }

  async getRecordSchedule(): Promise<RecordSchedule> {
    const content = await this.sendCommand('get.record.schedule')
    return content as unknown as RecordSchedule
  }

  async setRecordSchedule(schedule: RecordSchedule): Promise<void> {
    await this.sendCommand('set.record.schedule', schedule as unknown as Record<string, unknown>)
  }

  async reboot(): Promise<void> {
    await this.sendCommand('set.system.reboot')
  }

  async factoryReset(): Promise<void> {
    await this.sendCommand('set.system.config.default.restorefactory')
  }

  getRemoteAddr(): string {
    return this.remoteAddrObj.remote_addr
  }

  /**
   * 发送原始XML请求（用于调试）
   * @param xmlBody 原始XML字符串
   * @returns 解析后的响应内容
   */
  async sendRawXml(xmlBody: string): Promise<Record<string, unknown>> {
    const combined = this.buildUrl()
    const [httpsUrl, httpUrl] = combined.split('||')
    const urlsToTry = [httpsUrl, httpUrl].filter(Boolean)

    let lastErr: Error | null = null
    for (const url of urlsToTry) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/xml' },
          body: xmlBody,
          mode: 'cors',
          credentials: 'omit',
        })

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`)
        }

        const responseText = await response.text()
        const parsed = parseXmlResponse(responseText)
        const error = parsed.error as number

        if (error !== undefined && error !== 0) {
          throw new Error(`CGI error: ${error}`)
        }

        return parsed
      } catch (e: any) {
        lastErr = e instanceof Error ? e : new Error(String(e))
        console.warn('sendRawXml failed, trying next URL:', lastErr.message)
        continue
      }
    }

    throw lastErr ?? new Error('sendRawXml failed on all proxy URLs')
  }
}
