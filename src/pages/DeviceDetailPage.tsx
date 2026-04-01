import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  AppBar, Toolbar, Typography, Container, Card, CardContent, Box,
  IconButton, Chip, Snackbar, Alert, Skeleton, Button, Menu, MenuItem,
  ListItemIcon, ListItemText,
} from '@mui/material'
import { CopyAll as Copy, Info, SdCard, Wifi, Videocam, PlayArrow, Visibility, VisibilityOff } from '@mui/icons-material'
import { ArrowBack, Settings, Refresh, RestartAlt, DeleteForever } from '@mui/icons-material'
import mpegts from 'mpegts.js'
import { useDeviceContext } from '../context/DeviceContext'
import { DeviceApiClient, FeatureNotSupportedError } from '../api/device-api'
import { MockDeviceApiClient } from '../api/mock-api'
import { buildRtspUrl, getRtspPlayHint } from '../api/rtsp-helper'
import type { DeviceStatus } from '../types/device'

function MoreVertIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" />
    </svg>
  )
}

function InfoRow({ label, value, onCopy }: { label: string; value: string; onCopy?: boolean }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.8, borderBottom: '1px solid #F5F5F5' }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography variant="body2" fontWeight={500} sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</Typography>
        {onCopy && <IconButton size="small" onClick={() => navigator.clipboard.writeText(value)}><Copy sx={{ fontSize: 14 }} /></IconButton>}
      </Box>
    </Box>
  )
}

// 加载状态卡片组件
function LoadingCard({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          {icon}
          <Typography variant="subtitle1" fontWeight={600}>{title}</Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[1, 2, 3].map(i => (
            <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.8 }}>
              <Skeleton width="30%" height={20} />
              <Skeleton width="40%" height={20} />
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  )
}

function VideoPlayer({ url, deviceId }: { url: string; deviceId: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<mpegts.Player | null>(null)
  const [playerError, setPlayerError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // 辅助函数：根据 RTSP 地址生成转换后的播放地址 (使用 WebRTC)
  const getPlayableUrl = (originalUrl: string) => {
    if (!originalUrl) return ''
    
    if (originalUrl.startsWith('rtsp://')) {
      // 使用同源转发，避免跨域 / 预检问题
      return `/webrtc/mystream`
    }
    return originalUrl
  }

  const playableUrl = getPlayableUrl(url)
  const isWebRTC = playableUrl.startsWith('/webrtc/') || playableUrl.includes(':8889') || playableUrl.startsWith('http')

  useEffect(() => {
    if (!videoRef.current || !isWebRTC) return

    setLoading(true)
    setPlayerError(null)

    let pc: RTCPeerConnection | null = null

    async function startWebRTC() {
      try {
        // 确保 MediaMTX 的 mystream 指向当前 RTSP 地址（动态更新）
        try {
          // 依次尝试 patch -> replace -> add
          const payload = JSON.stringify({
            source: url,
            rtspTransport: 'tcp',
            sourceOnDemand: true
          })
          let ok = false
          // PATCH /v3/config/paths/patch/{name}
          const patchRes = await fetch('/api/mediamtx/v3/config/paths/patch/mystream', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: payload
          })
          ok = patchRes.ok
          if (!ok) {
            // PUT /v3/config/paths/replace/{name}
            const replaceRes = await fetch('/api/mediamtx/v3/config/paths/replace/mystream', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: payload
            })
            ok = replaceRes.ok
          }
          if (!ok) {
            // POST /v3/config/paths/add/{name}
            const addRes = await fetch('/api/mediamtx/v3/config/paths/add/mystream', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: payload
            })
            // 400 表示已存在，视为可继续
            ok = addRes.ok || addRes.status === 400
          }
          // 可选：读取一次 get 确认
          if (ok) {
            await fetch('/api/mediamtx/v3/config/paths/get/mystream')
          }
        } catch {}
        // 给路径应用和按需拉流一个短暂准备时间
        await new Promise(r => setTimeout(r, 800))

        pc = new RTCPeerConnection()
        
        pc.ontrack = (event) => {
          if (videoRef.current) {
            videoRef.current.srcObject = event.streams[0]
            try {
              videoRef.current.muted = true
              const p = videoRef.current.play()
              if (p !== undefined) {
                p.catch(() => {})
              }
            } catch {}
          }
        }

        pc.oniceconnectionstatechange = () => {
          if (pc?.iceConnectionState === 'connected') {
            setLoading(false)
          }
        }

        // 添加收发器以接收视频和音频
        pc.addTransceiver('video', { direction: 'recvonly' })
        pc.addTransceiver('audio', { direction: 'recvonly' })

        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)

        // 向 MediaMTX 发送 WHEP 请求
        const response = await fetch(playableUrl + '/whep', {
          method: 'POST',
          body: pc.localDescription?.sdp,
          headers: {
            'Content-Type': 'application/sdp'
          }
        })

        if (!response.ok) throw new Error(`WHEP 请求失败: ${response.status}`)

        const answerSdp = await response.text()
        await pc.setRemoteDescription(new RTCSessionDescription({
          type: 'answer',
          sdp: answerSdp
        }))

      } catch (e) {
        console.error('WebRTC error:', e)
        setPlayerError('WebRTC 连接失败，请检查 MediaMTX 是否启动')
        setLoading(false)
      }
    }

    startWebRTC()

    return () => {
      if (pc) {
        pc.close()
        pc = null
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }, [playableUrl, isWebRTC])

  return (
    <Box 
      sx={{ 
        width: '100%', 
        aspectRatio: '16/9', 
        bgcolor: '#000', 
        borderRadius: 2, 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        mb: 2,
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
      }}
    >
      {!isWebRTC ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Videocam sx={{ fontSize: 48, color: 'rgba(255,255,255,0.3)', mb: 2 }} />
          <Typography variant="body2" sx={{ color: '#fff', mb: 1 }}>需要流媒体网关转发</Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block' }}>
            浏览器无法直接播放 RTSP 协议
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', mt: 1, wordBreak: 'break-all' }}>
            地址: {url || '暂无地址'}
          </Typography>
        </Box>
      ) : (
        <>
          <video 
            ref={videoRef} 
            controls 
            autoPlay 
            muted 
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
          />
          {loading && (
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <Refresh sx={{ color: '#fff', animation: 'spin 2s linear infinite' }} />
              <Typography variant="caption" sx={{ color: '#fff', display: 'block', mt: 1 }}>加载中...</Typography>
            </Box>
          )}
          {playerError && (
            <Box sx={{ position: 'absolute', p: 2, bgcolor: 'rgba(0,0,0,0.7)', borderRadius: 1 }}>
              <Typography color="error" variant="caption">{playerError}</Typography>
            </Box>
          )}
        </>
      )}
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Box>
  )
}

export default function DeviceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { demoMode, getDevice } = useDeviceContext()
  const device = getDevice(id || '')
  const [status, setStatus] = useState<DeviceStatus | null>(null)
  const [loading, setLoading] = useState(false) // 改为false，不再阻塞整个页面
  const [error, setError] = useState('')
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [toast, setToast] = useState<{ open: boolean; msg: string }>({ open: false, msg: '' })
  const [rtspAddr, setRtspAddr] = useState(() => {
    const rtspConn = device?.connection?.rtspAddr
    return rtspConn ? buildRtspUrl(rtspConn.remote_addr, rtspConn.username, rtspConn.password) : ''
  })
  const [hasFetched, setHasFetched] = useState(false)
  const [showPlayer, setShowPlayer] = useState(false)
  const [dataLoading, setDataLoading] = useState(true) // 新增：数据加载状态

  // 追踪哪些功能不支持（用于隐藏UI）
  const [notSupportedFeatures, setNotSupportedFeatures] = useState<Set<string>>(new Set())

  const fetchStatus = async () => {
    if (!device?.connection?.httpAddr) return
    setLoading(true)
    setDataLoading(true) // 开始加载数据
    setError('')
    setNotSupportedFeatures(new Set()) // 重置不支持的功能列表

    try {
      console.log('fetchStatus called, hasFetched:', hasFetched)
      let data
      if (demoMode) {
        // 演示模式：使用模拟数据
        const mockClient = new MockDeviceApiClient()
        const conn = device.connection?.httpAddr
        if (!conn) throw new Error('设备连接信息缺失')
        data = await mockClient.getDeviceStatus(conn.remote_addr, parseInt(conn.port), conn.username, conn.password)
      } else {
        // 真实模式：调用真实 API
        const conn = device.connection?.httpAddr
        if (!conn) throw new Error('设备连接信息缺失')
        console.log('Creating DeviceApiClient with remote_addr:', conn.remote_addr)
        console.log('Username:', device.credentials.username)
        console.log('Password:', device.credentials.password ? '***' : 'empty')
        const client = new DeviceApiClient(conn, device.credentials.username, device.credentials.password)
        console.log('Client created, calling getDeviceStatus...')
        data = await client.getDeviceStatus()
        console.log('getDeviceStatus completed, data received')
      }
      setStatus(data)
      const rtspConn = device.connection?.rtspAddr
      if (rtspConn) {
        setRtspAddr(buildRtspUrl(rtspConn.remote_addr, rtspConn.username, rtspConn.password))
      }
      setHasFetched(true)
    } catch (err) {
      console.error('fetchStatus error:', err)
      // 检查是否是功能不支持的错误
      if (err instanceof FeatureNotSupportedError) {
        console.log('getDeviceStatus not supported by this device')
        // 设备不支持获取状态，设置空状态
        setStatus(null)
      } else {
        setError(err instanceof Error ? err.message : '获取状态失败')
      }
    } finally {
      console.log('==== END fetchStatus ====')
      setLoading(false)
      setDataLoading(false) // 数据加载完成
    }
  }

  useEffect(() => {
    console.log('Device changed, resetting hasFetched')
    setHasFetched(false)
    const rtspConn = device?.connection?.rtspAddr
    if (rtspConn) {
      setRtspAddr(buildRtspUrl(rtspConn.remote_addr, rtspConn.username, rtspConn.password))
    } else {
      setRtspAddr('')
    }
  }, [device])

  useEffect(() => {
    console.log('useEffect dependencies:', { id, device: !!device, hasFetched })
    if (id && device && !hasFetched) {
      console.log('==== START fetchStatus ====')
      fetchStatus()
    }
  }, [id, device, hasFetched])

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setToast({ open: true, msg: '已复制到剪贴板' })
  }

  const handleAction = async (action: string) => {
    setMenuAnchor(null)
    const conn = device?.connection?.httpAddr
    if (!conn) return
    if (action === 'reboot' && !confirm('确定重启设备？')) return
    if (action === 'factory' && !confirm('确定恢复出厂设置？')) return
    try {
      if (demoMode) {
        // 演示模式：使用模拟操作
        const mockClient = new MockDeviceApiClient()
        if (action === 'reboot') await mockClient.rebootDevice(conn.remote_addr, parseInt(conn.port), conn.username, conn.password)
        else if (action === 'factory') await mockClient.factoryReset(conn.remote_addr, parseInt(conn.port), conn.username, conn.password)
      } else {
        // 真实模式：调用真实 API
        const client = new DeviceApiClient(conn, device.credentials.username, device.credentials.password)
        if (action === 'reboot') await client.reboot()
        else if (action === 'factory') await client.factoryReset()
      }
      setToast({ open: true, msg: '操作成功' })
    } catch (err) {
      setToast({ open: true, msg: err instanceof Error ? err.message : '操作失败' })
    }
  }

  const getWifi = (rssi: number) => {
    if (rssi >= -50) return { label: '强', color: '#4CAF50' }
    if (rssi >= -70) return { label: '中', color: '#FF9800' }
    return { label: '弱', color: '#F44336' }
  }

  if (!device) return (
    <Container maxWidth="sm" sx={{ pt: 10, textAlign: 'center' }}>
      <Typography>设备不存在</Typography>
      <Button onClick={() => navigate('/')}>返回</Button>
    </Container>
  )

  const wifi = getWifi(status?.wifi?.rssi || -100)

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="fixed" elevation={0} sx={{ background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 100%)' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/')}><ArrowBack /></IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>{device.name}</Typography>
          <IconButton color="inherit" onClick={e => setMenuAnchor(e.currentTarget)}><MoreVertIcon /></IconButton>
          <IconButton color="inherit" onClick={() => navigate(`/device/${id}/config`)}><Settings /></IconButton>
        </Toolbar>
      </AppBar>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={() => handleAction('reboot')}><ListItemIcon><RestartAlt fontSize="small" /></ListItemIcon><ListItemText>重启设备</ListItemText></MenuItem>
        <MenuItem onClick={() => handleAction('factory')}><ListItemIcon><DeleteForever fontSize="small" sx={{ color: '#F44336' }} /></ListItemIcon><ListItemText sx={{ color: '#F44336' }}>恢复出厂</ListItemText></MenuItem>
      </Menu>

      <Container maxWidth="sm" sx={{ flex: 1, pt: 10, pb: 4, overflow: 'auto' }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* 设备信息卡片 - 加载中显示骨架屏，不支持则隐藏 */}
          {dataLoading && !status ? (
            <LoadingCard title="设备信息" icon={<Info sx={{ color: '#1565C0' }} />} />
          ) : status ? (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Info sx={{ color: '#1565C0' }} /><Typography variant="subtitle1" fontWeight={600}>设备信息</Typography>
                </Box>
                <InfoRow label="型号" value={status?.info.model || '-'} />
                <InfoRow label="固件版本" value={status?.info.version || '-'} />
                <InfoRow label="MAC 地址" value={status?.info.mac || '-'} onCopy />
                <InfoRow label="云 ID" value={device.id} onCopy />
              </CardContent>
            </Card>
          ) : null}

          {/* 网络状态卡片 - 加载中显示骨架屏，不支持则隐藏 */}
          {dataLoading && !status ? (
            <LoadingCard title="网络状态" icon={<Wifi sx={{ color: '#2196F3' }} />} />
          ) : status ? (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Wifi sx={{ color: '#2196F3' }} /><Typography variant="subtitle1" fontWeight={600}>网络状态</Typography>
                  <Chip label={wifi.label} size="small" sx={{ ml: 'auto', bgcolor: wifi.color, color: '#fff', fontWeight: 600, fontSize: '11px' }} />
                </Box>
                <InfoRow label="WiFi" value={status?.wifi?.ssid || '-'} />
                <InfoRow label="IP 地址" value={status?.network.address || '-'} onCopy />
                <InfoRow label="网关" value={status?.network.gateway || '-'} />
                <InfoRow label="DNS" value={status?.network.dns || '-'} />
              </CardContent>
            </Card>
          ) : null}

          {/* 存储卡片 */}
          {dataLoading && !status ? (
            <LoadingCard title="存储" icon={<SdCard sx={{ color: '#FF9800' }} />} />
          ) : status ? (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <SdCard sx={{ color: '#FF9800' }} /><Typography variant="subtitle1" fontWeight={600}>存储</Typography>
                </Box>
                {status?.tfcard.exist ? (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">已用空间</Typography>
                      <Typography variant="body2" fontWeight={500}>{((status.tfcard.totalsum - status.tfcard.freesum) / 1024).toFixed(1)} GB / {(status.tfcard.totalsum / 1024).toFixed(1)} GB</Typography>
                    </Box>
                    <Box sx={{ height: 8, bgcolor: '#E0E0E0', borderRadius: 4, overflow: 'hidden' }}>
                      <Box sx={{ height: '100%', width: `${((status.tfcard.totalsum - status.tfcard.freesum) / status.tfcard.totalsum) * 100}%`, bgcolor: status.tfcard.freesum < 500 ? '#F44336' : '#4CAF50', borderRadius: 4, transition: 'width 0.5s' }} />
                    </Box>
                  </>
                ) : <Typography variant="body2" color="text.secondary">未检测到存储卡</Typography>}
              </CardContent>
            </Card>
          ) : null}

          {/* 视频监控预览卡片 */}
          <Card sx={{ border: '2px solid #1565C0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Videocam sx={{ color: '#1565C0' }} /><Typography variant="subtitle1" fontWeight={600}>实时监控预览</Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={showPlayer ? <VisibilityOff /> : <Visibility />}
                  onClick={() => setShowPlayer(!showPlayer)}
                  sx={{ ml: 'auto', borderRadius: 4, textTransform: 'none' }}
                >
                  {showPlayer ? '关闭预览' : '开启预览'}
                </Button>
              </Box>

              {showPlayer && <VideoPlayer url={rtspAddr} deviceId={id || 'unknown'} />}

              <Box sx={{ bgcolor: '#F5F5F5', p: 1.5, borderRadius: 2, mb: 1.5, wordBreak: 'break-all' }}>
                <Typography variant="body2" fontFamily="monospace" fontSize="11px">{rtspAddr || '连接后显示'}</Typography>
              </Box>
              {rtspAddr && <Button size="small" startIcon={<Copy />} onClick={() => handleCopy(rtspAddr)} sx={{ mb: 1 }}>复制地址</Button>}
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', whiteSpace: 'pre-line', mt: 1 }}>{getRtspPlayHint()}</Typography>
            </CardContent>
          </Card>

          <Button variant="contained" startIcon={<Refresh />} onClick={fetchStatus} fullWidth disabled={loading}>
            {loading ? '刷新中...' : '刷新状态'}
          </Button>
        </Box>
      </Container>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setToast(p => ({ ...p, open: false }))}>{toast.msg}</Alert>
      </Snackbar>
    </Box>
  )
}
