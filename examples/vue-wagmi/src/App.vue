<template>
  <div :class="themeMode">
    <h1>Hello Vue Wagmi</h1>
    <w3m-button />
    <w3m-network-button />

    <button @click="modal.open()">Open Connect Modal</button>
    <button @click="modal.open({ view: 'Networks' })">Open Network Modal</button>
    <button @click="setThemeMode(themeMode === 'dark' ? 'light' : 'dark')">
      Toggle Theme Mode
    </button>
    <pre>{{ JSON.stringify(state, null, 2) }}</pre>
    <pre>{{ JSON.stringify({ themeMode, themeVariables }, null, 2) }}</pre>
    <pre>{{ JSON.stringify(events, null, 2) }}</pre>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
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

const projectId = '3bdbc796b351092d40d5d08e987f4eca'

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
</script>

<style scoped>
.dark {
  background-color: #333;
  color: #fff;
}

.light {
  background-color: #fff;
  color: #000;
}
</style>
