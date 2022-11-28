import { chain, configureChains, createClient } from '@wagmi/core'
import { EthereumClient, modalConnectors, walletConnectProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/html'

// 1. Define constants
const projectId = '8e6b5ffdcbc9794bf9f4a1952578365b'
const chains = [chain.mainnet]

// 2. Configure wagmi client
const { provider } = configureChains(chains, [walletConnectProvider({ projectId })])
const wagmiClient = createClient({
  autoConnect: true,
  connectors: modalConnectors({ appName: 'web3Modal', chains }),
  provider
})

// 3. Create ethereum client and modal client
const ethereumClient = new EthereumClient(wagmiClient, chains)
export const web3Modal = new Web3Modal({ projectId }, ethereumClient)

// 5. See docs for usage https://docs.walletconnect.com/2.0/web3modal/html-js/actions
