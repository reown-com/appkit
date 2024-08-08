import { resolve } from 'path'

import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: {
        wagmi: resolve(__dirname, 'lib/wagmi.ts'),
        ethers: resolve(__dirname, 'lib/ethers.ts')
      }
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
