import { chain, configureChains, createClient } from '@wagmi/core'
import { ClientCtrl, ConfigCtrl } from '@web3modal/core'
import { modalConnectors, walletConnectProvider, Web3ModalEthereum } from '@web3modal/ethereum'
import '@web3modal/ui'
import './actions.js'
import './events.js'

// Define constants
const projectId = '8e6b5ffdcbc9794bf9f4a1952578365b'
const chains = [chain.mainnet]

const { provider } = configureChains(chains, [walletConnectProvider({ projectId })])

const wagmiClient = createClient({
  autoConnect: true,
  connectors: modalConnectors({ appName: 'web3Moda', chains }),
  provider
})

const ethereumClient = Web3ModalEthereum.create(wagmiClient, chains)

// Set up core and ethereum clients
ConfigCtrl.setConfig({
  projectId,
  theme: 'dark',
  accentColor: 'default'
})
ClientCtrl.setEthereumClient(ethereumClient, chains)
