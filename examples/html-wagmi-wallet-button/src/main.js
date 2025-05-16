import { createAppKit } from '@reown/appkit'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { createAppKitWalletButton } from '@reown/appkit-wallet-button'
import { mainnet, polygon } from '@reown/appkit/networks'

// Get projectId
export const projectId = import.meta.env.VITE_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694' // this is a public projectId only to use on localhost

const networks = [mainnet, polygon]
const walletButtons = ['email', 'google', 'metamask', 'walletConnect']

// Create adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId
})

// Instantiate AppKit
const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  themeMode: 'light',

  metadata: {
    name: 'AppKit HTML Wallet Button Example',
    description: 'AppKit HTML Wallet Button Example',
    url: 'https://reown.com/appkit',
    icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4']
  }
})

// State objects
let themeState = { themeMode: 'light', themeVariables: {} }

// Helper functions
function disableAllWalletButtons() {
  walletButtons.forEach(wallet => {
    const connectButton = document.getElementById(`connect-${wallet}`)
    connectButton.setAttribute('disabled', 'true')
  })
}

function enableAllWalletButtons() {
  walletButtons.forEach(wallet => {
    const connectButton = document.getElementById(`connect-${wallet}`)
    connectButton.removeAttribute('disabled')
  })
}

const updateTheme = mode => {
  document.documentElement.setAttribute('data-theme', mode)
  document.body.className = mode

  // Update logo based on theme
  const reownLogo = document.getElementById('reown-logo')
  if (reownLogo) {
    reownLogo.src = mode === 'dark' ? '/reown-logo-white.png' : '/reown-logo.png'
  }
}

// Subscribe for account change event
modal.subscribeAccount(state => {
  if (state.isConnected) {
    const appKitButton = document.querySelector('appkit-button')
    appKitButton.classList.remove('disconnected')
    disableAllWalletButtons()
  } else {
    const appKitButton = document.querySelector('appkit-button')
    appKitButton.classList.add('disconnected')
    enableAllWalletButtons()
  }
})

// Create AppKit Wallet Button
const appKitWalletButton = createAppKitWalletButton()

if (!appKitWalletButton.isReady()) {
  disableAllWalletButtons()
}

// Subscribe to wallet button state changes
appKitWalletButton.subscribeIsReady(({ isReady }) => {
  if (isReady) {
    enableAllWalletButtons()
  }
})

// Wallet Button event listeners
walletButtons.forEach(wallet => {
  document.getElementById(`connect-${wallet}`)?.addEventListener('click', () => {
    appKitWalletButton
      .connect(wallet)
      .then(data => {
        console.log('connected', data)
      })
      .catch(err => {
        console.log('error connecting', err)
      })
  })
})

document.getElementById('update-email')?.addEventListener('click', () => {
  appKitWalletButton
    .updateEmail()
    .then(data => {
      console.log('updated email', data)
    })
    .catch(err => {
      console.log('error updating email', err)
    })
})
// Button event listeners
document.getElementById('toggle-theme')?.addEventListener('click', () => {
  const newTheme = themeState.themeMode === 'dark' ? 'light' : 'dark'
  modal.setThemeMode(newTheme)
  themeState = { ...themeState, themeMode: newTheme }
  updateTheme(newTheme)
})

document.getElementById('disconnect')?.addEventListener('click', () => {
  modal.disconnect()
})
