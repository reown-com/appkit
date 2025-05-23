import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    allowedHosts: ['localhost', '127.0.0.1', 'practice-scanned-trail-approx.trycloudflare.com']
  }
})
