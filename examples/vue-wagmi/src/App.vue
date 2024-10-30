<template>
  <div class="container">
    <h1>Hello Vue Wagmi</h1>
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

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { arbitrum, mainnet } from '@reown/appkit/networks'
import { wagmiAdapter } from './config'
import {
  createAppKit,
  useAppKit,
  useAppKitEvents,
  useAppKitState,
  useAppKitTheme
} from '@reown/appkit/vue'

const error = ref('')

const projectId = import.meta.env.VITE_PROJECT_ID
if (!projectId) {
  throw new Error('VITE_PROJECT_ID is not set')
}

// 2. Create modal
createAppKit({
  adapters: [wagmiAdapter],
  networks: [mainnet, arbitrum],
  projectId,
  metadata: {
    name: 'AppKit Vue Example',
    description: 'AppKit Vue Example',
    url: '',
    icons: [],
    verifyUrl: ''
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
