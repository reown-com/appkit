import {
  createAppKit,
  WagmiAdapter,
  networks
} from 'https://cdn.jsdelivr.net/npm/@reown/appkit-cdn@1.3.0/dist/appkit.js'
import { reconnect } from 'https://esm.sh/@wagmi/core@2.x'

if (!createAppKit || !WagmiAdapter) {
  throw new Error('AppKit or createAppKit not found on window object')
} else {
  const projectId = import.meta.env.VITE_PROJECT_ID
  const networkList = [networks.mainnet, networks.polygon, networks.base]

  try {
    const wagmiAdapter = new WagmiAdapter({
      projectId,
      networks: networkList
    })

    // State tracking
    let appState = {}
    let themeState = { themeMode: 'light', themeVariables: {} }
    let events = []
    let walletInfo = {}
    let accountState = {}
    let networkState = {}

    // Create modal
    const modal = createAppKit({
      adapters: [wagmiAdapter],
      networks: networkList,
      projectId,
      metadata: {
        name: 'Html CDN Example',
        description: 'Html CDN Example using local server',
        url: 'https://reown.com/appkit',
        icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4']
      }
    })

    reconnect(wagmiAdapter.wagmiConfig)

    modal.subscribeAccount(state => {
      accountState = state
      updateDisplays()
    })

    modal.subscribeNetwork(state => {
      networkState = state
      updateDisplays()
    })

    modal.subscribeTheme(state => {
      themeState = state
      updateDisplays()
    })

    modal.subscribeState(state => {
      appState = state
      updateDisplays()
    })

    modal.subscribeWalletInfo(state => {
      walletInfo = state
      updateDisplays()
    })

    modal.subscribeEvents(state => {
      events = state
      updateDisplays()
    })

    function setThemeMode(mode) {
      themeState.themeMode = mode
      document.body.className = mode
      modal.setThemeMode(mode)
      updateDisplays()
    }

    // Update display elements
    function updateDisplays() {
      document.getElementById('account-display').textContent = JSON.stringify(accountState, null, 2)
      document.getElementById('network-display').textContent = JSON.stringify(networkState, null, 2)
      document.getElementById('state-display').textContent = JSON.stringify(appState, null, 2)
      document.getElementById('theme-display').textContent = JSON.stringify(themeState, null, 2)
      document.getElementById('events-display').textContent = JSON.stringify(events, null, 2)
      document.getElementById('wallet-info').textContent = JSON.stringify(walletInfo, null, 2)
    }

    // DOM event listeners
    document.addEventListener('DOMContentLoaded', () => {
      const openConnectModalBtn = document.getElementById('open-appkit')
      const openNetworkModalBtn = document.getElementById('open-appkit-networks')
      const toggleThemeBtn = document.getElementById('toggle-theme')

      openConnectModalBtn?.addEventListener('click', () => {
        modal.open()
      })

      openNetworkModalBtn?.addEventListener('click', () => {
        modal.open({ view: 'Networks' })
      })

      toggleThemeBtn?.addEventListener('click', () => {
        const newTheme = themeState.themeMode === 'dark' ? 'light' : 'dark'
        setThemeMode(newTheme)
      })

      // Initial display update
      updateDisplays()
    })
  } catch (error) {
    console.error('Error creating or using modal:', error)
  }
}
