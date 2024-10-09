import { resolve } from 'path'

import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/appkit.ts'),
      name: 'AppKit',
      formats: ['umd'],
      fileName: (_, entryName) => `${entryName}.js`
    },
    rollupOptions: {
      output: {
        globals: {
          '@reown/appkit': 'AppKit'
        }
      }
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
  ],
  define: {
    'process.env.NODE_ENV': 'development'
  }
})
