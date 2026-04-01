import React, { createContext, useContext, useReducer, useEffect, useState, type ReactNode } from 'react'
import type { DeviceInfo } from '../types/device'
import { loadDevices, saveDevices } from '../utils/storage'
import { connectToDevice } from '../api/cloud-api'
import { MockCloudApiClient } from '../api/mock-api'

interface DeviceState {
  devices: DeviceInfo[]
  loading: boolean
  error: string | null
}

type DeviceAction =
  | { type: 'SET_DEVICES'; payload: DeviceInfo[] }
  | { type: 'ADD_DEVICE'; payload: DeviceInfo }
  | { type: 'REMOVE_DEVICE'; payload: string }
  | { type: 'UPDATE_DEVICE'; payload: DeviceInfo }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }

function reducer(state: DeviceState, action: DeviceAction): DeviceState {
  switch (action.type) {
    case 'SET_DEVICES':
      return { ...state, devices: action.payload }
    case 'ADD_DEVICE':
      return { ...state, devices: [...state.devices, action.payload] }
    case 'REMOVE_DEVICE':
      return { ...state, devices: state.devices.filter(d => d.id !== action.payload) }
    case 'UPDATE_DEVICE':
      return { ...state, devices: state.devices.map(d => d.id === action.payload.id ? action.payload : d) }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    default:
      return state
  }
}

interface DeviceContextValue {
  state: DeviceState
  demoMode: boolean
  toggleDemoMode: () => void
  addDevice: (device: DeviceInfo) => Promise<void>
  removeDevice: (id: string) => void
  updateDevice: (device: DeviceInfo) => void
  refreshConnection: (deviceId: string) => Promise<void>
  getDevice: (id: string) => DeviceInfo | undefined
}

const DeviceContext = createContext<DeviceContextValue | null>(null)

const DEFAULT_API_KEY_SECRET = 'ApiKey kE3FMfbjVYE8QkwkpyFh2Tfn:crow'
const DEFAULT_DEMO_DEVICE: DeviceInfo = {
  id: 'TTksg8guvxrx',
  name: 'demo',
  type: 'ipc',
  credentials: {
    username: 'admin',
    password: 'admin',
  },
  online: false,
}

export function DeviceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    devices: [],
    loading: false,
    error: null,
  })
  const [demoMode, setDemoMode] = useState(false)
  const mockCloudApi = new MockCloudApiClient()

  useEffect(() => {
    // 1. 初始化默认 API Key
    const savedApiKey = localStorage.getItem('qv_api_key_secret')
    if (!savedApiKey) {
      localStorage.setItem('qv_api_key_secret', DEFAULT_API_KEY_SECRET)
    }

    // 2. 加载设备并添加默认 demo 设备
    const stored = loadDevices()
    const hasDemoDevice = stored.some(d => d.id === DEFAULT_DEMO_DEVICE.id)
    
    let finalDevices = stored
    if (!hasDemoDevice) {
      finalDevices = [DEFAULT_DEMO_DEVICE, ...stored]
    }
    
    dispatch({ type: 'SET_DEVICES', payload: finalDevices })

    // 3. 自动为所有设备（包括 demo 设备）尝试连接/刷新状态
    const refreshAll = async () => {
      for (const device of finalDevices) {
        // 这里不使用 await 以免阻塞页面显示，但逐个触发刷新
        refreshConnection(device.id).catch(console.error)
      }
    }
    refreshAll()
  }, [])

  useEffect(() => {
    saveDevices(state.devices)
  }, [state.devices])

  const addDevice = async (device: DeviceInfo) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'SET_ERROR', payload: null })
    try {
      let connection
      if (demoMode) {
        // 演示模式：使用模拟数据
        connection = await mockCloudApi.connectToDevice(device.credentials, device.id)
      } else {
        // 真实模式：调用真实 API
        // 从localStorage获取预设的API Key
        const savedApiKey = localStorage.getItem('qv_api_key_secret')
        if (!savedApiKey) {
          throw new Error('请在设置页面配置API Key')
        }
        
        // 解析API Key格式: "ApiKey kE3FMfbjVYE8QkwkpyFh2Tfn:crow"
        const trimmed = savedApiKey.trim()
        const parts = trimmed.split(' ')
        
        if (parts.length >= 2 && parts[0] === 'ApiKey') {
          const rest = parts.slice(1).join(' ')
          const keyParts = rest.split(':')
          
          if (keyParts.length >= 2) {
            const apiKeyId = keyParts[0]
            const apiKeySecret = keyParts.slice(1).join(':')
            connection = await connectToDevice(apiKeyId, apiKeySecret, device.id, device.credentials)
          } else {
            throw new Error('API Key格式不正确')
          }
        } else {
          throw new Error('API Key格式不正确')
        }
      }
      device.connection = connection
      device.online = true
      device.lastConnected = new Date().toISOString()
      dispatch({ type: 'ADD_DEVICE', payload: device })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Connection failed'
      dispatch({ type: 'SET_ERROR', payload: msg })
      throw err
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const removeDevice = (id: string) => {
    dispatch({ type: 'REMOVE_DEVICE', payload: id })
  }

  const updateDevice = (device: DeviceInfo) => {
    dispatch({ type: 'UPDATE_DEVICE', payload: device })
  }

  const refreshConnection = async (deviceId: string) => {
    const device = state.devices.find(d => d.id === deviceId)
    if (!device) return
    try {
      let connection
      if (demoMode) {
        connection = await mockCloudApi.connectToDevice(device.credentials, device.id)
      } else {
        // 从localStorage获取预设的API Key
        const savedApiKey = localStorage.getItem('qv_api_key_secret')
        if (!savedApiKey) {
          throw new Error('请在设置页面配置API Key')
        }
        
        // 解析API Key格式
        const trimmed = savedApiKey.trim()
        const parts = trimmed.split(' ')
        
        if (parts.length >= 2 && parts[0] === 'ApiKey') {
          const rest = parts.slice(1).join(' ')
          const keyParts = rest.split(':')
          
          if (keyParts.length >= 2) {
            const apiKeyId = keyParts[0]
            const apiKeySecret = keyParts.slice(1).join(':')
            connection = await connectToDevice(apiKeyId, apiKeySecret, device.id, device.credentials)
          } else {
            throw new Error('API Key格式不正确')
          }
        } else {
          throw new Error('API Key格式不正确')
        }
      }
      const updated = { ...device, connection, online: true, lastConnected: new Date().toISOString() }
      dispatch({ type: 'UPDATE_DEVICE', payload: updated })
    } catch {
      const updated = { ...device, online: false }
      dispatch({ type: 'UPDATE_DEVICE', payload: updated })
    }
  }

  const getDevice = (id: string) => state.devices.find(d => d.id === id)

  const toggleDemoMode = () => {
    const newMode = !demoMode
    setDemoMode(newMode)
    if (newMode) {
      // 切换到演示模式时，添加一个演示设备
      const demoDevice = {
        id: 'demo-device-001',
        name: '演示设备（客厅）',
        type: 'ipc',
        credentials: {
          username: 'admin',
          password: '123456',
        },
        connection: {
          httpAddr: {
            remote_addr: 'demo-http.qvcloud.net',
            port: '443',
            username: 'admin',
            password: '123456',
          },
          rtspAddr: {
            remote_addr: 'demo-rtsp.qvcloud.net',
            port: '554',
            username: 'admin',
            password: '123456',
          }
        },
        online: true,
        lastConnected: new Date().toISOString(),
      } as DeviceInfo
      if (!state.devices.find(d => d.id === demoDevice.id)) {
        dispatch({ type: 'ADD_DEVICE', payload: demoDevice })
      }
    }
  }

  return (
    <DeviceContext.Provider value={{ 
      state, 
      demoMode, 
      toggleDemoMode,
      addDevice, 
      removeDevice, 
      updateDevice, 
      refreshConnection, 
      getDevice 
    }}>
      {children}
    </DeviceContext.Provider>
  )
}

export function useDeviceContext(): DeviceContextValue {
  const ctx = useContext(DeviceContext)
  if (!ctx) throw new Error('useDeviceContext must be used within DeviceProvider')
  return ctx
}
