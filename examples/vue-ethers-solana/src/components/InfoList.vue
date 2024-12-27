<template>
  <div class="code-container-wrapper">
    <section class="code-container">
      <h2 class="code-container-title">useAppKitAccount()</h2>
      <div class="code-container-content">
        <pre>{{ JSON.stringify(accountState, null, 2) }}</pre>
      </div>
    </section>

    <section class="code-container">
      <h2 class="code-container-title">useAppKitNetwork()</h2>
      <div class="code-container-content">
        <pre>{{ JSON.stringify(networkState, null, 2) }}</pre>
      </div>
    </section>

    <section class="code-container">
      <h2 class="code-container-title">useAppKitTheme()</h2>
      <div class="code-container-content">
        <pre>{{ JSON.stringify(themeState, null, 2) }}</pre>
      </div>
    </section>

    <section class="code-container">
      <h2 class="code-container-title">useAppKitState()</h2>
      <div class="code-container-content">
        <pre>{{ JSON.stringify(appKitState, null, 2) }}</pre>
      </div>
    </section>

    <section class="code-container">
      <h2 class="code-container-title">useAppKitEvents()</h2>
      <div class="code-container-content">
        <pre>{{ JSON.stringify(eventsState, null, 2) }}</pre>
      </div>
    </section>

    <section class="code-container">
      <h2 class="code-container-title">useWalletInfo()</h2>
      <div class="code-container-content">
        <pre>{{ JSON.stringify(walletState, null, 2) }}</pre>
      </div>
    </section>
  </div>
</template>

<script>
import { onMounted } from 'vue'
import {
  useAppKitState,
  useAppKitTheme,
  useAppKitEvents,
  useAppKitAccount,
  useWalletInfo,
  useAppKitNetwork
} from '@reown/appkit/vue'

export default {
  name: 'InfoList',
  setup() {
    const themeState = useAppKitTheme()
    const appKitState = useAppKitState()
    const accountState = useAppKitAccount()
    const networkState = useAppKitNetwork()
    const eventsState = useAppKitEvents()
    const walletState = useWalletInfo()

    return {
      themeState,
      appKitState,
      networkState,
      eventsState,
      accountState,
      walletState
    }
  }
}
</script>
