import { EVMEthers5Client } from '@web3modal/adapter-ethers5'
import { mainnet, arbitrum } from '@web3modal/base/chains'
import { createWeb3Modal } from '@web3modal/base'

// @ts-expect-error 1. Get projectId
const projectId = import.meta.env.VITE_PROJECT_ID
if (!projectId) {
  throw new Error('VITE_PROJECT_ID is not set')
}

function getBlockchainApiRpcUrl(chainId) {
  return `https://rpc.walletconnect.org/v1/?chainId=eip155:${chainId}&projectId=${projectId}`
}

// 2. Create wagmiConfig
const ethers5Adapter = new EVMEthers5Client()

// 3. Create modal
const modal = createWeb3Modal({
  adapters: [ethers5Adapter],
  caipNetworks: [mainnet, arbitrum],
  metadata: {
    name: 'AppKit',
    description: 'AppKit Laboratory',
    url: 'https://example.com',
    icons: ['https://avatars.githubusercontent.com/u/37784886']
  },
  projectId,
  chains,
  themeMode: 'light'
})

// 4. Trigger modal programaticaly
const openConnectModalBtn = document.getElementById('open-connect-modal')
const openNetworkModalBtn = document.getElementById('open-network-modal')

openConnectModalBtn.addEventListener('click', () => modal.open())
openNetworkModalBtn.addEventListener('click', () => modal.open({ view: 'Networks' }))

// 5. Alternatively use w3m component buttons (see index.html)
