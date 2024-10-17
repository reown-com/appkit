<script lang="ts" setup>
import { Ethers5Adapter } from '@reown/appkit-adapter-ethers5'
import {
  createAppKit,
  useAppKit,
  useAppKitEvents,
  useAppKitState,
  useAppKitTheme
} from '@reown/appkit/vue'
import { mainnet, arbitrum } from '@reown/appkit/networks'

// @ts-expect-error 1. Get projectId
const projectId = import.meta.env.VITE_PROJECT_ID
if (!projectId) {
  throw new Error('VITE_PROJECT_ID is not set')
}

function getBlockchainApiRpcUrl(chainId) {
  return `https://maksy.ngrok.dev/v1/?chainId=eip155:${chainId}&projectId=${projectId}`
}

// 2. Set Ethers adapter
const ethersAdapter = new Ethers5Adapter()

// 3. Create modal
createAppKit({
  ethersConfig,
  projectId,
  metadata: {
    name: 'AppKit',
    description: 'AppKit Laboratory',
    url: 'https://example.com',
    icons: ['https://avatars.githubusercontent.com/u/37784886']
  },
  networks: [mainnet, arbitrum],
  themeMode: 'light',
  themeVariables: {
    '--w3m-color-mix': '#00BB7F',
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
