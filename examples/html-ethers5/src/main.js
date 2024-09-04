import { EVMEthers5Client } from '@rerock/adapter-ethers5'
import { mainnet, arbitrum } from '@rerock/base/chains'
import { createWeb3Modal } from '@rerock/base'

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
  metadata,
  chains,
  themeMode: 'light'
})

// 4. Trigger modal programaticaly
const openConnectModalBtn = document.getElementById('open-connect-modal')
const openNetworkModalBtn = document.getElementById('open-network-modal')

openConnectModalBtn.addEventListener('click', () => modal.open())
openNetworkModalBtn.addEventListener('click', () => modal.open({ view: 'Networks' }))

const updateElement = (id, content) => {
  const element = document.getElementById(id)
  if (element) {
    element.innerHTML = content
  }
}

const intervalId = setInterval(() => {
  updateElement('getError', JSON.stringify(modal.getError(), null, 2))
  updateElement('getChainId', JSON.stringify(modal.getChainId(), null, 2))
  updateElement('getAddress', JSON.stringify(modal.getAddress(), null, 2))
  updateElement('switchNetwork', JSON.stringify(modal.switchNetwork(), null, 2))
  updateElement('getIsConnected', JSON.stringify(modal.getIsConnected(), null, 2))
  updateElement('getWalletProvider', JSON.stringify(modal.getWalletProvider(), null, 2))
  updateElement('getWalletProviderType', JSON.stringify(modal.getWalletProviderType(), null, 2))
}, 2000)

window.addEventListener('beforeunload', () => {
  clearInterval(intervalId)
})

modal.subscribeProvider(state => {
  updateElement('subscribeProvider', JSON.stringify(state, null, 2))
})
