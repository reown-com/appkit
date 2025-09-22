// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      projectId: process.env.NUXT_PROJECT_ID
    }
  },
  ssr: false,
  modules: ['@wagmi/vue/nuxt'],
  css: ['~/assets/main.css'],

  // Add Vite configuration to handle native dependencies
  vite: {
    optimizeDeps: {
      exclude: ['oxc-parser', '@oxc-parser/binding-darwin-arm64']
    },
    define: {
      global: 'globalThis'
    }
  },

  // Add Node.js compatibility for native bindings
  nitro: {
    experimental: {
      wasm: true
    },
    // Exclude native bindings from bundling
    externals: {
      inline: ['oxc-parser']
    }
  },

  // Build configuration to handle native modules
  build: {
    transpile: []
  },

  app: {
    head: {
      title: 'AppKit Nuxt Wagmi Example',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'AppKit Nuxt Wagmi Example' }
      ],
      link: [
        {
          id: 'favicon',
          rel: 'icon',
          href: '/favicon-dark.png',
          media: '(prefers-color-scheme: light)'
        },
        {
          id: 'favicon',
          rel: 'icon',
          href: '/favicon.png',
          media: '(prefers-color-scheme: dark)'
        }
      ]
    }
  }
})
