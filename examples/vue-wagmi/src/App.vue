<script lang="ts" setup>
import { mainnet, arbitrum } from '@wagmi/core/chains'
import {
  createWeb3Modal,
  useWeb3Modal,
  defaultWagmiConfig,
  useWeb3ModalTheme
} from '@web3modal/wagmi/vue'
import { onMounted } from 'vue'

// 1. Get projectId
const projectId = import.meta.env.VITE_PROJECT_ID
if (!projectId) {
  throw new Error('VITE_PROJECT_ID is not set')
}

// 2. Create wagmiConfig
const chains = [mainnet, arbitrum]
const wagmiConfig = defaultWagmiConfig({ chains, projectId, appName: 'Web3Modal' })

// 3. Create modal
createWeb3Modal({
  wagmiConfig,
  projectId,
  chains,
  themeMode: 'light',
  themeVariables: {
    '--w3m-color-mix': '#00BB7F',
    '--w3m-color-mix-strength': 40
  }
})

// 4. Use modal composable
const modal = useWeb3Modal()
</script>

<template>
  <button @click="modal.open()">Open Connect Modal</button>
  <button @click="modal.open({ view: 'Networks' })">Open Network Modal</button>
</template>
