import { defineNuxtPlugin } from '#imports'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'

export default defineNuxtPlugin(nuxt => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 5000 } }
  })

  nuxt.vueApp.use(VueQueryPlugin, {
    queryClient,
    enableDevtoolsV6Plugin: true
  })
})
