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

    <section class="code-container">
      <h2 class="code-container-title">useAppKitSiwx()</h2>
      <div class="code-container-content">
        <pre>{{ JSON.stringify(siwxState, null, 2) }}</pre>
      </div>
    </section>

    <section class="code-container">
      <h2 class="code-container-title">SIWX Session</h2>
      <div class="code-container-content">
        <pre>{{ session ? JSON.stringify(session, null, 2) : 'No session detected yet' }}</pre>
      </div>
    </section>
  </div>
</template>

<script>
import { onMounted, onUnmounted, ref } from 'vue'

import { useAppKitSIWX } from '@reown/appkit-siwx/vue'
import {
  useAppKitAccount,
  useAppKitEvents,
  useAppKitNetwork,
  useAppKitState,
  useAppKitTheme,
  useWalletInfo
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
    const siwxState = useAppKitSIWX()
    const siwx = useAppKitSIWX()

    // Listen to the SIWX session changes
    const session = ref()
    onMounted(() => {
      siwx.value.on('session-changed', newSession => {
        session.value = newSession
      })
    })
    onUnmounted(() => {
      siwx.value.removeAllListeners()
    })

    return {
      themeState,
      appKitState,
      networkState,
      eventsState,
      accountState,
      walletState,
      siwxState,
      session
    }
  }
}
</script>
