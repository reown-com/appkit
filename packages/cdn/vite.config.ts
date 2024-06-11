import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: 'wagmi.ts',
      name: 'wagmi',
      fileName: 'wagmi'
    }
  },
  plugins: [
    nodePolyfills({
      globals: {
        Buffer: true,
        process: true
      }
    })
  ]
})
