export * as WagmiCore from '@wagmi/core'
export * as WagmiCoreChains from '@wagmi/core/chains'
import { publicProvider } from '@wagmi/core/providers/public'
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc'
import { alchemyProvider } from '@wagmi/core/providers/alchemy'
import { infuraProvider } from '@wagmi/core/providers/infura'

export { EthereumClient } from './src/client'
export { w3mConnectors, w3mProvider } from './src/utils'

import { CoinbaseWalletConnector } from '@wagmi/core/connectors/coinbaseWallet'
import { InjectedConnector } from '@wagmi/core/connectors/injected'
import { LedgerConnector } from '@wagmi/core/connectors/ledger'
import { MetaMaskConnector } from '@wagmi/core/connectors/metaMask'

export const WagmiCoreConnectors = {
  CoinbaseWalletConnector,
  InjectedConnector,
  MetaMaskConnector,
  LedgerConnector
}
export const WagmiCoreProviders = {
  publicProvider,
  jsonRpcProvider,
  alchemyProvider,
  infuraProvider
}
