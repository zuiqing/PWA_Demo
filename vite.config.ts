import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import http from 'http'
import https from 'https'

// 自定义设备代理插件
function deviceProxyPlugin(): Plugin {
  return {
    name: 'device-proxy',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || ''

        // 匹配 /api/device-proxy-https/host:port/...
        const httpsMatch = url.match(/^\/api\/device-proxy-https\/([^\/]+)(\/.*)$/)
        if (httpsMatch) {
          const targetHost = httpsMatch[1]
          const targetPath = httpsMatch[2]
          console.log(`[Device Proxy HTTPS] ${url} -> https://${targetHost}${targetPath}`)

          const [hostname, portStr] = targetHost.split(':')
          const port = parseInt(portStr || '443')

          const options: https.RequestOptions = {
            hostname,
            port,
            path: targetPath,
            method: req.method,
            headers: { ...req.headers, host: targetHost },
            rejectUnauthorized: false, // 跳过SSL证书验证
          }

          const proxyReq = https.request(options, (proxyRes) => {
            res.writeHead(proxyRes.statusCode || 200, proxyRes.headers)
            proxyRes.pipe(res)
          })

          proxyReq.on('error', (err: Error) => {
            console.error('[Device Proxy HTTPS] Error:', err.message)
            if (!res.headersSent) {
              res.writeHead(500, { 'Content-Type': 'text/plain' })
              res.end(`Proxy error: ${err.message}`)
            }
          })

          req.pipe(proxyReq)
          return
        }

        // 匹配 /api/device-proxy-http/host:port/...
        const httpMatch = url.match(/^\/api\/device-proxy-http\/([^\/]+)(\/.*)$/)
        if (httpMatch) {
          const targetHost = httpMatch[1]
          const targetPath = httpMatch[2]
          console.log(`[Device Proxy HTTP] ${url} -> http://${targetHost}${targetPath}`)

          const [hostname, portStr] = targetHost.split(':')
          const port = parseInt(portStr || '80')

          const options: http.RequestOptions = {
            hostname,
            port,
            path: targetPath,
            method: req.method,
            headers: { ...req.headers, host: targetHost },
          }

          const proxyReq = http.request(options, (proxyRes) => {
            res.writeHead(proxyRes.statusCode || 200, proxyRes.headers)
            proxyRes.pipe(res)
          })

          proxyReq.on('error', (err: Error) => {
            console.error('[Device Proxy HTTP] Error:', err.message)
            if (!res.headersSent) {
              res.writeHead(500, { 'Content-Type': 'text/plain' })
              res.end(`Proxy error: ${err.message}`)
            }
          })

          req.pipe(proxyReq)
          return
        }

        next()
      })
    },
  }
}

export default defineConfig({
  base: '/monitor/',
  plugins: [
    react(),
    deviceProxyPlugin(),
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
    },
  }
})
