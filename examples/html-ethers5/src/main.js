import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { mainnet, polygon, base } from '@reown/appkit/networks'
import { createAppKit } from '@reown/appkit'

// Get projectId
const projectId = import.meta.env.VITE_PROJECT_ID
if (!projectId) {
  throw new Error('VITE_PROJECT_ID is not set')
}

// Initialize Ethers adapter
const ethersAdapter = new EthersAdapter()

// Initialize AppKit
const modal = createAppKit({
  adapters: [ethersAdapter],
  networks: [mainnet, polygon, base],
  projectId,
  metadata: {
    name: 'AppKit HTML Ethers Example',
    description: 'AppKit HTML Ethers Example',
    url: 'https://reown.com/appkit',
    icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4']
  },
  themeMode: 'light'
})

// Theme state
let themeMode = 'light'

// Helper function to update element content
const updateElement = (id, content) => {
  const element = document.getElementById(id)
  if (element) {
    element.innerHTML = typeof content === 'string' ? content : JSON.stringify(content, null, 2)
  }
}

// Button event listeners
document.getElementById('open-connect-modal').addEventListener('click', () => modal.open())
document
  .getElementById('open-network-modal')
  .addEventListener('click', () => modal.open({ view: 'Networks' }))

document.getElementById('toggle-theme').addEventListener('click', () => {
  themeMode = themeMode === 'dark' ? 'light' : 'dark'
  document.body.className = themeMode
  modal.setThemeMode(themeMode)
  updateThemeState()
})

document.getElementById('switch-network').addEventListener('click', async () => {
  const currentChainId = modal.getChainId()
  const targetNetwork = currentChainId === polygon.id ? mainnet : polygon
  await modal.switchNetwork(targetNetwork)
})

// Update state displays
const updateThemeState = () => {
  updateElement('theme', {
    themeMode,
    themeVariables: {}
  })
}

// Set up subscriptions
modal.subscribeAccount(state => {
  updateElement('account', state)
})

modal.subscribeNetwork(state => {
  updateElement('network', state)
})

modal.subscribeState(state => {
  updateElement('modal-state', state)
})

modal.subscribeTheme(state => {
  updateElement('theme', state)
})

modal.subscribeEvents(state => {
  updateElement('events', state)
})

modal.subscribeWalletInfo(state => {
  updateElement('wallet-info', state)
})
