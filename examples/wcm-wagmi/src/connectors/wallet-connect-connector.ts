import { mainnet, sepolia } from 'viem/chains'
import { createConnector } from 'wagmi'
import { type WalletConnectParameters, walletConnect } from 'wagmi/connectors'

import { constants } from '../constants'

export const WC_PARAMS: WalletConnectParameters & { chains: any[] } = {
  projectId: constants.PROJECT_ID,
  metadata: {
    name: 'Cool DApp',
    description: 'An super cool dapp',
    url: 'https://reown.com',
    icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4']
  },
  qrModalOptions: {
    themeVariables: {
      '--wcm-font-family': '"Inter custom", sans-serif',
      '--wcm-z-index': '1000'
    }
  },

  // To enable a custom QR Modal, set showQrModal to false
  showQrModal: true,

  // Appending chains was needed to force new Ethereum Provider to work correctly
  chains: [mainnet.id, sepolia.id]
}

export const customWalletConnectConnector = createConnector(config => {
  // In case `showQRModal` is set to false, you don't need to install `@reown/appkit` package, but it will require to handle the `display_uri` event
  const connector = walletConnect({ ...WC_PARAMS, showQrModal: false })(config)

  return {
    ...connector,
    id: 'custom-wallet-connect',
    name: 'Custom Wallet Connect'
  }
})

// This connector is going to require `@reown/appkit` package to work correctly
export const defaultWalletConnectConnector = walletConnect(WC_PARAMS)
