import '@web3modal/polyfills'

import type { Chain } from '@wagmi/core'
import { configureChains, createConfig } from '@wagmi/core'
import { CoinbaseWalletConnector } from '@wagmi/core/connectors/coinbaseWallet'
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect'
import { publicProvider } from '@wagmi/core/providers/public'
import { Web3ModalInjectedConnector } from '../connectors/Web3ModalInjectedConnector.js'
import { walletConnectProvider } from './provider.js'

export interface ConfigOptions {
  appName: string
  projectId: string
  chains: Chain[]
}

export function defaultWagmiConfig({ projectId, chains, appName }: ConfigOptions) {
  const { publicClient } = configureChains(chains, [
    walletConnectProvider({ projectId }),
    publicProvider()
  ])

  return createConfig({
    autoConnect: true,
    connectors: [
      new WalletConnectConnector({ chains, options: { projectId, showQrModal: false } }),
      new Web3ModalInjectedConnector({ chains }),
      new CoinbaseWalletConnector({ chains, options: { appName } })
    ],
    publicClient
  })
}
