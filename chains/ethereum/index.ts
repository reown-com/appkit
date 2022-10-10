export type { Chain, ChainProviderFn, Connector, Provider, WebSocketProvider } from '@wagmi/core'
export { Web3ModalEthereum } from './src/api'
export { chains, providers } from './src/utils/wagmiTools'
export * from './types/apiTypes'

// -- vanilla ----------------------------------------------- //
import { Web3ModalEthereum as Web3ModalEthereumClient } from './src/api'
import { chains, providers } from './src/utils/wagmiTools'

const Web3ModalEthereum = {
  ...Web3ModalEthereumClient,
  chains,
  providers
}

if (typeof window !== 'undefined') window.Web3ModalEth = Web3ModalEthereum

declare global {
  interface Window {
    Web3ModalEth: typeof Web3ModalEthereum
  }
}
