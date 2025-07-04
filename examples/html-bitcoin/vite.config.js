import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  define: {
    global: 'globalThis',
  },
  plugins: [
    nodePolyfills({
      globals: {
        Buffer: true,
        process: true
      }
    })
  ],
  optimizeDeps: {
    include: ['bitcoinjs-lib'],
  },
  build: {
    rollupOptions: {
      external: [],
    },
  },
}) 