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
  app: {
    head: {
      title: 'AppKit Nuxt Wagmi-Solana-Bitcoin Example',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'AppKit Nuxt Wagmi-Solana-Bitcoin Example' }
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
