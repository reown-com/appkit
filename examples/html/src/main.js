import { ClientCtrl, ConfigCtrl } from '@web3modal/core'
import { modalChains, modalProviders } from '@web3modal/ethereum'
import '@web3modal/ui'
import './actions.js'
import './events.js'

// Define constants
const PROJECT_ID = '8e6b5ffdcbc9794bf9f4a1952578365b'

const clientConfig = {
  projectId: PROJECT_ID,
  theme: 'dark',
  accentColor: 'default'
}

const ethereumConfig = {
  appName: 'web3Modal',
  autoConnect: true,
  chains: [modalChains.mainnet],
  providers: [modalProviders.walletConnectProvider({ projectId: PROJECT_ID })]
}

// Set up core and ethereum clients
ConfigCtrl.setConfig(clientConfig)
ClientCtrl.setEthereumClient(ethereumConfig)
