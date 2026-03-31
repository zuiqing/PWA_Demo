export function buildRtspUrl(
  remoteAddr: string,
  username: string,
  password: string,
  mode: 'real' | 'file' = 'real',
  options?: {
    type?: string
    idc?: number
    ids?: number
    starttime?: string
    endtime?: string
  }
): string {
  console.log('buildRtspUrl called with:', { remoteAddr, username, password, mode, options })
  
  // 检查remoteAddr是否是有效的URL或主机名
  if (!remoteAddr || remoteAddr.trim() === '') {
    console.error('buildRtspUrl: remoteAddr is empty or invalid:', remoteAddr)
    throw new Error('Invalid remote address')
  }
  
  let url = `rtsp://${username}:${password}@${remoteAddr}/`
  console.log('Base RTSP URL:', url)
  
  if (mode === 'real') {
    url += `mode=real&idc=${options?.idc ?? 1}&ids=${options?.ids ?? 1}`
  } else {
    url += `mode=file&type=${options?.type || 'rec'}&idc=${options?.idc ?? 1}&ids=${options?.ids ?? 1}`
    if (options?.starttime) url += `&starttime=${options.starttime}`
    if (options?.endtime) url += `&endtime=${options.endtime}`
  }

  console.log('Final RTSP URL:', url)
  return url
}

export function getRtspPlayHint(): string {
  return '使用 ffplay 播放：ffplay "RTSP地址"\n或使用 VLC 打开网络串流'
}
