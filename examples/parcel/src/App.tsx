import { useState, useEffect } from 'react'
import {
  createAppKit,
  useAppKitAccount,
  useAppKitNetwork,
  useAppKitState,
  useAppKitTheme
} from '@reown/appkit/react'
import { mainnet, polygon, bsc } from '@reown/appkit/networks'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

// Initialize WagmiAdapter
const wagmiAdapter = new WagmiAdapter({
  projectId: '3bdbc796b351092d40d5d08e987f4eca',
  networks: [mainnet, polygon, bsc]
})

// Initialize AppKit
const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: [mainnet, polygon],
  metadata: {
    name: 'AppKit React with Parcel',
    description: 'AppKit implementation with Wagmi adapter on Parcel bundler',
    url: 'https://reown.com/appkit',
    icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4']
  },
  projectId: '3bdbc796b351092d40d5d08e987f4eca'
})

export function App() {
  // Hooks for state management
  const account = useAppKitAccount()
  const network = useAppKitNetwork()
  const appState = useAppKitState()
  const { setThemeMode } = useAppKitTheme()
  const [themeState, setThemeState] = useState({ themeMode: 'light', themeVariables: {} })
  const [walletInfo, setWalletInfo] = useState({})

  // Theme toggle function
  const toggleTheme = () => {
    const newTheme = themeState.themeMode === 'dark' ? 'light' : 'dark'
    setThemeMode(newTheme)
    setThemeState(prev => ({ ...prev, themeMode: newTheme }))
    document.body.className = newTheme
  }

  useEffect(() => {
    // Set initial theme
    document.body.className = themeState.themeMode

    // Subscribe to theme changes
    modal.subscribeTheme(state => {
      setThemeState(state)
      document.body.className = state.themeMode
    })

    // Subscribe to wallet info
    modal.subscribeWalletInfo(state => {
      setWalletInfo(state)
    })
  }, [])

  return (
    <div className="container">
      <h1>React Wagmi Example</h1>

      {/* AppKit UI Components */}
      <div className="button-group">
        <w3m-button></w3m-button>
        <w3m-network-button></w3m-network-button>
      </div>

      {/* Modal Controls */}
      <div className="button-group">
        <button onClick={() => modal.open()}>Open Connect Modal</button>
        <button onClick={() => modal.open({ view: 'Networks' })}>Open Network Modal</button>
        <button onClick={toggleTheme}>Toggle Theme Mode</button>
        <button
          onClick={() => network.switchNetwork(network.chainId === polygon.id ? mainnet : polygon)}
        >
          Switch to {network.chainId === polygon.id ? 'Mainnet' : 'Polygon'}
        </button>
      </div>

      {/* State Displays */}
      <div className="state-container">
        <section>
          <h2>Account</h2>
          <pre>{JSON.stringify(account, null, 2)}</pre>
        </section>

        <section>
          <h2>Network</h2>
          <pre>{JSON.stringify(network, null, 2)}</pre>
        </section>

        <section>
          <h2>State</h2>
          <pre>{JSON.stringify(appState, null, 2)}</pre>
        </section>

        <section>
          <h2>Theme</h2>
          <pre>{JSON.stringify(themeState, null, 2)}</pre>
        </section>

        <section>
          <h2>Wallet Info</h2>
          <pre>{JSON.stringify(walletInfo, null, 2)}</pre>
        </section>
      </div>
    </div>
  )
}
