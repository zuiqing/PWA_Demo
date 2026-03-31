import React, { useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, CircularProgress, Alert, Typography,
} from '@mui/material'
import type { DeviceInfo } from '../types/device'

interface AddDeviceDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (device: DeviceInfo) => Promise<void>
}

export default function AddDeviceDialog({ open, onClose, onSubmit }: AddDeviceDialogProps) {
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
      setError('请填写设备ID')
      return
    }
    
    // 验证是否有预设的API Key
    const savedApiKey = localStorage.getItem('qv_api_key_secret')
    if (!savedApiKey) {
      setError('请在设置页面配置API Key')
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
      setError(err instanceof Error ? err.message : '添加失败')
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 600, fontSize: '20px' }}>添加设备</DialogTitle>
      <DialogContent sx={{ pt: '16px !important' }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          注意：API Key需要在设置页面配置，设备添加时使用预设的API Key
        </Typography>
        
        <TextField 
          label="设备 ID *" 
          fullWidth 
          margin="dense" 
          size="small" 
          value={form.deviceId} 
          onChange={updateField('deviceId')} 
          placeholder="设备唯一标识符" 
          helperText="设备的唯一ID，从QV平台获取"
        />
        <TextField 
          label="设备名称" 
          fullWidth 
          margin="dense" 
          size="small" 
          value={form.deviceName} 
          onChange={updateField('deviceName')} 
          placeholder="自定义名称，可选" 
          helperText="便于识别的设备名称"
        />
        <TextField 
          label="设备用户名" 
          fullWidth 
          margin="dense" 
          size="small" 
          value={form.username} 
          onChange={updateField('username')} 
          helperText="设备登录用户名，默认为admin"
        />
        <TextField 
          label="设备密码" 
          fullWidth 
          margin="dense" 
          size="small" 
          type="password" 
          value={form.password} 
          onChange={updateField('password')} 
          helperText="设备登录密码，默认为admin"
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit">取消</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={saving || !form.deviceId} 
          startIcon={saving ? <CircularProgress size={16} /> : null}
        >
          {saving ? '连接中...' : '添加'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
