<script setup>
import { useWeb3Modal } from '@web3modal/wagmi/vue'
import { configureChains, createConfig } from '@wagmi/core'
import { arbitrum, mainnet } from 'wagmi/chains'
import { CoinbaseWalletConnector } from '@wagmi/core/connectors/coinbaseWallet'
import { InjectedConnector } from '@wagmi/core/connectors/injected'
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect'
import { publicProvider } from '@wagmi/core/providers/public'

// 1. Get projectId
const projectId = import.meta.env.VITE_PROJECT_ID
if (!projectId) {
  throw new Error('VITE_PROJECT_ID is not set')
}

// 2. Create wagmiConfig
const { chains, publicClient } = configureChains([mainnet, arbitrum], [publicProvider()])
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [
    new WalletConnectConnector({ chains, options: { projectId, showQrModal: false } }),
    new InjectedConnector({ chains, options: { shimDisconnect: true } }),
    new CoinbaseWalletConnector({ chains, options: { appName: 'Web3Modal' } })
  ],
  publicClient
})

const modal = useWeb3Modal({ wagmiConfig, projectId, chains })
</script>

<template>
  <button @click="() => modal.open()">Open Modal</button>
</template>
