<template>
  <div class="page-container">
    <div class="logo-container">
      <img
        :src="themeState.themeMode === 'dark' ? '/reown-logo-white.png' : '/reown-logo.png'"
        alt="Reown"
        width="150"
      />
      <img src="/appkit-logo.png" alt="Reown" width="150" />
    </div>

    <h1 class="page-title">Vue Ethers + Solana Example</h1>

    <div class="appkit-buttons-container">
      <appkit-button />
      <appkit-network-button />
    </div>

    <ActionButtonList />

    <InfoList />

    <Footer />
  </div>
</template>

<script>
import { createAppKit, useAppKitTheme } from '@reown/appkit/vue'

import ActionButtonList from './components/ActionButton.vue'
import Footer from './components/Footer.vue'
import InfoList from './components/InfoList.vue'
import { ethersAdapter, networks, projectId, solanaWeb3JsAdapter } from './config'

// Initialize AppKit
createAppKit({
  adapters: [ethersAdapter, solanaWeb3JsAdapter],
  networks,
  projectId,
  themeMode: 'light',
  metadata: {
    name: 'AppKit Vue Example',
    description: 'AppKit Vue Example',
    url: 'https://reown.com/appkit',
    icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4']
  }
})

export default {
  name: 'App',
  components: {
    ActionButtonList,
    InfoList,
    Footer
  },
  setup() {
    const themeState = useAppKitTheme()
    document.documentElement.className = themeState.themeMode
    return {
      themeState
    }
  }
}
</script>
