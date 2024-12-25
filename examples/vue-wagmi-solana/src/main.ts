import './assets/main.css'

import { createApp } from 'vue'
import { WagmiPlugin } from '@wagmi/vue'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { wagmiAdapter } from './config/index'
import App from './App.vue'

const queryClient = new QueryClient()

createApp(App)
  // @ts-ignore
  .use(WagmiPlugin, { config: wagmiAdapter.wagmiConfig })
  .use(VueQueryPlugin, { queryClient })
  .mount('#app')
