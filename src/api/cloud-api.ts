import axios from 'axios'
import type { CloudApiResponse } from '../types/api'
import type { RemoteAddr, DeviceConnection, DeviceCredentials } from '../types/device'

const CLOUD_API_BASE = '/api/cloud'

function buildAuthorization(apiKeyId: string, apiKeySecret: string): string {
  return `ApiKey ${apiKeyId}:${apiKeySecret}`
}

async function getPortAuthorization(
  apiKeyId: string,
  apiKeySecret: string,
  deviceId: string,
  port: string
): Promise<RemoteAddr> {
  console.log('getPortAuthorization called with:', { apiKeyId, deviceId, port })
  
  const res = await axios.post<CloudApiResponse>(
    `${CLOUD_API_BASE}/dev_exe_cmd`,
    {
      header: {
        flag: 'tdkcloud',
        version: 'v1.1',
        command: 'proxy-dev-port',
        client: { id: 'test', type: 'server', oem: 'A0000' },
      },
      content: { port, devid: deviceId },
    },
    {
      headers: {
        Authorization: buildAuthorization(apiKeyId, apiKeySecret),
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    }
  )

  console.log('API Response:', res.data)
  
  if (res.data.code !== 0 || !res.data.data) {
    const errMsg = res.data.errTip || res.data.msg || 'Failed to get authorization address'
    throw new Error(`Error code ${res.data.code}: ${errMsg}`)
  }

  const remoteAddr = res.data.data.remote_addr
  console.log('remote_addr from API:', remoteAddr)
  console.log('Type of remote_addr:', typeof remoteAddr)
  console.log('Requested port:', port)
  
  // 验证remote_addr格式
  if (!remoteAddr || typeof remoteAddr !== 'string') {
    console.error('Invalid remote_addr:', remoteAddr)
    throw new Error('Invalid remote address returned from API')
  }
  
  // 根据端口类型处理remote_addr
  let finalRemoteAddr = remoteAddr
  const portNum = parseInt(port)
  
  // 首先检查是否已经包含协议
  const hasProtocol = remoteAddr.startsWith('http://') || remoteAddr.startsWith('https://')
  console.log('Has protocol prefix?', hasProtocol)
  
  if (portNum === 443) {
    // HTTP/HTTPS API地址 - API应该返回完整的URL（包括协议）
    // 我们不需要做任何处理，直接使用API返回的值
    console.log('Using API returned address for port 443:', finalRemoteAddr)
  } else if (portNum === 554) {
    // RTSP流地址 - 不应该有http/https前缀，应该是IP:PORT格式
    // 移除可能存在的协议前缀
    if (hasProtocol) {
      finalRemoteAddr = remoteAddr.replace(/^https?:\/\//, '')
      console.log('Removed protocol prefix for RTSP address:', finalRemoteAddr)
    }
  } else {
    console.log('Using raw remote_addr for port', port, ':', finalRemoteAddr)
  }
  
  return {
    remote_addr: finalRemoteAddr,
    port: port,
    username: '',  // 设备用户名从设备凭证获取
    password: ''   // 设备密码从设备凭证获取
  }
}

export async function connectToDevice(
  apiKeyId: string,
  apiKeySecret: string,
  deviceId: string,
  credentials: DeviceCredentials
): Promise<DeviceConnection> {
  try {
    // 同时获取HTTP API端口 (443) 和 RTSP端口 (554)
    const [httpAddr, rtspAddr] = await Promise.all([
      getPortAuthorization(apiKeyId, apiKeySecret, deviceId, '443'),
      getPortAuthorization(apiKeyId, apiKeySecret, deviceId, '554')
    ])
    
    // 添加设备凭证信息
    // CGI访问使用用户的凭证（SHA256加密后）
    httpAddr.username = credentials.username
    httpAddr.password = credentials.password
    
    // RTSP拉流使用固定用户名admin，密码使用用户输入的原始密码
    rtspAddr.username = 'admin'
    rtspAddr.password = credentials.rawPassword ?? credentials.password
    
    return {
      httpAddr,
      rtspAddr
    }
  } catch (err) {
    throw new Error(`Connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
  }
}
