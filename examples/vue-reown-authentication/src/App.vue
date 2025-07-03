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

    <h1 class="page-title">Vue AppKit Reown Authentication Example</h1>

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
import { ReownAuthentication } from '@reown/appkit-siwx'
import { createAppKit, useAppKitTheme } from '@reown/appkit/vue'

import ActionButtonList from './components/ActionButton.vue'
import Footer from './components/Footer.vue'
import InfoList from './components/InfoList.vue'
import { networks, projectId } from './config'

// Initialize AppKit
createAppKit({
  adapters: [],
  networks,
  projectId,
  themeMode: 'light',
  metadata: {
    name: 'AppKit AppKit Core Example',
    description: 'AppKit AppKit Core Example',
    url: 'https://reown.com/appkit',
    icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4']
  },
  siwx: new ReownAuthentication()
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
