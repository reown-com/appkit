import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import vercel from 'vite-plugin-vercel'

export default defineConfig({
  plugins: [vue(), vercel()],
  define: {
    'import.meta.env.VITE_PROJECT_ID': JSON.stringify(process.env.VITE_PROJECT_ID)
  },
  build: {
    rollupOptions: {
      external: ['@tanstack/vue-query']
    }
  }
})
