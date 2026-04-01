import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AppBar, Toolbar, Typography, Container, Box, TextField,
  Button, Snackbar, Alert, Card, CardContent, IconButton,
  ToggleButton, ToggleButtonGroup,
} from '@mui/material'
import { ArrowBack, Save, Key, Description, Language } from '@mui/icons-material'
import { useLanguage } from '../context/LanguageContext'

const DEFAULT_API_KEY_SECRET = 'ApiKey kE3FMfbjVYE8QkwkpyFh2Tfn:crow'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { language, setLanguage, t } = useLanguage()
  const [apiKeySecret, setApiKeySecret] = useState('')
  const [savedSecret, setSavedSecret] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const [toast, setToast] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({ open: false, msg: '', severity: 'success' })

  useEffect(() => {
    // 加载保存的 API Key Secret
    const saved = localStorage.getItem('qv_api_key_secret')
    if (saved && saved !== DEFAULT_API_KEY_SECRET) {
      // 只加载非默认密钥的值
      setApiKeySecret(saved)
      setSavedSecret(saved)
    } else {
      // 默认密钥或未保存，都显示为空
      setApiKeySecret('')
      setSavedSecret(saved || '')
    }
  }, [])

  const handleSave = () => {
    try {
      localStorage.setItem('qv_api_key_secret', apiKeySecret)
      setSavedSecret(apiKeySecret)
      setToast({ open: true, msg: t('toast.saved'), severity: 'success' })
    } catch (err) {
      setToast({ open: true, msg: t('toast.saveFailed'), severity: 'error' })
    }
  }

  const handleReset = () => {
    localStorage.setItem('qv_api_key_secret', DEFAULT_API_KEY_SECRET)
    setApiKeySecret('')
    setSavedSecret('')
    setToast({ open: true, msg: t('toast.reset'), severity: 'success' })
  }

  const isDefaultSecret = savedSecret === DEFAULT_API_KEY_SECRET

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="fixed" elevation={0} sx={{ background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 100%)' }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => navigate(-1)} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>{t('app.settings')}</Typography>
          <ToggleButtonGroup
            value={language}
            exclusive
            onChange={(_, value) => value && setLanguage(value)}
            size="small"
            sx={{
              bgcolor: 'rgba(255,255,255,0.1)',
              '& .MuiToggleButton-root': {
                color: 'rgba(255,255,255,0.7)',
                border: 'none',
                px: 1.5,
                py: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                },
              },
            }}
          >
            <ToggleButton value="en">EN</ToggleButton>
            <ToggleButton value="zh">中文</ToggleButton>
          </ToggleButtonGroup>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ flex: 1, pt: 10, pb: 4, overflow: 'auto' }}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Key sx={{ color: '#1565C0' }} />
              <Typography variant="subtitle1" fontWeight={600}>{t('api.title')}</Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('api.description')}
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={3}
              label={t('api.label')}
              value={apiKeySecret}
              onChange={(e) => setApiKeySecret(e.target.value)}
              placeholder={t('api.placeholder')}
              helperText={t('api.helper')}
              sx={{ mb: 2 }}
            />

            <Button
              size="small"
              onClick={() => setShowSecret(!showSecret)}
              disabled={isDefaultSecret}
              sx={{ mb: 2 }}
            >
              {showSecret ? t('api.hide') : t('api.show')}
            </Button>
            {isDefaultSecret && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                {t('api.defaultWarning')}
              </Typography>
            )}

            <Box sx={{ bgcolor: '#F5F5F5', p: 2, borderRadius: 1, mb: 2, userSelect: 'none' }}>
              <Typography variant="caption" color="text.secondary" display="block">
                {t('api.savedConfig')}
              </Typography>
              {isDefaultSecret ? (
                <Typography variant="body2" color="warning.main" fontSize="12px">
                  {t('api.usingDefault')}
                </Typography>
              ) : (
                <Typography variant="body2" fontFamily="monospace" fontSize="12px">
                  {showSecret ? savedSecret : savedSecret.replace(/./g, '*')}
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleReset}
                sx={{ flex: 1 }}
              >
                {t('api.reset')}
              </Button>
              <Button
                variant="contained"
                fullWidth
                startIcon={<Save />}
                onClick={handleSave}
                sx={{ flex: 1 }}
              >
                {t('api.save')}
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              {t('usage.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              1. {t('usage.step1')}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              2. {t('usage.step2')}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              3. {t('usage.step3')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              4. {t('usage.step4')}
            </Typography>
          </CardContent>
        </Card>

        {/* 文档链接 */}
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Description sx={{ color: '#1565C0', fontSize: 40 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {t('doc.title')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('doc.description')}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                onClick={() => navigate('/doc')}
              >
                {t('doc.button')}
              </Button>
            </Box>
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
