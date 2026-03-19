import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  // 设置基础路径，用于部署在子路径下
  // 生产环境部署在 /chartmuseum-web/ 路径下
  base: '/chartmuseum-web/',
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/info': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
