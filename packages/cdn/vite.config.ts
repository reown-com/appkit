import { resolve } from 'path'

import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/appkit.ts'),
      name: 'AppKit',
      formats: ['es'],
      fileName: (_, entryName) => `${entryName}.js`
    },
    sourcemap: true,
    minify: 'terser'
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
