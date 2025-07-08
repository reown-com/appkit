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

    <h1 class="page-title">Vue Wagmi + Solana Example</h1>

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
import { useAppKitTheme } from '@reown/appkit/vue'

import ActionButtonList from './components/ActionButton.vue'
import Footer from './components/Footer.vue'
import InfoList from './components/InfoList.vue'

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
