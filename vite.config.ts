import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // 将 wps-sdk-wrapper 指向根目录的源码，方便开发调试
      'wps-sdk-wrapper': resolve(__dirname, './index.ts'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'example-dist',
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
    },
  },
})
