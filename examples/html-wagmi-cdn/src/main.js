import {
  WagmiAdapter,
  createAppKit,
  networks
} from 'https://cdn.jsdelivr.net/npm/@reown/appkit-cdn@1.7.3/dist/appkit.js'
import { reconnect, watchConnectors } from 'https://esm.sh/@wagmi/core@2.x'

// Get projectId
export const projectId = import.meta.env.VITE_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694' // this is a public projectId only to use on localhost

const appKitNetworks = [networks.mainnet, networks.polygon]

// Create adapter
const wagmiAdapter = new WagmiAdapter({
  networks: appKitNetworks,
  projectId
})

// Instantiate AppKit
const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: appKitNetworks,
  projectId,
  themeMode: 'light',
  features: {
    analytics: true
  },
  metadata: {
    name: 'AppKit HTML Example',
    description: 'AppKit HTML Example',
    url: 'https://reown.com/appkit',
    icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4']
  }
})

watchConnectors(wagmiAdapter.wagmiConfig, {
  onChange(connectors) {
    if (connectors.length > 4) {
      reconnect(wagmiAdapter.wagmiConfig)
    }
  }
})

// State objects
let accountState = {}
let networkState = {}
let appKitState = {}
let themeState = { themeMode: 'light', themeVariables: {} }
let events = []
let walletInfo = {}
let eip155Provider = null

// Helper function to update theme
const updateTheme = mode => {
  document.documentElement.setAttribute('data-theme', mode)
  document.body.className = mode

  // Update logo based on theme
  const reownLogo = document.getElementById('reown-logo')
  if (reownLogo) {
    reownLogo.src = mode === 'dark' ? '/reown-logo-white.png' : '/reown-logo.png'
  }
}

// Subscribe to state changes
modal.subscribeAccount(state => {
  accountState = state
  document.getElementById('accountState').textContent = JSON.stringify(state, null, 2)
})

modal.subscribeNetwork(state => {
  networkState = state
  document.getElementById('networkState').textContent = JSON.stringify(state, null, 2)
})

modal.subscribeState(state => {
  appKitState = state
  document.getElementById('appKitState').textContent = JSON.stringify(state, null, 2)
})

modal.subscribeTheme(state => {
  themeState = state
  document.getElementById('themeState').textContent = JSON.stringify(state, null, 2)
  updateTheme(state.themeMode)
})

modal.subscribeEvents(state => {
  events = state
  document.getElementById('events').textContent = JSON.stringify(state, null, 2)
})

modal.subscribeWalletInfo(state => {
  walletInfo = state
  document.getElementById('walletInfo').textContent = JSON.stringify(state, null, 2)
})

modal.subscribeProviders(state => {
  eip155Provider = state['eip155']
})

// Button event listeners
document.getElementById('toggle-theme')?.addEventListener('click', () => {
  const newTheme = themeState.themeMode === 'dark' ? 'light' : 'dark'
  modal.setThemeMode(newTheme)
  themeState = { ...themeState, themeMode: newTheme }
  updateTheme(newTheme)
})

document.getElementById('switch-network')?.addEventListener('click', () => {
  const currentChainId = networkState?.chainId
  modal.switchNetwork(currentChainId === polygon.id ? mainnet : polygon)
})

document.getElementById('sign-message')?.addEventListener('click', async () => {
  if (!accountState.address) {
    await modal.open()
    return
  }
  signMessage()
})

// Action Buttons
document.getElementById('open-modal')?.addEventListener('click', () => {
  modal.open()
})

document.getElementById('disconnect')?.addEventListener('click', () => {
  modal.disconnect()
})

document.getElementById('switch-to-ethereum')?.addEventListener('click', () => {
  modal.switchNetwork(networks.mainnet)
})

async function signMessage() {
  if (eip155Provider && accountState.address) {
    try {
      await eip155Provider.request({
        method: 'personal_sign',
        params: ['Hello from AppKit!', accountState.address]
      })
    } catch (error) {
      console.error('Error signing message:', error)
    }
  }
}

// Set initial theme and UI state
updateTheme(themeState.themeMode)
