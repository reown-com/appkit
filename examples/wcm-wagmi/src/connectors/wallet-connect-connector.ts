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
    icons: ['https://app.uniswap.org/favicon.png']
  },
  qrModalOptions: {
    themeVariables: {
      '--wcm-font-family': '"Inter custom", sans-serif',
      '--wcm-z-index': '1000'
    }
  },
  showQrModal: true,
  logger: 'debug',
  chains: [mainnet.id, sepolia.id]
}

export const customWalletConnectConnector = createConnector(config => {
  const connector = walletConnect(WC_PARAMS)(config)

  config.emitter.on('message', ({ type, data }) => {
    if (type === 'display_uri') {
      // This is how you can customize handling the display_uri event
      console.log('display_uri', data)
    }
  })

  return connector
})
