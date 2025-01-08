<script setup lang="ts">
import { createAppKit } from '@reown/appkit/vue'
import { mainnet, polygon, base } from '@reown/appkit/networks'
import { wagmiAdapter, projectId, networks } from './config/wagmi'
import { useDisconnect } from '@reown/appkit/vue'

const { disconnect } = useDisconnect()

const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  themeMode: 'light',
  metadata: {
    name: 'AppKit Nuxt Example',
    description: 'AppKit Nuxt Example',
    url: 'https://reown.com/appkit',
    icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4']
  }
})
</script>

<template>
  <client-only>
    <appkit-button />
    <appkit-network-button />
    <button @click="disconnect">Disconnect</button>
  </client-only>
</template>
