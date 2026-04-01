import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AppBar, Toolbar, Typography, Container, Box, IconButton,
  Button, Card, CardContent, TextField, Select, MenuItem,
  FormControl, InputLabel, Snackbar, Alert, CircularProgress,
  Divider,
} from '@mui/material'
import { ArrowBack, Send, Code, DeviceHub } from '@mui/icons-material'
import { useDeviceContext } from '../context/DeviceContext'
import { DeviceApiClient } from '../api/device-api'
import { parseXmlResponse } from '../utils/xml-parser'
import type { DeviceInfo } from '../types/device'

type MessageFormat = 'json' | 'xml'

export default function CgiDebugPage() {
  const navigate = useNavigate()
  const { state } = useDeviceContext()

  // 状态
  const [selectedDevice, setSelectedDevice] = useState<string>('')
  const [messageFormat, setMessageFormat] = useState<MessageFormat>('json')
  const [requestBody, setRequestBody] = useState<string>('')
  const [responseBody, setResponseBody] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [snackbar, setSnackbar] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({
    open: false,
    msg: '',
    severity: 'success'
  })

  // 获取选中的设备
  const selectedDeviceInfo = state.devices.find(d => d.id === selectedDevice)

  // 发送CGI请求
  const handleSend = async () => {
    if (!selectedDeviceInfo?.connection?.httpAddr) {
      setError('请先选择一个设备')
      setSnackbar({ open: true, msg: '请先选择一个设备', severity: 'error' })
      return
    }

    if (!requestBody.trim()) {
      setError('请输入CGI请求内容')
      setSnackbar({ open: true, msg: '请输入CGI请求内容', severity: 'error' })
      return
    }

    setLoading(true)
    setError('')
    setResponseBody('')

    try {
      const conn = selectedDeviceInfo.connection.httpAddr
      const client = new DeviceApiClient(
        conn,
        selectedDeviceInfo.credentials.username,
        selectedDeviceInfo.credentials.password
      )

      let result: Record<string, unknown>

      if (messageFormat === 'json') {
        // JSON格式请求
        const parsed = JSON.parse(requestBody)
        const command = parsed.body?.command || parsed.command || ''
        const content = parsed.body?.content || parsed.content || {}

        console.log(`[CGI Debug] Sending JSON command: ${command}`)
        result = await client.sendCommand(command, content)
      } else {
        // XML格式请求
        console.log('[CGI Debug] Sending XML request')
        console.log('[CGI Debug] XML body:', requestBody)
        result = await client.sendRawXml(requestBody)
      }

      // 格式化响应
      const formattedResponse = JSON.stringify(result, null, 2)
      setResponseBody(formattedResponse)
      setSnackbar({ open: true, msg: '请求发送成功', severity: 'success' })
    } catch (err) {
      console.error('[CGI Debug] Error:', err)
      const errorMsg = err instanceof Error ? err.message : '发送失败'
      setError(errorMsg)
      setResponseBody(`错误: ${errorMsg}`)
      setSnackbar({ open: true, msg: errorMsg, severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  // 清除响应
  const handleClear = () => {
    setRequestBody('')
    setResponseBody('')
    setError('')
  }

  // 示例JSON模板
  const exampleJson = `{
  "header": {
    "security": "username",
    "username": "admin",
    "password": "admin",
    "passwordencode": "1"
  },
  "body": {
    "command": "get.device.status",
    "content": {}
  }
}`

  // 示例XML模板
  const exampleXml = `<?xml version="1.0" encoding="utf-8"?>
<envelope>
    <header>
        <security>username</security>
        <username>admin</username>
        <password>admin</password>
    </header>
    <body>
        <command>get.device.status</command>
        <content></content>
    </body>
</envelope>`

  // 根据当前格式返回示例
  const currentExample = messageFormat === 'json' ? exampleJson : exampleXml

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="fixed" elevation={0} sx={{ background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 100%)' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/')}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            CGI 调试工具
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ flex: 1, pt: 10, pb: 4, overflow: 'auto' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* 设备选择 */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <DeviceHub sx={{ color: '#1565C0' }} />
                <Typography variant="subtitle1" fontWeight={600}>目标设备</Typography>
              </Box>
              <FormControl fullWidth size="small">
                <InputLabel>选择设备</InputLabel>
                <Select
                  value={selectedDevice}
                  label="选择设备"
                  onChange={(e) => setSelectedDevice(e.target.value)}
                >
                  {state.devices.length === 0 ? (
                    <MenuItem value="" disabled>暂无设备，请先添加设备</MenuItem>
                  ) : (
                    state.devices.map((device) => (
                      <MenuItem key={device.id} value={device.id}>
                        {device.name} ({device.id})
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
              {selectedDeviceInfo && (
                <Box sx={{ mt: 2, p: 1.5, bgcolor: '#F5F5F5', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    设备地址: {selectedDeviceInfo.connection?.httpAddr?.remote_addr || '未连接'}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* 消息格式和输入 */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Code sx={{ color: '#9C27B0' }} />
                <Typography variant="subtitle1" fontWeight={600}>请求内容</Typography>
              </Box>

              {/* 格式选择 */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Button
                  variant={messageFormat === 'json' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setMessageFormat('json')}
                >
                  JSON
                </Button>
                <Button
                  variant={messageFormat === 'xml' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setMessageFormat('xml')}
                >
                  XML
                </Button>
              </Box>

              {/* 请求输入 */}
              <TextField
                label="CGI 请求内容"
                multiline
                rows={10}
                fullWidth
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                placeholder={currentExample}
                sx={{ mb: 2 }}
                InputProps={{
                  style: { fontFamily: 'monospace', fontSize: '12px' }
                }}
              />

              {/* 操作按钮 */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                  onClick={handleSend}
                  disabled={loading || !selectedDevice || !requestBody.trim()}
                >
                  {loading ? '发送中...' : '发送'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleClear}
                  disabled={loading}
                >
                  清除
                </Button>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setRequestBody(currentExample)}
                >
                  填充示例
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* 响应显示 */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Code sx={{ color: '#4CAF50' }} />
                  <Typography variant="subtitle1" fontWeight={600}>响应结果</Typography>
                </Box>
                {responseBody && (
                  <Button
                    size="small"
                    onClick={() => navigator.clipboard.writeText(responseBody)}
                  >
                    复制
                  </Button>
                )}
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <TextField
                label="响应内容"
                multiline
                rows={10}
                fullWidth
                value={responseBody}
                InputProps={{
                  readOnly: true,
                  style: { fontFamily: 'monospace', fontSize: '12px' }
                }}
                placeholder="发送请求后，响应内容将显示在这里..."
              />
            </CardContent>
          </Card>

          {/* 提示信息 */}
          <Card sx={{ bgcolor: '#FFF3E0' }}>
            <CardContent>
              <Typography variant="subtitle2" color="warning.main" gutterBottom>
                使用说明
              </Typography>
              <Typography variant="body2" component="div" color="text.secondary">
                <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                  <li>首先选择一个已连接的设备</li>
                  <li>选择消息格式（JSON或XML）</li>
                  <li>在请求内容中输入CGI命令（可点击"填充示例"快速开始）</li>
                  <li>点击"发送"按钮发送请求</li>
                  <li>在下方查看设备返回的响应结果</li>
                </ul>
                <Divider sx={{ my: 1 }} />
                <Typography variant="caption" component="div">
                  <strong>常用命令：</strong><br />
                  • get.device.status - 获取设备状态<br />
                  • get.product.time - 获取设备时间<br />
                  • get.network.config - 获取网络配置<br />
                  • get.audio.outvolume - 获取音量配置<br />
                  • set.product.time - 设置设备时间
                </Typography>
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.msg}
        </Alert>
      </Snackbar>
    </Box>
  )
}
