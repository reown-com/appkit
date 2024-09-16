<script lang="ts" setup>
import {
  createAppKit,
  useAppKit,
  useAppKitEvents,
  useAppKitState,
  useAppKitTheme
} from '@reown/appkit-solana/vue'
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
const chains = [
  {
    chainId: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
    name: 'Solana',
    currency: 'SOL',
    explorerUrl: 'https://solscan.io',
    rpcUrl: 'https://rpc.walletconnect.org/v1'
  },
  {
    chainId: '4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z',
    name: 'Solana Testnet',
    currency: 'SOL',
    explorerUrl: 'https://explorer.solana.com/?cluster=testnet',
    rpcUrl: 'https://rpc.walletconnect.org/v1'
  },
  {
    chainId: 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
    name: 'Solana Devnet',
    currency: 'SOL',
    explorerUrl: 'https://explorer.solana.com/?cluster=devnet',
    rpcUrl: 'https://rpc.walletconnect.org/v1'
  }
]

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
  caipNetworks: chains,
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
