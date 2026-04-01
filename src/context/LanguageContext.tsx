import { useState, useEffect, createContext, useContext, ReactNode } from 'react'

type Language = 'en' | 'zh'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string>) => string
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Common
    'common.add': 'Add',
    'common.settings': 'Settings',
    'common.back': 'Back',
    'common.devices': 'Devices',

    // Device list page
    'device.list.title': 'Device List',
    'device.list.empty': 'No devices yet',
    'device.list.emptyHint': 'Click the button below to add your first IoT camera device',
    'device.list.addDevice': 'Add Device',
    'device.list.viewDevice': 'View Details',
    'device.list.deviceConfig': 'Device Config',
    'device.list.lastConnected': 'Last connected',
    'device.list.never': 'Never connected',
    'device.list.delete': 'Delete',
    'device.list.refresh': 'Refresh',
    'device.list.deleteConfirm': 'Are you sure you want to delete device {name}?',
    'device.list.added': 'Device {name} added successfully',
    'device.list.deleted': 'Device {name} deleted',
    'device.list.connectionRefreshed': 'Connection refreshed',

    // Settings page
    'app.settings': 'Settings',
    'api.title': 'API Key Configuration',
    'api.description': 'The default API Key Secret will be auto-filled when adding new devices',
    'api.label': 'API Key Secret',
    'api.placeholder': 'Format: ApiKey kE3FMfbjVYE8QkwkpyFh2Tfn:crow',
    'api.helper': 'Enter new API Key Secret',
    'api.show': 'Show Secret',
    'api.hide': 'Hide Secret',
    'api.defaultWarning': 'Default key cannot be viewed. Please change to a custom value first.',
    'api.savedConfig': 'Currently Saved Configuration:',
    'api.usingDefault': 'Using default configuration. Please contact technical support for your API Key Secret.',
    'api.reset': 'Reset to Default',
    'api.save': 'Save Configuration',
    'usage.title': 'Usage Instructions',
    'usage.step1': 'Set your default API Key Secret here',
    'usage.step2': 'API Key Secret will be auto-filled when adding new devices',
    'usage.step3': 'You can manually modify the key when adding different devices',
    'usage.step4': 'Configuration is stored in browser local storage',
    'doc.title': 'Device Protocol Documentation',
    'doc.description': 'View QV IoT Device Protocol documentation to learn about supported CGI commands',
    'doc.button': 'View Documentation',
    'toast.saved': 'API Key Secret saved',
    'toast.saveFailed': 'Failed to save',
    'toast.reset': 'Reset to default',

    // Device detail page
    'device.detail.title': 'Device Details',
    'device.detail.online': 'Online',
    'device.detail.offline': 'Offline',
    'device.detail.loading': 'Loading...',
    'device.detail.error': 'Failed to load device info',
    'device.detail.notSupported': 'This feature is not supported by this device',

    // Add device dialog
    'addDevice.title': 'Add Device',
    'addDevice.deviceId': 'Device ID *',
    'addDevice.deviceIdHint': 'Unique device identifier from QV platform',
    'addDevice.deviceName': 'Device Name',
    'addDevice.deviceNameHint': 'Custom name for easy identification',
    'addDevice.username': 'Device Username',
    'addDevice.usernameHint': 'Device login username, default is admin',
    'addDevice.password': 'Device Password',
    'addDevice.passwordHint': 'Device login password, default is admin',
    'addDevice.cancel': 'Cancel',
    'addDevice.adding': 'Adding...',
    'addDevice.add': 'Add',
    'addDevice.errorNoKey': 'Please configure API Key in Settings page',
    'addDevice.errorNoId': 'Please enter Device ID',

    // Error messages
    'error.connectionFailed': 'Connection failed',
    'error.deviceOffline': 'Device offline',
    'error.unknown': 'Unknown error',
    'error.authFailed': 'Authentication failed',
  },
  zh: {
    // Common
    'common.add': '添加',
    'common.settings': '设置',
    'common.back': '返回',
    'common.devices': '设备',

    // Device list page
    'device.list.title': '设备列表',
    'device.list.empty': '暂无设备',
    'device.list.emptyHint': '点击下方按钮添加您的第一个 IoT 摄像头设备',
    'device.list.addDevice': '添加设备',
    'device.list.viewDevice': '查看详情',
    'device.list.deviceConfig': '设备配置',
    'device.list.lastConnected': '最后连接',
    'device.list.never': '从未连接',
    'device.list.delete': '删除',
    'device.list.refresh': '刷新',
    'device.list.deleteConfirm': '确定删除设备 {name}？',
    'device.list.added': '设备 {name} 添加成功',
    'device.list.deleted': '设备 {name} 已删除',
    'device.list.connectionRefreshed': '连接已刷新',

    // Settings page
    'app.settings': '设置',
    'api.title': 'API 密钥配置',
    'api.description': '预设的 API Key Secret 将用于添加新设备时自动填充',
    'api.label': 'API Key Secret',
    'api.placeholder': '格式: ApiKey kE3FMfbjVYE8QkwkpyFh2Tfn:crow',
    'api.helper': '输入新的 API Key Secret',
    'api.show': '显示密钥',
    'api.hide': '隐藏密钥',
    'api.defaultWarning': '默认密钥不可查看，请先修改为自定义值',
    'api.savedConfig': '当前已保存的配置:',
    'api.usingDefault': '当前使用默认配置，请联系技术支持获取您的API Key Secret',
    'api.reset': '重置为默认',
    'api.save': '保存配置',
    'usage.title': '使用说明',
    'usage.step1': '在此处设置默认的 API Key Secret',
    'usage.step2': '添加新设备时，API Key Secret 字段会自动填充此值',
    'usage.step3': '如果需要使用不同的密钥，可以在添加设备时手动修改',
    'usage.step4': '配置保存在浏览器本地存储中',
    'doc.title': '设备协议文档',
    'doc.description': '查看 QV IoT 设备协议文档，了解支持的 CGI 命令',
    'doc.button': '查看文档',
    'toast.saved': 'API Key Secret 已保存',
    'toast.saveFailed': '保存失败',
    'toast.reset': '已重置为默认值',

    // Device detail page
    'device.detail.title': '设备详情',
    'device.detail.online': '在线',
    'device.detail.offline': '离线',
    'device.detail.loading': '加载中...',
    'device.detail.error': '加载设备信息失败',
    'device.detail.notSupported': '此设备不支持该功能',

    // Add device dialog
    'addDevice.title': '添加设备',
    'addDevice.deviceId': '设备 ID *',
    'addDevice.deviceIdHint': '设备的唯一ID，从QV平台获取',
    'addDevice.deviceName': '设备名称',
    'addDevice.deviceNameHint': '便于识别的设备名称',
    'addDevice.username': '设备用户名',
    'addDevice.usernameHint': '设备登录用户名，默认为admin',
    'addDevice.password': '设备密码',
    'addDevice.passwordHint': '设备登录密码，默认为admin',
    'addDevice.cancel': '取消',
    'addDevice.adding': '连接中...',
    'addDevice.add': '添加',
    'addDevice.errorNoKey': '请在设置页面配置API Key',
    'addDevice.errorNoId': '请填写设备ID',

    // Error messages
    'error.connectionFailed': '连接失败',
    'error.deviceOffline': '设备离线',
    'error.unknown': '未知错误',
    'error.authFailed': '认证失败',
  },
}

const LanguageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('qv_language')
    return (saved as Language) || 'en'
  })

  const setLanguage = (lang: Language) => {
    localStorage.setItem('qv_language', lang)
    setLanguageState(lang)
  }

  const t = (key: string, params?: Record<string, string>): string => {
    let text = translations[language][key] || key
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v)
      })
    }
    return text
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
