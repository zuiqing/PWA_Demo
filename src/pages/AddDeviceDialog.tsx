import React, { useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, CircularProgress, Alert, Typography,
} from '@mui/material'
import type { DeviceInfo } from '../types/device'
import { useLanguage } from '../context/LanguageContext'

interface AddDeviceDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (device: DeviceInfo) => Promise<void>
}

export default function AddDeviceDialog({ open, onClose, onSubmit }: AddDeviceDialogProps) {
  const { t } = useLanguage()
  const [form, setForm] = useState({ deviceId: '', deviceName: '', username: 'admin', password: 'admin' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleClose = () => {
    setForm({ deviceId: '', deviceName: '', username: 'admin', password: 'admin' })
    setError('')
    setSaving(false)
    onClose()
  }

  const handleSubmit = async () => {
    if (!form.deviceId) {
      setError(t('addDevice.errorNoId'))
      return
    }

    // 验证是否有预设的API Key
    const savedApiKey = localStorage.getItem('qv_api_key_secret')
    if (!savedApiKey) {
      setError(t('addDevice.errorNoKey'))
      return
    }

    setSaving(true)
    setError('')
    try {
      const device: DeviceInfo = {
        id: form.deviceId,
        name: form.deviceName || form.deviceId,
        credentials: {
          username: form.username,
          password: form.password
        },
      }
      await onSubmit(device)
      handleClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      // Translate known error patterns
      if (msg.includes('device offline')) {
        setError(t('error.deviceOffline'))
      } else if (msg.includes('authentication') || msg.includes('auth')) {
        setError(t('error.authFailed'))
      } else {
        setError(msg || t('error.connectionFailed'))
      }
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 600, fontSize: '20px' }}>{t('addDevice.title')}</DialogTitle>
      <DialogContent sx={{ pt: '16px !important' }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('api.description')}
        </Typography>

        <TextField
          label={t('addDevice.deviceId')}
          fullWidth
          margin="dense"
          size="small"
          value={form.deviceId}
          onChange={updateField('deviceId')}
          placeholder={t('addDevice.deviceIdHint')}
          helperText={t('addDevice.deviceIdHint')}
        />
        <TextField
          label={t('addDevice.deviceName')}
          fullWidth
          margin="dense"
          size="small"
          value={form.deviceName}
          onChange={updateField('deviceName')}
          placeholder={t('addDevice.deviceNameHint')}
          helperText={t('addDevice.deviceNameHint')}
        />
        <TextField
          label={t('addDevice.username')}
          fullWidth
          margin="dense"
          size="small"
          value={form.username}
          onChange={updateField('username')}
          helperText={t('addDevice.usernameHint')}
        />
        <TextField
          label={t('addDevice.password')}
          fullWidth
          margin="dense"
          size="small"
          type="password"
          value={form.password}
          onChange={updateField('password')}
          helperText={t('addDevice.passwordHint')}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit">{t('addDevice.cancel')}</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={saving || !form.deviceId}
          startIcon={saving ? <CircularProgress size={16} /> : null}
        >
          {saving ? t('addDevice.adding') : t('addDevice.add')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
