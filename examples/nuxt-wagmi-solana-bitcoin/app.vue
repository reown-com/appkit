<script setup lang="ts">
import { createAppKit, useAppKitTheme } from '@reown/appkit/vue'

import { bitcoinAdapter, networks, projectId, solanaAdapter, wagmiAdapter } from './config/appkit'

createAppKit({
  adapters: [wagmiAdapter, solanaAdapter, bitcoinAdapter],
  networks,
  projectId,
  themeMode: 'light',

  metadata: {
    name: 'AppKit Nuxt Wagmi Example',
    description: 'AppKit Nuxt Wagmi Example',
    url: 'https://reown.com/appkit',
    icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4']
  }
})

const themeState = useAppKitTheme()
</script>

<template>
  <client-only>
    <div class="page-container">
      <div class="logo-container">
        <img
          :src="themeState.themeMode === 'dark' ? '/reown-logo-white.png' : '/reown-logo.png'"
          alt="Reown"
          width="150"
        />
        <img src="/appkit-logo.png" alt="Reown" width="150" />
      </div>

      <h1 class="page-title">Nuxt Wagmi-Solana-Bitcoin Example</h1>

      <div class="appkit-buttons-container">
        <appkit-button />
        <appkit-network-button />
      </div>

      <ActionButton />
      <InfoList />
      <Footer />
    </div>
  </client-only>
</template>
