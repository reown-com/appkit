import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: {
        'exports/index': resolve(__dirname, 'exports/index.ts'),
        'exports/utils': resolve(__dirname, 'exports/utils.ts')
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`
    },
    outDir: 'dist/esm',
    emptyOutDir: true,
    rollupOptions: {
      external: ['@reown/appkit-common', '@reown/appkit-polyfills', 'zod']
    }
  }
})
