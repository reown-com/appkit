import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    sveltekit(),
    nodePolyfills({
      // Include specific Node.js modules needed by @solana/web3.js
      include: ['http', 'https', 'crypto', 'stream', 'zlib', 'util', 'buffer'],
      globals: {
        Buffer: true,
        global: true,
        process: true
      }
    })
  ],
  define: {
    // Define global variables for browser compatibility
    global: 'globalThis'
  }
})
