<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import {
  createAppKit,
  useAppKitAccount,
  useAppKitNetwork,
  useAppKitState,
  useAppKitTheme,
  useAppKitEvents
} from '@reown/appkit/vue'
import { wagmiAdapter } from './config'
import { mainnet, polygon, base, solana, solanaTestnet } from '@reown/appkit/networks'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'

const projectId = import.meta.env.VITE_PROJECT_ID
if (!projectId) {
  throw new Error('VITE_PROJECT_ID is not set')
}

// Initialize Solana adapter
const solanaAdapter = new SolanaAdapter({})

// Initialize AppKit
const modal = createAppKit({
  adapters: [wagmiAdapter, solanaAdapter],
  networks: [mainnet, polygon, base, solana, solanaTestnet],
  projectId,
  metadata: {
    name: 'AppKit Vue Example',
    description: 'AppKit Vue Example',
    url: 'https://reown.com/appkit',
    icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4']
  }
})

// State Management
const useAccount = useAppKitAccount()
const useNetwork = useAppKitNetwork()
const appState = useAppKitState()
const { setThemeMode } = useAppKitTheme()
const events = useAppKitEvents()
const walletInfo = ref({})
const themeState = ref({ themeMode: 'light', themeVariables: {} })

// Theme toggle function
const toggleTheme = () => {
  const newTheme = themeState.value.themeMode === 'dark' ? 'light' : 'dark'
  setThemeMode(newTheme)
  themeState.value.themeMode = newTheme
  document.body.className = newTheme
}

// Subscriptions
onMounted(() => {
  // Set initial theme
  document.body.className = themeState.value.themeMode

  // Setup subscriptions
  // You can subscribe to the account state like this instead of using the useAppKitAccount hook
  // modal.subscribeAccount(state => {
  //   accountState.value = state
  // })

  // You can subscribe to the network state like this instead of using the useAppKitNetwork hook
  // modal.subscribeNetwork(state => {
  //   networkState.value = state
  // })

  modal.subscribeTheme(state => {
    themeState.value = state
    document.body.className = state.themeMode
  })

  modal.subscribeWalletInfo(state => {
    // @ts-ignore
    walletInfo.value = state
  })
})
</script>

<template>
  <div class="container">
    <h1>Vue Wagmi Example</h1>

    <!-- AppKit UI Components -->
    <div class="button-group">
      <w3m-button />
      <w3m-network-button />
    </div>

    <!-- Modal Controls -->
    <div class="button-group">
      <button @click="modal.open()">Open Connect Modal</button>
      <button @click="modal.open({ view: 'Networks' })">Open Network Modal</button>
      <button @click="toggleTheme">Toggle Theme Mode</button>
      <button
        @click="useNetwork.switchNetwork(useNetwork.chainId === polygon.id ? mainnet : polygon)"
      >
        Switch to
        {{ useNetwork.chainId === polygon.id ? 'Mainnet' : 'Polygon' }}
      </button>
    </div>

    <!-- State Displays -->
    <div class="state-container">
      <section>
        <h2>Account</h2>
        <pre>{{ JSON.stringify(useAccount, null, 2) }}</pre>
      </section>

      <section>
        <h2>Network</h2>
        <pre>{{ JSON.stringify(useNetwork, null, 2) }}</pre>
      </section>

      <section>
        <h2>State</h2>
        <pre>{{ JSON.stringify(appState, null, 2) }}</pre>
      </section>

      <section>
        <h2>Theme</h2>
        <pre>{{ JSON.stringify(themeState, null, 2) }}</pre>
      </section>

      <section>
        <h2>Events</h2>
        <pre>{{ JSON.stringify(events, null, 2) }}</pre>
      </section>

      <section>
        <h2>Wallet Info</h2>
        <pre>{{ JSON.stringify(walletInfo, null, 2) }}</pre>
      </section>
    </div>
  </div>
</template>

<style>
/* Base styles */
body {
  margin: 0;
  min-height: 100vh;
  transition:
    background-color 0.3s,
    color 0.3s;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Theme styles */
body.dark {
  background-color: #333;
  color: #fff;
}

body.light {
  background-color: #fff;
  color: #000;
}

/* Layout */
.container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Typography */
h1 {
  font-weight: 700;
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  letter-spacing: -0.02em;
}

h2 {
  font-weight: 600;
  font-size: 1.125rem;
  margin: 0 0 10px 0;
  letter-spacing: -0.01em;
}

/* Buttons */
.button-group {
  display: flex;
  gap: 16px;
  margin: 20px 0;
}

button {
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid #ddd;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
  font-size: 0.875rem;
}

/* Light theme button styles */
body.light button {
  background: white;
  color: black;
  border-color: #ddd;
}

body.light button:hover {
  background: #f5f5f5;
}

/* Dark theme button styles */
body.dark button {
  background: #444;
  color: white;
  border-color: #666;
}

body.dark button:hover {
  background: #555;
}

/* State container */
.state-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

section {
  background: rgba(0, 0, 0, 0.1);
  padding: 16px;
  border-radius: 8px;
  max-height: 300px;
  overflow-y: auto;
}

pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', 'Droid Sans Mono', 'Source Code Pro',
    monospace;
  font-size: 0.875rem;
  line-height: 1.5;
}
</style>
