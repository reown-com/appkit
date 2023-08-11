<script>
import { Web3Modal } from '@web3modal/wagmi/vue'
import { configureChains, createConfig } from '@wagmi/core'
import { arbitrum, mainnet } from 'wagmi/chains'
import { CoinbaseWalletConnector } from '@wagmi/core/connectors/coinbaseWallet'
import { InjectedConnector } from '@wagmi/core/connectors/injected'
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect'
import { publicProvider } from '@wagmi/core/providers/public'

export default {
  components: {
    Web3Modal
  },

  data() {
    const projectId = 'd99dde3b11a5eb0ed2dc9947a1e7c0a5'
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

    return {
      wagmiConfig,
      chains,
      projectId
    }
  }
}
</script>

<template>
  <Web3Modal :wagmiConfig="wagmiConfig" :chains="chains" :projectId="projectId" />
</template>
