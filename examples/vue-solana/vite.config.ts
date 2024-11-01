import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  define: {
    'import.meta.env.VITE_PROJECT_ID': JSON.stringify(process.env.VITE_PROJECT_ID)
  }
})
