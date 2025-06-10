import { createAppKit } from '@reown/appkit'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { solana, solanaDevnet, solanaTestnet } from '@reown/appkit/networks'

// Get projectId
export const projectId = import.meta.env.VITE_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694' // this is a public projectId only to use on localhost

// Create adapter
const solanaAdapter = new SolanaAdapter({})

// Instantiate AppKit
const modal = createAppKit({
  adapters: [solanaAdapter],
  networks: [solana, solanaTestnet, solanaDevnet],
  projectId,
  themeMode: 'light',

  metadata: {
    name: 'AppKit HTML Example',
    description: 'AppKit HTML Example',
    url: 'https://reown.com/appkit',
    icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4']
  }
})

// State objects
let accountState = {}
let networkState = {}
let appKitState = {}
let themeState = { themeMode: 'light', themeVariables: {} }
let events = []
let walletInfo = {}
let solanaProvider = null

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
  solanaProvider = state['solana']
})

// Button event listeners
document.getElementById('toggle-theme')?.addEventListener('click', () => {
  const newTheme = themeState.themeMode === 'dark' ? 'light' : 'dark'
  modal.setThemeMode(newTheme)
  themeState = { ...themeState, themeMode: newTheme }
  updateTheme(newTheme)
})

document.getElementById('switch-network')?.addEventListener('click', () => {
  modal.switchNetwork(solana)
})

document.getElementById('open-modal')?.addEventListener('click', () => {
  modal.open()
})

document.getElementById('disconnect')?.addEventListener('click', () => {
  modal.disconnect()
})

document.getElementById('sign-message')?.addEventListener('click', async () => {
  if (!accountState.address) {
    await modal.open()
    return
  }
  signMessage()
})

async function signMessage() {
  if (solanaProvider && accountState.address) {
    try {
      const encodedMessage = new TextEncoder().encode('Hello from AppKit')
      await solanaProvider.signMessage(encodedMessage)
    } catch (error) {
      console.error('Error signing message:', error)
    }
  }
}

// Set initial theme and UI state
updateTheme(themeState.themeMode)
