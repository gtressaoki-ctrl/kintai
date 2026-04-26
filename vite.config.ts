import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/kintai/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png'],
      manifest: {
        name: '勤怠管理',
        short_name: '勤怠',
        description: '個人用勤怠管理アプリ',
        theme_color: '#1D4ED8',
        background_color: '#FFFFFF',
        display: 'standalone',
        start_url: '/kintai/',
        icons: [
          { src: '/kintai/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/kintai/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        navigateFallback: '/kintai/index.html',
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'external-cache' },
          },
        ],
      },
    }),
  ],
})
