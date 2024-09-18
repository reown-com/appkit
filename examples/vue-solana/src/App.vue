<script lang="ts" setup>
import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks'
import {
  createAppKit,
  useAppKit,
  useAppKitEvents,
  useAppKitState,
  useAppKitTheme
} from '@reown/appkit/vue'
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack'
import {
  PhantomWalletAdapter,
  HuobiWalletAdapter,
  SolflareWalletAdapter,
  TrustWalletAdapter
} from '@solana/wallet-adapter-wallets'

// @ts-expect-error 1. Get projectId
const projectId = import.meta.env.VITE_PROJECT_ID
if (!projectId) {
  throw new Error('VITE_PROJECT_ID is not set')
}

// 2. Set chains
const networks = [solana, solanaTestnet, solanaDevnet]

// 3. Create modal
createAppKit({
  metadata: {
    name: 'AppKit React Example',
    description: 'AppKit React Example',
    url: '',
    icons: []
  },
  projectId,
  themeMode: 'light',
  networks,
  wallets: [
    new BackpackWalletAdapter(),
    new HuobiWalletAdapter(),
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new TrustWalletAdapter()
  ],
  themeVariables: {
    '--w3m-color-mix': '#00DCFF',
    '--w3m-color-mix-strength': 20
  }
})

// 4. Use modal composable
const modal = useAppKit()
const state = useAppKitState()
const { setThemeMode, themeMode, themeVariables } = useAppKitTheme()
const events = useAppKitEvents()
</script>

<template>
  <w3m-button />
  <w3m-network-button />
  <w3m-connect-button />
  <w3m-account-button />

  <button @click="modal.open()">Open Connect Modal</button>
  <button @click="modal.open({ view: 'Networks' })">Open Network Modal</button>
  <button @click="setThemeMode(themeMode === 'dark' ? 'light' : 'dark')">Toggle Theme Mode</button>
  <pre>{{ JSON.stringify(state, null, 2) }}</pre>
  <pre>{{ JSON.stringify({ themeMode, themeVariables }, null, 2) }}</pre>
  <pre>{{ JSON.stringify(events, null, 2) }}</pre>
</template>
