import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AppBar, Toolbar, Typography, Button, Container, Card, CardContent,
  Box, IconButton, Chip, Snackbar, Alert, Fab, BottomNavigation,
  BottomNavigationAction, Skeleton, Switch, FormControlLabel,
} from '@mui/material'
import { Add, Videocam, Delete, Refresh, Settings, Info, PlayCircle } from '@mui/icons-material'
import { useDeviceContext } from '../context/DeviceContext'
import AddDeviceDialog from './AddDeviceDialog'

export default function DeviceListPage() {
  const navigate = useNavigate()
  const { state, demoMode, toggleDemoMode, addDevice, removeDevice, refreshConnection } = useDeviceContext()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [toast, setToast] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({ open: false, msg: '', severity: 'success' })
  const [navValue, setNavValue] = useState(0)
  const [refreshingId, setRefreshingId] = useState<string | null>(null)

  const handleAdd = async (device: Parameters<typeof addDevice>[0]) => {
    await addDevice(device)
    setToast({ open: true, msg: `设备 ${device.name} 添加成功`, severity: 'success' })
  }

  const handleDelete = (id: string, name: string) => {
    if (confirm(`确定删除设备 ${name}？`)) {
      removeDevice(id)
      setToast({ open: true, msg: `设备 ${name} 已删除`, severity: 'success' })
    }
  }

  const handleRefresh = async (id: string) => {
    setRefreshingId(id)
    await refreshConnection(id)
    setRefreshingId(null)
    setToast({ open: true, msg: '连接已刷新', severity: 'success' })
  }

  const formatTime = (iso?: string) => {
    if (!iso) return '从未连接'
    const d = new Date(iso)
    return d.toLocaleString('zh-CN')
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="fixed" elevation={0} sx={{ background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 100%)' }}>
        <Toolbar>
          <Videocam sx={{ mr: 1.5 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>QV 监控</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FormControlLabel
              control={<Switch checked={demoMode} onChange={toggleDemoMode} size="small" />}
              label={<Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.87)' }}>演示模式</Typography>}
              sx={{ mr: 1 }}
            />
            <Button color="inherit" variant="outlined" size="small" startIcon={<Add />} onClick={() => setDialogOpen(true)} sx={{ borderColor: 'rgba(255,255,255,0.5)' }}>
              添加
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ flex: 1, pt: 10, pb: 16, overflow: 'auto' }}>
        {state.devices.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 8, px: 2 }}>
            <Videocam sx={{ fontSize: 80, color: '#B0BEC5', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>暂无设备</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {demoMode ? '演示模式已开启，已自动添加一个演示设备' : '点击下方按钮添加您的第一个 IoT 摄像头设备'}
            </Typography>
            {!demoMode && (
              <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)} sx={{ px: 4 }}>
                添加设备
              </Button>
            )}
            {demoMode && state.devices.length > 0 && (
              <Button variant="outlined" startIcon={<PlayCircle />} onClick={() => navigate(`/device/${state.devices[0].id}`)} sx={{ px: 4 }}>
                查看演示设备
              </Button>
            )}
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
                      <IconButton size="small" onClick={() => navigate(`/device/${device.id}`)}>
                        <Info sx={{ fontSize: 18 }} />
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
                    <Chip 
                      label={`${device.connection.httpAddr.remote_addr}:${device.connection.httpAddr.port}`} 
                      size="small" 
                      variant="outlined" 
                      sx={{ mr: 1, mb: 1, fontSize: '11px' }} 
                    />
                  )}
                  <Typography variant="caption" color="text.secondary" display="block">
                    {formatTime(device.lastConnected)}
                  </Typography>
                  <Box sx={{ mt: 1.5, display: 'flex', gap: 1 }}>
                    <Button size="small" variant="contained" startIcon={<Videocam />} onClick={() => navigate(`/device/${device.id}`)} sx={{ flex: 1, fontSize: '12px' }}>
                      查看详情
                    </Button>
                    <Button size="small" variant="outlined" startIcon={<Settings />} onClick={() => navigate(`/device/${device.id}/config`)} sx={{ flex: 1, fontSize: '12px' }}>
                      设备配置
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
          <BottomNavigationAction label="设备" icon={<Videocam />} onClick={() => navigate('/')} />
          <BottomNavigationAction label="消息" icon={<Info />} />
          <BottomNavigationAction label="设置" icon={<Settings />} onClick={() => navigate('/settings')} />
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
