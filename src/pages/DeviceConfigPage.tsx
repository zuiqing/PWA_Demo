import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  AppBar, Toolbar, Typography, Container, Box, IconButton,
  Snackbar, Alert, Skeleton, Switch, Slider, Select, MenuItem,
  InputLabel, FormControl, TextField, Button, Divider, Accordion, AccordionSummary, AccordionDetails,
} from '@mui/material'
import { ArrowBack, ExpandMore, Save, AccessTime, Flip, VolumeUp, NetworkCheck, Speed, Alarm, VideoLabel } from '@mui/icons-material'
import { useDeviceContext } from '../context/DeviceContext'
import { DeviceApiClient } from '../api/device-api'
import type { DeviceStatus, VolumeConfig, FpsMode, NetworkConfig, ImageFlip, DeviceTime } from '../types/device'

const WEEKS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const WEEK_LABELS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

export default function DeviceConfigPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getDevice } = useDeviceContext()
  const device = getDevice(id || '')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [toast, setToast] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({ open: false, msg: '', severity: 'success' })

  const [deviceTime, setDeviceTime] = useState<DeviceTime>({ timezone: '', datatime: '' })
  const [imageFlip, setImageFlip] = useState<ImageFlip>({ mode: 0 })
  const [volume, setVolume] = useState<VolumeConfig>({ talk: { max_level: 12, min_level: 0, level: 3 }, prompt: { max_level: 12, min_level: 0, level: 3 } })
  const [fpsMode, setFpsMode] = useState<FpsMode>({ mode: 0 })
  const [network, setNetwork] = useState<NetworkConfig>({ idhcp: true, address: '', submask: '', gateway: '', dns: '', secondarydns: '', httpport: 80, httpsport: 443 })
  const [motionEnabled, setMotionEnabled] = useState(true)

  const getClient = () => {
    const conn = device!.connection?.httpAddr
    if (!conn) throw new Error('设备连接信息缺失')
    return new DeviceApiClient(conn, device!.credentials.username, device!.credentials.password)
  }

  useEffect(() => {
    const conn = device?.connection?.httpAddr
    if (!conn) return
    
    const loadData = async () => {
      setLoading(true)
      const client = getClient()
      
      try {
        // 顺序加载数据，避免并发压力
        const time = await client.getProductTime().catch(() => ({ timezone: '', datatime: '' }))
        setDeviceTime(time)
        
        const flip = await client.getImageFlip().catch(() => ({ mode: 0 }))
        setImageFlip(flip)
        
        const vol = await client.getVolume().catch(() => ({ talk: { max_level: 12, min_level: 0, level: 3 }, prompt: { max_level: 12, min_level: 0, level: 3 } }))
        setVolume(vol)
        
        const fps = await client.getFpsMode().catch(() => ({ mode: 0 }))
        setFpsMode(fps)
        
        const net = await client.getNetworkConfig().catch(() => network)
        setNetwork(net)
        
        await client.getDeviceStatus().then(s => { setMotionEnabled(s.motionDetection.enabled) }).catch(() => {})
      } catch (err) {
        console.error('加载配置失败:', err)
        setToast({ open: true, msg: '部分配置加载失败', severity: 'error' })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id, device?.connection?.httpAddr])

  const save = async (name: string, fn: () => Promise<void>) => {
    setSaving(name)
    setToast({ open: false, msg: '', severity: 'success' })
    try {
      await fn()
      setToast({ open: true, msg: `${name}保存成功`, severity: 'success' })
    } catch (err) {
      setToast({ open: true, msg: err instanceof Error ? err.message : '保存失败', severity: 'error' })
    } finally {
      setSaving(null)
    }
  }

  if (!device) return (
    <Container maxWidth="sm" sx={{ pt: 10, textAlign: 'center' }}><Typography>设备不存在</Typography><Button onClick={() => navigate('/')}>返回</Button></Container>
  )

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="fixed" elevation={0} sx={{ background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 100%)' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate(`/device/${id}`)}><ArrowBack /></IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>设备配置</Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ flex: 1, pt: 10, pb: 4, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>{[1, 2, 3, 4, 5].map(i => <Skeleton key={i} variant="rounded" height={100} />)}</Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Time */}
            <Accordion defaultExpanded disableGutters elevation={0} sx={{ bgcolor: 'background.paper', borderRadius: 3, '&:before': { display: 'none' }, border: '1px solid #E0E0E0' }}>
              <AccordionSummary expandIcon={<ExpandMore />}><AccessTime sx={{ mr: 1, color: '#2196F3' }} /><Typography fontWeight={600}>时间设置</Typography></AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <TextField label="时区" fullWidth size="small" value={deviceTime.timezone} disabled sx={{ mb: 2 }} />
                <TextField label="当前时间" fullWidth size="small" value={deviceTime.datatime} disabled sx={{ mb: 2 }} />
                <Button variant="contained" size="small" startIcon={saving === 'time' ? null : <Save />} disabled={saving === 'time'} onClick={() => save('时间', async () => { const t = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'; await getClient().setProductTime(deviceTime.timezone, t); setDeviceTime(prev => ({ ...prev, datatime: t })) })}>同步当前时间</Button>
              </AccordionDetails>
            </Accordion>

            {/* Image Flip */}
            <Accordion disableGutters elevation={0} sx={{ bgcolor: 'background.paper', borderRadius: 3, '&:before': { display: 'none' }, border: '1px solid #E0E0E0' }}>
              <AccordionSummary expandIcon={<ExpandMore />}><Flip sx={{ mr: 1, color: '#9C27B0' }} /><Typography fontWeight={600}>图像设置</Typography></AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2">图像翻转</Typography>
                  <Switch checked={imageFlip.mode === 1} onChange={e => { const m = e.target.checked ? 1 : 0; setImageFlip({ mode: m }); save('图像翻转', () => getClient().setImageFlip(m)) }} />
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* Volume */}
            <Accordion disableGutters elevation={0} sx={{ bgcolor: 'background.paper', borderRadius: 3, '&:before': { display: 'none' }, border: '1px solid #E0E0E0' }}>
              <AccordionSummary expandIcon={<ExpandMore />}><VolumeUp sx={{ mr: 1, color: '#FF9800' }} /><Typography fontWeight={600}>音频设置</Typography></AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" gutterBottom>通话音量: {volume.talk.level}</Typography>
                <Slider value={volume.talk.level} min={volume.talk.min_level} max={volume.talk.max_level} onChange={(_, v) => setVolume(prev => ({ ...prev, talk: { ...prev.talk, level: v as number } }))} onChangeCommitted={() => save('音量', () => getClient().setVolume(volume.talk.level, volume.prompt.level))} />
                <Typography variant="body2" sx={{ mt: 2 }} gutterBottom>提示音音量: {volume.prompt.level}</Typography>
                <Slider value={volume.prompt.level} min={volume.prompt.min_level} max={volume.prompt.max_level} onChange={(_, v) => setVolume(prev => ({ ...prev, prompt: { ...prev.prompt, level: v as number } }))} onChangeCommitted={() => save('音量', () => getClient().setVolume(volume.talk.level, volume.prompt.level))} />
              </AccordionDetails>
            </Accordion>

            {/* Network */}
            <Accordion disableGutters elevation={0} sx={{ bgcolor: 'background.paper', borderRadius: 3, '&:before': { display: 'none' }, border: '1px solid #E0E0E0' }}>
              <AccordionSummary expandIcon={<ExpandMore />}><NetworkCheck sx={{ mr: 1, color: '#4CAF50' }} /><Typography fontWeight={600}>网络设置</Typography></AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2">DHCP</Typography>
                  <Switch checked={network.idhcp} onChange={e => setNetwork(prev => ({ ...prev, idhcp: e.target.checked }))} />
                </Box>
                {!network.idhcp && (
                  <>
                    <TextField label="IP 地址" fullWidth size="small" value={network.address} onChange={e => setNetwork(prev => ({ ...prev, address: e.target.value }))} sx={{ mb: 1.5 }} />
                    <TextField label="子网掩码" fullWidth size="small" value={network.submask} onChange={e => setNetwork(prev => ({ ...prev, submask: e.target.value }))} sx={{ mb: 1.5 }} />
                    <TextField label="网关" fullWidth size="small" value={network.gateway} onChange={e => setNetwork(prev => ({ ...prev, gateway: e.target.value }))} sx={{ mb: 1.5 }} />
                    <TextField label="DNS" fullWidth size="small" value={network.dns} onChange={e => setNetwork(prev => ({ ...prev, dns: e.target.value }))} sx={{ mb: 2 }} />
                  </>
                )}
                <Button variant="contained" size="small" onClick={() => save('网络', () => getClient().setNetworkConfig(network))}>保存网络配置</Button>
              </AccordionDetails>
            </Accordion>

            {/* FPS */}
            <Accordion disableGutters elevation={0} sx={{ bgcolor: 'background.paper', borderRadius: 3, '&:before': { display: 'none' }, border: '1px solid #E0E0E0' }}>
              <AccordionSummary expandIcon={<ExpandMore />}><Speed sx={{ mr: 1, color: '#00BCD4' }} /><Typography fontWeight={600}>视频设置</Typography></AccordionSummary>
              <AccordionDetails>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>帧率模式</InputLabel>
                  <Select value={fpsMode.mode} label="帧率模式" onChange={e => { const m = e.target.value as number; setFpsMode({ mode: m }); save('帧率', () => getClient().setFpsMode(m)) }}>
                    <MenuItem value={0}>高 (20 fps)</MenuItem>
                    <MenuItem value={1}>中 (10 fps)</MenuItem>
                    <MenuItem value={2}>低 (仅关键帧)</MenuItem>
                  </Select>
                </FormControl>
              </AccordionDetails>
            </Accordion>

            {/* Alarm */}
            <Accordion disableGutters elevation={0} sx={{ bgcolor: 'background.paper', borderRadius: 3, '&:before': { display: 'none' }, border: '1px solid #E0E0E0' }}>
              <AccordionSummary expandIcon={<ExpandMore />}><Alarm sx={{ mr: 1, color: '#F44336' }} /><Typography fontWeight={600}>报警设置</Typography></AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2">移动检测</Typography>
                  <Switch checked={motionEnabled} onChange={e => setMotionEnabled(e.target.checked)} />
                </Box>
              </AccordionDetails>
            </Accordion>
          </Box>
        )}
      </Container>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={toast.severity} onClose={() => setToast(p => ({ ...p, open: false }))}>{toast.msg}</Alert>
      </Snackbar>
    </Box>
  )
}
