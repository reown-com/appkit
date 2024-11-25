'use client'

import { useEffect, useState } from 'react'
import {
  createAppKit,
  useAppKitAccount,
  useAppKitNetwork,
  useAppKitState,
  useAppKitTheme,
  useAppKitEvents
} from '@reown/appkit/react'
import { wagmiAdapter } from '../config'
import { mainnet, polygon, base } from '@reown/appkit/networks'
import styles from '../styles/Connect.module.css'

// Initialize AppKit
const projectId = process.env['NEXT_PUBLIC_PROJECT_ID']
if (!projectId) {
  throw new Error('NEXT_PUBLIC_PROJECT_ID is not set')
}

const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: [mainnet, polygon, base],
  projectId,
  metadata: {
    name: 'AppKit Next.js Example',
    description: 'AppKit Next.js Example',
    url: 'https://reown.com/appkit',
    icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4']
  }
})

export default function Connect() {
  // State Management using AppKit hooks
  const { address, caipAddress, status, isConnected } = useAppKitAccount()
  const network = useAppKitNetwork()
  const appState = useAppKitState()
  const { setThemeMode } = useAppKitTheme()
  const events = useAppKitEvents()
  const [walletInfo, setWalletInfo] = useState<Record<string, unknown>>({})
  const [themeState, setThemeState] = useState({ themeMode: 'light', themeVariables: {} })

  console.log('>>> status', status, address)
  const isPending = status === undefined || status === 'connecting' || status === 'reconnecting'

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

    // Setup subscriptions
    const unsubTheme = modal.subscribeTheme(state => {
      setThemeState(state)
      document.body.className = state.themeMode
    })

    const unsubWalletInfo = modal.subscribeWalletInfo(state => {
      setWalletInfo(state)
    })

    // Cleanup subscriptions
    return () => {
      unsubTheme()
      unsubWalletInfo()
    }
  }, [])

  return (
    <div className={styles.container}>
      <h1>Next.js Wagmi Example</h1>

      {isPending ? (
        <div>Loading...</div>
      ) : (
        <div className={styles.buttonGroup}>
          <w3m-button />
          <w3m-network-button />
        </div>
      )}

      {/* AppKit UI Components */}

      {/* Modal Controls */}
      <div className={styles.buttonGroup}>
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
      {/* <div className={styles.stateContainer}>
        <section>
          <h2>Account</h2>
          <pre>{JSON.stringify({ address, caipAddress, status, isConnected }, null, 2)}</pre>
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
          <h2>Events</h2>
          <pre>{JSON.stringify(events, null, 2)}</pre>
        </section>

        <section>
          <h2>Wallet Info</h2>
          <pre>{JSON.stringify(walletInfo, null, 2)}</pre>
        </section>
      </div> */}
    </div>
  )
}
