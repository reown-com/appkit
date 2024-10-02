import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi'
import { arbitrum, mainnet } from 'wagmi/chains'

const projectId = import.meta.env.VITE_PROJECT_ID

if (!projectId) {
  throw new Error('VITE_PROJECT_ID is not set')
}

let web3modal: ReturnType<typeof createWeb3Modal>

const wagmiConfig = defaultWagmiConfig({
  projectId,
  chains: [mainnet, arbitrum],
  metadata: {
    name: 'AppKit',
    description: 'AppKit React Wagmi Example',
    url: '',
    icons: []
  },
  ssr: true
})

export function initializeWeb3Modal() {
  web3modal = createWeb3Modal({
    wagmiConfig,
    projectId,
    defaultChain: mainnet,
    themeMode: 'light',
    themeVariables: {
      '--w3m-color-mix': '#00DCFF',
      '--w3m-color-mix-strength': 20
    }
  })
}

export function getWeb3Modal() {
  if (!web3modal) {
    throw new Error('Web3Modal not initialized')
  }
  return web3modal
}
