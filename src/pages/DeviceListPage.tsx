import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AppBar, Toolbar, Typography, Button, Container, Card, CardContent,
  Box, IconButton, Snackbar, Alert, Fab, BottomNavigation,
  BottomNavigationAction, ToggleButton, ToggleButtonGroup,
} from '@mui/material'
import { Add, Videocam, Delete, Refresh, Settings, BugReport } from '@mui/icons-material'
import { useDeviceContext } from '../context/DeviceContext'
import { useLanguage } from '../context/LanguageContext'
import AddDeviceDialog from './AddDeviceDialog'

export default function DeviceListPage() {
  const navigate = useNavigate()
  const { state, addDevice, removeDevice, refreshConnection } = useDeviceContext()
  const { language, setLanguage, t } = useLanguage()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [toast, setToast] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({ open: false, msg: '', severity: 'success' })
  const [navValue, setNavValue] = useState(0)
  const [refreshingId, setRefreshingId] = useState<string | null>(null)

  const handleAdd = async (device: Parameters<typeof addDevice>[0]) => {
    await addDevice(device)
    setToast({ open: true, msg: t('device.list.added', { name: device.name }), severity: 'success' })
  }

  const handleDelete = (id: string, name: string) => {
    if (confirm(t('device.list.deleteConfirm', { name }))) {
      removeDevice(id)
      setToast({ open: true, msg: t('device.list.deleted', { name }), severity: 'success' })
    }
  }

  const handleRefresh = async (id: string) => {
    setRefreshingId(id)
    await refreshConnection(id)
    setRefreshingId(null)
    setToast({ open: true, msg: t('device.list.connectionRefreshed'), severity: 'success' })
  }

  const formatTime = (iso?: string) => {
    if (!iso) return t('device.list.never')
    const d = new Date(iso)
    return d.toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US')
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="fixed" elevation={0} sx={{ background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 100%)' }}>
        <Toolbar>
          <Videocam sx={{ mr: 1.5 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>QUALVISION Cloud API</Typography>
          <ToggleButtonGroup
            value={language}
            exclusive
            onChange={(_, value) => value && setLanguage(value)}
            size="small"
            sx={{
              bgcolor: 'rgba(255,255,255,0.1)',
              mr: 1,
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
          <Button color="inherit" variant="outlined" size="small" startIcon={<Add />} onClick={() => setDialogOpen(true)} sx={{ borderColor: 'rgba(255,255,255,0.5)', mr: 1 }}>
            {t('common.add')}
          </Button>
          <IconButton color="inherit" onClick={() => navigate('/debug')}>
            <BugReport />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ flex: 1, pt: 10, pb: 16, overflow: 'auto' }}>
        {state.devices.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 8, px: 2 }}>
            <Videocam sx={{ fontSize: 80, color: '#B0BEC5', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>{t('device.list.empty')}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t('device.list.emptyHint')}
            </Typography>
            <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)} sx={{ px: 4 }}>
              {t('device.list.addDevice')}
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {state.devices.map(device => (
              <Card key={device.id} sx={{ position: 'relative', overflow: 'visible', '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }, transition: 'box-shadow 0.3s' }}>
                <CardContent sx={{ pb: '12px !important' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: device.online ? '#4CAF50' : '#BDBDBD', boxShadow: device.online ? '0 0 8px rgba(76,175,80,0.6)' : 'none' }} />
                      <Typography variant="subtitle1" fontWeight={600}>{device.name}</Typography>
                    </Box>
                    <Box>
                      <IconButton size="small" onClick={() => handleRefresh(device.id)} disabled={refreshingId === device.id}>
                        <Refresh sx={{ fontSize: 18, animation: refreshingId === device.id ? 'spin 1s linear infinite' : 'none' }} />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(device.id, device.name)}>
                        <Delete sx={{ fontSize: 18, color: '#F44336' }} />
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    ID: {device.id.substring(0, 20)}{device.id.length > 20 ? '...' : ''}
                  </Typography>
                  {device.online && device.connection?.httpAddr && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      CGI: {device.connection.httpAddr.remote_addr}
                    </Typography>
                  )}
                  {device.online && device.connection?.rtspAddr && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      RTSP: {device.connection.rtspAddr.remote_addr}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" display="block">
                    {formatTime(device.lastConnected)}
                  </Typography>
                  <Box sx={{ mt: 1.5, display: 'flex', gap: 1 }}>
                    <Button size="small" variant="contained" startIcon={<Videocam />} onClick={() => navigate(`/device/${device.id}`)} sx={{ flex: 1, fontSize: '12px' }}>
                      {t('device.list.viewDevice')}
                    </Button>
                    <Button size="small" variant="outlined" startIcon={<Settings />} onClick={() => navigate(`/device/${device.id}/config`)} sx={{ flex: 1, fontSize: '12px' }}>
                      {t('device.list.deviceConfig')}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Container>

      <Fab
        color="primary" size="large"
        onClick={() => setDialogOpen(true)}
        sx={{ position: 'fixed', bottom: 80, right: 16, background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 100%)' }}
      >
        <Add />
      </Fab>

      <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, bgcolor: 'background.paper', borderTop: '1px solid #E0E0E0' }}>
        <BottomNavigation value={navValue} onChange={(_, v) => setNavValue(v)} showLabels>
          <BottomNavigationAction label={t('common.devices')} icon={<Videocam />} onClick={() => navigate('/')} />
          <BottomNavigationAction label={t('common.settings')} icon={<Settings />} onClick={() => navigate('/settings')} />
        </BottomNavigation>
      </Box>

      <AddDeviceDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSubmit={handleAdd} />
      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={toast.severity} onClose={() => setToast(p => ({ ...p, open: false }))}>{toast.msg}</Alert>
      </Snackbar>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </Box>
  )
}
