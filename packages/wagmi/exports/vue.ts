import type {
  W3mAccountButton,
  W3mButton,
  W3mConnectButton,
  W3mNetworkButton
} from '@web3modal/scaffold'
import { onUnmounted, reactive, ref } from 'vue'
import type { Web3ModalOptions } from '../src/client.js'
import { Web3Modal } from '../src/client.js'
import { VERSION } from '../src/utils/constants.js'

// -- Types -------------------------------------------------------------------
export type { Web3ModalOptions } from '../src/client.js'

type OpenOptions = Parameters<Web3Modal['open']>[0]

type ThemeModeOptions = Parameters<Web3Modal['setThemeMode']>[0]

type ThemeVariablesOptions = Parameters<Web3Modal['setThemeVariables']>[0]

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    W3mConnectButton: Pick<W3mConnectButton, 'size' | 'label' | 'loadingLabel'>
    W3mAccountButton: Pick<W3mAccountButton, 'disabled' | 'balance'>
    W3mButton: Pick<W3mButton, 'size' | 'label' | 'loadingLabel' | 'disabled' | 'balance'>
    W3mNetworkButton: Pick<W3mNetworkButton, 'disabled'>
  }
}

// -- Setup -------------------------------------------------------------------
let modal: Web3Modal | undefined = undefined

export function createWeb3Modal(options: Web3ModalOptions) {
  if (!modal) {
    modal = new Web3Modal({ ...options, _sdkVersion: `vue-wagmi-${VERSION}` })
  }

  return modal
}

export { defaultWagmiConfig } from '../src/utils/defaultWagmiCoreConfig.js'

// -- Composites --------------------------------------------------------------
export function useWeb3ModalTheme() {
  if (!modal) {
    throw new Error('Please call "createWeb3Modal" before using "useWeb3ModalTheme" hook')
  }

  function setThemeMode(themeMode: ThemeModeOptions) {
    modal?.setThemeMode(themeMode)
  }

  function setThemeVariables(themeVariables: ThemeVariablesOptions) {
    modal?.setThemeVariables(themeVariables)
  }

  const themeMode = ref(modal.getThemeMode())
  const themeVariables = ref(modal.getThemeVariables())

  const unsubscribe = modal?.subscribeTheme(state => {
    themeMode.value = state.themeMode
    themeVariables.value = state.themeVariables
  })

  onUnmounted(() => {
    unsubscribe?.()
  })

  return ref({
    setThemeMode,
    setThemeVariables,
    themeMode,
    themeVariables
  })
}

export function useWeb3Modal() {
  if (!modal) {
    throw new Error('Please call "createWeb3Modal" before using "useWeb3Modal" composable')
  }

  async function open(options?: OpenOptions) {
    await modal?.open(options)
  }

  async function close() {
    await modal?.close()
  }

  return reactive({
    open,
    close
  })
}
