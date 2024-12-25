<template>
  <div class="page-container">
    <div class="logo-container">
      <img
        :src="themeState.themeMode === 'dark' ? '/reown-logo-white.png' : '/reown-logo.png'"
        alt="Reown"
        width="200"
      />
      <img src="/appkit-logo.png" alt="Reown" width="200" />
    </div>

    <h1 class="page-title">Vue Wagmi + Solana Example</h1>

    <div class="appkit-buttons-container">
      <appkit-button />
      <appkit-network-button />
    </div>

    <ActionButtonList />
    <div className="advice">
      <p>
        This projectId only works on localhost. Go to
        <a href="https://cloud.reown.com" target="_blank" rel="Reown Cloud">Reown Cloud</a> to get
        your own.
      </p>
    </div>
    <InfoList />
  </div>
</template>

<script>
import { createAppKit, useAppKitTheme } from '@reown/appkit/vue'
import { solanaWeb3JsAdapter, wagmiAdapter, networks, projectId } from './config/index'

import ActionButtonList from './components/ActionButton.vue'
import InfoList from './components/InfoList.vue'

// Initialize AppKit
createAppKit({
  adapters: [wagmiAdapter, solanaWeb3JsAdapter],
  networks,
  projectId,
  themeMode: 'light',
  features: {
    analytics: true // Optional - defaults to your Cloud configuration
  },
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
    InfoList
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
