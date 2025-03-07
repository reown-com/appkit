<template>
  <div class="code-container-wrapper">
    <section class="code-container">
      <h2 class="code-container-title">useAppKitAccount() EVM</h2>
      <div class="code-container-content">
        <pre>{{ JSON.stringify(evmAccountState, null, 2) }}</pre>
      </div>
    </section>

    <section class="code-container">
      <h2 class="code-container-title">useAppKitAccount() Solana</h2>
      <div class="code-container-content">
        <pre>{{ JSON.stringify(solanaAccountState, null, 2) }}</pre>
      </div>
    </section>

    <section class="code-container">
      <h2 class="code-container-title">useAppKitAccount() Bitcoin</h2>
      <div class="code-container-content">
        <pre>{{ JSON.stringify(bitcoinAccountState, null, 2) }}</pre>
      </div>
    </section>

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
    const evmAccountState = useAppKitAccount({ namespace: 'eip155' })
    const solanaAccountState = useAppKitAccount({ namespace: 'solana' })
    const bitcoinAccountState = useAppKitAccount({ namespace: 'bip122' })
    const networkState = useAppKitNetwork()
    const eventsState = useAppKitEvents()
    const walletState = useWalletInfo()

    return {
      themeState,
      appKitState,
      networkState,
      eventsState,
      accountState,
      evmAccountState,
      solanaAccountState,
      bitcoinAccountState,
      walletState
    }
  }
}
</script>
