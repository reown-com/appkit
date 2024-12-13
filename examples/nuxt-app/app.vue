<script setup lang="ts">
import { createAppKit } from '@reown/appkit/vue'
import { mainnet, polygon, base } from '@reown/appkit/networks'
import { wagmiAdapter, projectId } from './config/wagmi'

createAppKit({
  adapters: [wagmiAdapter],
  networks: [mainnet, polygon, base],
  projectId,
  metadata: {
    name: 'AppKit Nuxt Example',
    description: 'AppKit Nuxt Example',
    url: 'https://reown.com/appkit',
    icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4']
  }
})
</script>

<template>
  <div>
    <appkit-button />
  </div>
</template>
