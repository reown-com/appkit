import { arbitrum, mainnet, optimism, polygon, zkSync, sepolia } from '@reown/appkit/networks'
import { createAppKit } from '@reown/appkit'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'

// @ts-expect-error 1. Get projectId
const projectId = import.meta.env.VITE_PROJECT_ID
if (!projectId) {
  throw new Error('VITE_PROJECT_ID is not set')
}

// Create adapter
const ethersAdapter = new EthersAdapter()

// Instantiate AppKit
const modal = createAppKit({
  adapters: [ethersAdapter],
  networks: [arbitrum, mainnet, optimism, polygon, zkSync, sepolia],
  projectId
})

// Trigger modal programaticaly
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
