import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { WagmiPlugin } from '@wagmi/vue'
import { createApp } from 'vue'

// @ts-ignore
import App from './App.vue'
import './assets/main.css'
import { wagmiAdapter } from './config'

const queryClient = new QueryClient()

createApp(App)
  // @ts-ignore
  .use(WagmiPlugin, { config: wagmiAdapter.wagmiConfig })
  .use(VueQueryPlugin, { queryClient })
  .mount('#app')
