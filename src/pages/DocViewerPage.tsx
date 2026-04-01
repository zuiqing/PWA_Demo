import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AppBar, Toolbar, Typography, Box, IconButton,
  Button, Drawer, List, ListItem, ListItemButton,
  ListItemText, Divider, TextField, InputAdornment,
  Snackbar,
} from '@mui/material'
import { ArrowBack, Download, ViewSidebar, ContentCopy, Search } from '@mui/icons-material'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

interface TocItem {
  level: number
  text: string
  id: string
}

// 从markdown内容中提取目录结构
function extractToc(markdown: string): TocItem[] {
  const lines = markdown.split('\n')
  const toc: TocItem[] = []
  const usedIds = new Set<string>()

  lines.forEach(line => {
    const match = line.match(/^(#{1,3})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const text = match[2].trim()
      // 生成唯一ID
      let id = text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      
      // 处理重复ID
      let counter = 1
      while (usedIds.has(id)) {
        id = `${id}-${counter}`
        counter++
      }
      usedIds.add(id)
      
      toc.push({ level, text, id })
    }
  })

  return toc
}

export default function DocViewerPage() {
  const navigate = useNavigate()
  const [markdown, setMarkdown] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [tocSearch, setTocSearch] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)

  // 复制文本到剪贴板
  const handleCopy = async (text: string) => {
    try {
      // 方法1: 现代Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
        return
      }
      // 方法2: 传统方式 (兼容非HTTPS环境)
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.left = '-9999px'
      textarea.style.top = '0'
      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()
      const success = document.execCommand('copy')
      document.body.removeChild(textarea)
      if (success) {
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      }
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  // 加载markdown文档
  useEffect(() => {
    fetch('/monitor/QV_IOT_Device_Protocol_en.md')
      .then(response => response.text())
      .then(text => {
        setMarkdown(text)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load markdown:', err)
        setLoading(false)
      })
  }, [])

  // 提取目录结构
  const toc = useMemo(() => extractToc(markdown), [markdown])

  // 过滤目录项
  const filteredToc = useMemo(() => {
    if (!tocSearch.trim()) return toc
    const search = tocSearch.toLowerCase()
    return toc.filter(item => item.text.toLowerCase().includes(search))
  }, [toc, tocSearch])

  // 下载文档
  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = '/monitor/QV_IOT_Device_Protocol_en.md'
    link.download = 'QV_IOT_Device_Protocol_en.md'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 跳转到指定标题
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    setDrawerOpen(false)
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="fixed" elevation={0} sx={{ background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 100%)' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate(-1)} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            设备协议文档
          </Typography>
          <IconButton color="inherit" onClick={() => setDrawerOpen(!drawerOpen)} sx={{ mr: 1 }}>
            <ViewSidebar />
          </IconButton>
          <Button
            color="inherit"
            startIcon={<Download />}
            onClick={handleDownload}
          >
            下载
          </Button>
        </Toolbar>
      </AppBar>

      {/* 左侧目录导航 */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { width: 300, pt: 8 }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
            文档目录
          </Typography>
          <TextField
            size="small"
            placeholder="搜索标题..."
            value={tocSearch}
            onChange={(e) => setTocSearch(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 20, color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
          <Divider sx={{ mb: 1 }} />
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <List dense disablePadding>
              {filteredToc.map((item, index) => (
                <ListItem
                  key={index}
                  disablePadding
                  sx={{ pl: (item.level - 1) * 2, py: 0.5 }}
                >
                  <ListItemButton
                    onClick={() => scrollToSection(item.id)}
                    sx={{
                      borderRadius: 1,
                      py: 0.5,
                      minHeight: 32,
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        variant: 'body2',
                        sx: {
                          fontSize: item.level === 1 ? '13px' : item.level === 2 ? '12px' : '11px',
                          fontWeight: item.level === 1 ? 600 : item.level === 2 ? 500 : 400,
                          color: item.level === 1 ? '#0D47A1' : item.level === 2 ? '#1565C0' : 'text.primary',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
              {filteredToc.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="未找到匹配的标题"
                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                  />
                </ListItem>
              )}
            </List>
          </Box>
          <Divider sx={{ mt: 1 }} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
            共 {filteredToc.length} / {toc.length} 项
          </Typography>
        </Box>
      </Drawer>

      <Box sx={{ flex: 1, overflow: 'auto', bgcolor: '#F5F5F5', pt: 8 }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2, py: 3 }}>
          {loading ? (
            <Typography>加载中...</Typography>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                h1: ({ children, node }) => {
                  const text = String(children)
                  const id = text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
                  return (
                    <Typography
                      id={id}
                      variant="h4"
                      component="h1"
                      sx={{ mt: 4, mb: 2, fontWeight: 600, color: '#1565C0', scrollMarginTop: '80px' }}
                    >
                      {children}
                    </Typography>
                  )
                },
                h2: ({ children }) => {
                  const text = String(children)
                  const id = text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
                  return (
                    <Typography
                      id={id}
                      variant="h5"
                      component="h2"
                      sx={{ mt: 3, mb: 2, fontWeight: 600, color: '#0D47A1', borderBottom: '2px solid #E0E0E0', pb: 1, scrollMarginTop: '80px' }}
                    >
                      {children}
                    </Typography>
                  )
                },
                h3: ({ children }) => {
                  const text = String(children)
                  const id = text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
                  return (
                    <Typography
                      id={id}
                      variant="h6"
                      component="h3"
                      sx={{ mt: 2, mb: 1, fontWeight: 600, color: '#1976D2', scrollMarginTop: '80px' }}
                    >
                      {children}
                    </Typography>
                  )
                },
                p: ({ children }) => (
                  <Typography sx={{ mb: 2, lineHeight: 1.8 }}>
                    {children}
                  </Typography>
                ),
                ul: ({ children }) => (
                  <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                    {children}
                  </Box>
                ),
                ol: ({ children }) => (
                  <Box component="ol" sx={{ pl: 3, mb: 2 }}>
                    {children}
                  </Box>
                ),
                li: ({ children }) => (
                  <Box component="li" sx={{ mb: 0.5 }}>
                    <Typography component="span" sx={{ lineHeight: 1.8 }}>
                      {children}
                    </Typography>
                  </Box>
                ),
                img: ({ src, alt }) => (
                  <Box
                    sx={{
                      my: 3,
                      textAlign: 'center',
                      position: 'relative',
                    }}
                  >
                    <img
                      src={src}
                      alt={alt || '图片'}
                      style={{
                        maxWidth: '100%',
                        height: 'auto',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                      }}
                      onClick={() => window.open(src, '_blank')}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <Box
                      className="hidden"
                      sx={{
                        display: 'none',
                        p: 3,
                        bgcolor: 'error.light',
                        color: 'error.contrastText',
                        borderRadius: 1,
                        fontSize: '14px',
                      }}
                    >
                      图片加载失败: {src}
                    </Box>
                  </Box>
                ),
                code: ({ className, children }) => {
                  const match = /language-(\w+)/.exec(className || '')
                  const getCodeText = (c: any): string => {
                    if (!c) return ''
                    if (typeof c === 'string') return c
                    if (Array.isArray(c)) return c.map(getCodeText).join('')
                    if (typeof c === 'object' && c.props) return getCodeText(c.props.children)
                    return ''
                  }
                  const codeText = getCodeText(children)
                  if (match) {
                    return (
                      <Box sx={{ position: 'relative', mb: 2 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleCopy(codeText)}
                          sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            bgcolor: 'rgba(255,255,255,0.1)',
                            color: '#ABB2BF',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                            zIndex: 1,
                          }}
                        >
                          <ContentCopy sx={{ fontSize: 18 }} />
                        </IconButton>
                        <Box
                          component="code"
                          className={className}
                          sx={{
                            display: 'block',
                            p: 2,
                            pt: 4,
                            bgcolor: '#282C34',
                            borderRadius: 1,
                            overflow: 'auto',
                            fontFamily: 'monospace',
                            fontSize: '13px',
                            color: '#ABB2BF',
                            maxHeight: 400,
                          }}
                        >
                          {children}
                        </Box>
                      </Box>
                    )
                  }
                  return (
                    <Box
                      component="code"
                      className={className}
                      sx={{
                        px: 0.5,
                        py: 0.25,
                        bgcolor: '#F5F5F5',
                        borderRadius: 0.5,
                        fontFamily: 'monospace',
                        fontSize: '0.9em',
                        color: '#E06C75',
                      }}
                    >
                      {children}
                    </Box>
                  )
                },
                pre: ({ children }) => (
                  <Box
                    component="pre"
                    sx={{
                      mb: 2,
                      borderRadius: 1,
                      overflow: 'auto',
                    }}
                  >
                    {children}
                  </Box>
                ),
                table: ({ children }) => (
                  <Box sx={{ overflow: 'auto', mb: 2 }}>
                    <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                      {children}
                    </Box>
                  </Box>
                ),
                th: ({ children }) => (
                  <Box
                    component="th"
                    sx={{
                      border: '1px solid #E0E0E0',
                      p: 1,
                      bgcolor: '#F5F5F5',
                      fontWeight: 600,
                      textAlign: 'left',
                    }}
                  >
                    {children}
                  </Box>
                ),
                td: ({ children }) => (
                  <Box
                    component="td"
                    sx={{
                      border: '1px solid #E0E0E0',
                      p: 1,
                    }}
                  >
                    {children}
                  </Box>
                ),
                blockquote: ({ children }) => (
                  <Box
                    component="blockquote"
                    sx={{
                      borderLeft: '4px solid #2196F3',
                      pl: 2,
                      ml: 0,
                      mb: 2,
                      color: 'text.secondary',
                      fontStyle: 'italic',
                    }}
                  >
                    {children}
                  </Box>
                ),
                a: ({ href, children }) => (
                  <Box
                    component="a"
                    href={href}
                    sx={{ color: '#1976D2', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    {children}
                  </Box>
                ),
              }}
            >
              {markdown}
            </ReactMarkdown>
          )}
        </Box>
      </Box>

      {/* 复制成功提示 */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        onClose={() => setCopySuccess(false)}
        message="代码已复制到剪贴板"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  )
}
