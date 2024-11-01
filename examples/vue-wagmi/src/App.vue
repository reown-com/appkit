<template>
  <div class="container">
    <h1>Hello Vue Wagmi</h1>

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
    </div>

    <!-- State Displays -->
    <div class="state-container">
      <section>
        <h2>Account</h2>
        <pre>{{ JSON.stringify(accountState, null, 2) }}</pre>
      </section>

      <section>
        <h2>Network</h2>
        <pre>{{ JSON.stringify(networkState, null, 2) }}</pre>
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

<script language="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { useAccount } from '@wagmi/vue'
import {
  createAppKit,
  useAppKit,
  useAppKitState,
  useAppKitTheme,
  useAppKitEvents
} from '@reown/appkit/vue'
import { wagmiAdapter } from './config'
import { mainnet, polygon, base } from '@reown/appkit/networks'

const projectId = import.meta.env.VITE_PROJECT_ID
if (!projectId) {
  throw new Error('VITE_PROJECT_ID is not set')
}

// Initialize AppKit
const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: [mainnet, polygon, base],
  projectId,
  metadata: {
    name: 'AppKit Vue Example',
    description: 'AppKit Vue Example',
    url: 'https://appkit.org',
    icons: ['https://avatars.githubusercontent.com/u/37784886']
  }
})

// State Management
const accountState = ref({})
const networkState = ref({})
const appState = useAppKitState()
const { themeMode, themeVariables, setThemeMode } = useAppKitTheme()
const events = useAppKitEvents()
const walletInfo = ref({})
const themeState = ref({ themeMode: 'light', themeVariables: {} })

// Setup hooks
const wagmiAccount = useAccount()

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
  modal.subscribeAccount(state => {
    accountState.value = state
  })

  modal.subscribeNetwork(state => {
    networkState.value = state
  })

  modal.subscribeTheme(state => {
    themeState.value = state
    document.body.className = state.themeMode
  })

  modal.subscribeWalletInfo(state => {
    walletInfo.value = state
  })
})
</script>

<style>
body {
  margin: 0;
  min-height: 100vh;
  transition:
    background-color 0.3s,
    color 0.3s;
}

body.dark {
  background-color: #333;
  color: #fff;
}

body.light {
  background-color: #fff;
  color: #000;
}

.container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

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

h2 {
  margin: 0 0 10px 0;
}

pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
