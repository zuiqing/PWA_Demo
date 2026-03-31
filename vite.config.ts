import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/monitor/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        name: 'QV 监控',
        short_name: 'QV监控',
        description: 'QV IoT 设备视频监控管理',
        theme_color: '#0D47A1',
        background_color: '#F5F5F5',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/monitor/',
        start_url: '/monitor/',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.qvcloud\.net\/.*/i,
            handler: 'NetworkOnly'
          }
        ]
      }
    })
  ],
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
    proxy: {
      '/api/cloud': {
        target: 'https://openapi.qvcloud.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/cloud/, ''),
      },
      '/api/device-proxy': {
        target: 'https://27.124.24.191:55096', // 默认测试地址
        changeOrigin: true,
        secure: false,
        // @ts-ignore - 'router' exists in http-proxy but might not be in Vite types
        router: (req) => {
          // 路径格式: /api/device-proxy/host:port/tdkcgi
          const match = req.url.match(/\/api\/device-proxy\/([^\/]+)/)
          if (match) {
            const targetHost = match[1]
            console.log(`[Device Proxy] Dynamic Route: https://${targetHost}`)
            return `https://${targetHost}`
          }
        },
        rewrite: (path) => path.replace(/^\/api\/device-proxy\/[^\/]+/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req: any) => {
            const match = req.url?.match(/\/api\/device-proxy\/([^\/]+)/)
            if (match) {
              proxyReq.setHeader('host', match[1])
            }
          })
          proxy.on('error', (err, req, res: any) => {
            console.error('[Device Proxy] Error:', err.message)
            if (!res.headersSent) {
              res.writeHead(500, { 'Content-Type': 'text/plain' })
              res.end(`Proxy error: ${err.message}`)
            }
          })
        },
      },
    },
  }
})
