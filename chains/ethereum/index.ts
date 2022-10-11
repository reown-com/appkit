export type { Chain, ChainProviderFn, Connector, Provider, WebSocketProvider } from '@wagmi/core'
export { Web3ModalEthereum } from './src/api'
export { chains, providers } from './src/utils/wagmiTools'
export * from './types/apiTypes'

// -- vanilla ----------------------------------------------- //
import { Web3ModalEthereum as Web3ModalEthereumApi } from './src/api'
import { chains, providers } from './src/utils/wagmiTools'

const Web3ModalEthereum = {
  chains,
  providers,
  ...Web3ModalEthereumApi
}

if (typeof window !== 'undefined') window.Web3ModalEthereum = Web3ModalEthereum

declare global {
  interface Window {
    Web3ModalEthereum: typeof Web3ModalEthereum
  }
}
