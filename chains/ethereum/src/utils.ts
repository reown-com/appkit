import { InjectedConnector } from '@wagmi/core'
import { CoinbaseWalletConnector } from '@wagmi/core/connectors/coinbaseWallet'
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect'
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc'
import type { ModalConnectorsOpts, WalletConnectProviderOpts } from './types'

// -- constants ------------------------------------------------------- //
export const NAMESPACE = 'eip155'
const APP_TAG = 'app=2'

// -- providers ------------------------------------------------------- //
export function walletConnectProvider({ projectId }: WalletConnectProviderOpts) {
  return jsonRpcProvider({
    rpc: chain => ({
      http: `https://rpc.walletconnect.com/v1/?chainId=${NAMESPACE}:${chain.id}&projectId=${projectId}&${APP_TAG}`
    })
  })
}

// -- connectors ------------------------------------------------------ //
export function modalConnectors({ appName, chains }: ModalConnectorsOpts) {
  return [
    new WalletConnectConnector({ chains, options: { qrcode: false } }),
    new InjectedConnector({
      chains,
      options: { shimDisconnect: true, shimChainChangedDisconnect: true }
    }),
    new CoinbaseWalletConnector({ chains, options: { appName, headlessMode: true } })
  ]
}
