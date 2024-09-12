<script lang="ts" setup>
import { EVMEthers5Client } from '@rerock/appkit-adapter-ethers5'
import {
  createWeb3Modal,
  useWeb3Modal,
  useWeb3ModalEvents,
  useWeb3ModalState,
  useWeb3ModalTheme
} from '@rerock/base/vue'
import { mainnet, arbitrum } from '@rerock/base/chains'

// @ts-expect-error 1. Get projectId
const projectId = import.meta.env.VITE_PROJECT_ID
if (!projectId) {
  throw new Error('VITE_PROJECT_ID is not set')
}

function getBlockchainApiRpcUrl(chainId) {
  return `https://rpc.walletconnect.org/v1/?chainId=eip155:${chainId}&projectId=${projectId}`
}

// 2. Set Ethers adapter
const ethersAdapter = new EVMEthers5Client()

// 3. Create modal
createWeb3Modal({
  ethersConfig,
  projectId,
  metadata: {
    name: 'AppKit',
    description: 'AppKit Laboratory',
    url: 'https://example.com',
    icons: ['https://avatars.githubusercontent.com/u/37784886']
  },
  caipNetworks: [mainnet, arbitrum],
  themeMode: 'light',
  themeVariables: {
    '--w3m-color-mix': '#00BB7F',
    '--w3m-color-mix-strength': 20
  }
})

// 4. Use modal composable
const modal = useWeb3Modal()
const state = useWeb3ModalState()
const { setThemeMode, themeMode, themeVariables } = useWeb3ModalTheme()
const events = useWeb3ModalEvents()
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
