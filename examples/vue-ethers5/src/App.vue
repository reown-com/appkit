<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { arbitrum, mainnet } from '@reown/appkit/networks'
import { Ethers5Adapter } from '@reown/appkit-adapter-ethers5'
import {
  createAppKit,
  useAppKit,
  useAppKitEvents,
  useAppKitState,
  useAppKitTheme
} from '@reown/appkit/vue'

const error = ref('')

// 1. Get projectId
const projectId = import.meta.env.VITE_PROJECT_ID
if (!projectId) {
  throw new Error('VITE_PROJECT_ID is not set')
}

// 2. Create ethers adapter
const ethersAdapter = new Ethers5Adapter()

// 3. Create modal
createAppKit({
  adapters: [ethersAdapter],
  networks: [mainnet, arbitrum],
  projectId,
  metadata: {
    name: 'AppKit Vue Ethers Example',
    description: 'AppKit Vue Ethers Example',
    url: '',
    icons: []
  }
})

const modal = useAppKit()
const state = useAppKitState()
const { setThemeMode, themeMode, themeVariables } = useAppKitTheme()
const events = useAppKitEvents()

const toggleTheme = () => {
  const newTheme = themeMode.value === 'dark' ? 'light' : 'dark'
  setThemeMode(newTheme)
}

// Watch for theme changes and update body class
watch(themeMode, newTheme => {
  document.body.className = newTheme
})

// Set initial theme class on mount
onMounted(() => {
  document.body.className = themeMode.value
})
</script>

<template>
  <div class="container">
    <h1>Hello Vue Ethers5</h1>
    <w3m-button />
    <w3m-network-button />

    <button @click="modal.open()">Open Connect Modal</button>
    <button @click="modal.open({ view: 'Networks' })">Open Network Modal</button>
    <button @click="toggleTheme">Toggle Theme Mode</button>
    <pre>{{ JSON.stringify(state, null, 2) }}</pre>
    <pre>{{ JSON.stringify({ themeMode, themeVariables }, null, 2) }}</pre>
    <pre>{{ JSON.stringify(events, null, 2) }}</pre>
  </div>
</template>

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
}
</style>
