import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AppBar, Toolbar, Typography, Container, Box, TextField,
  Button, Snackbar, Alert, Card, CardContent, IconButton,
} from '@mui/material'
import { ArrowBack, Save, Key } from '@mui/icons-material'

const DEFAULT_API_KEY_SECRET = 'ApiKey kE3FMfbjVYE8QkwkpyFh2Tfn:crow'

export default function SettingsPage() {
  const navigate = useNavigate()
  const [apiKeySecret, setApiKeySecret] = useState('')
  const [toast, setToast] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({ open: false, msg: '', severity: 'success' })

  useEffect(() => {
    // 加载保存的 API Key Secret
    const saved = localStorage.getItem('qv_api_key_secret')
    if (saved) {
      setApiKeySecret(saved)
    } else {
      // 如果没有保存的，使用默认值
      setApiKeySecret(DEFAULT_API_KEY_SECRET)
    }
  }, [])

  const handleSave = () => {
    try {
      localStorage.setItem('qv_api_key_secret', apiKeySecret)
      setToast({ open: true, msg: 'API Key Secret 已保存', severity: 'success' })
    } catch (err) {
      setToast({ open: true, msg: '保存失败', severity: 'error' })
    }
  }

  const handleReset = () => {
    setApiKeySecret(DEFAULT_API_KEY_SECRET)
    setToast({ open: true, msg: '已重置为默认值', severity: 'success' })
  }

  // API Key Secret 格式: "ApiKey kE3FMfbjVYE8QkwkpyFh2Tfn:crow"
  // 直接作为 Authorization Header 使用，不需要拆分

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="fixed" elevation={0} sx={{ background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 100%)' }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => navigate(-1)} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>应用设置</Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ flex: 1, pt: 10, pb: 4, overflow: 'auto' }}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Key sx={{ color: '#1565C0' }} />
              <Typography variant="subtitle1" fontWeight={600}>API 密钥配置</Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              预设的 API Key Secret 将用于添加新设备时自动填充
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="API Key Secret"
              value={apiKeySecret}
              onChange={(e) => setApiKeySecret(e.target.value)}
              placeholder="格式: ApiKey kE3FMfbjVYE8QkwkpyFh2Tfn:crow"
              helperText="完整的 Authorization Header 值"
              sx={{ mb: 2 }}
            />

            <Box sx={{ bgcolor: '#F5F5F5', p: 2, borderRadius: 1, mb: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                当前配置:
              </Typography>
              <Typography variant="body2" fontFamily="monospace" fontSize="12px">
                {apiKeySecret}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleReset}
                sx={{ flex: 1 }}
              >
                重置为默认
              </Button>
              <Button
                variant="contained"
                fullWidth
                startIcon={<Save />}
                onClick={handleSave}
                sx={{ flex: 1 }}
              >
                保存配置
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              使用说明
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              1. 在此处设置默认的 API Key Secret
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              2. 添加新设备时，API Key Secret 字段会自动填充此值
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              3. 如果需要使用不同的密钥，可以在添加设备时手动修改
            </Typography>
            <Typography variant="body2" color="text.secondary">
              4. 配置保存在浏览器本地存储中
            </Typography>
          </CardContent>
        </Card>
      </Container>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast(p => ({ ...p, open: false }))}>
        <Alert severity={toast.severity} onClose={() => setToast(p => ({ ...p, open: false }))}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  )
}