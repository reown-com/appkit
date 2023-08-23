import { onUnmounted, ref } from 'vue'
import type { Web3ModalOptions } from '../src/client.js'
import { Web3Modal } from '../src/client.js'
import { VERSION } from '../src/utils/constants.js'
import type { ThemeMode, ThemeVariables } from '@web3modal/scaffold'

// -- Types -------------------------------------------------------------------
export type { Web3ModalOptions } from '../src/client.js'
type OpenOptions = Parameters<Web3Modal['open']>[0]
type ThemeModeOptions = Parameters<Web3Modal['setThemeMode']>[0]
type ThemeVariablesOptions = Parameters<Web3Modal['setThemeVariables']>[0]

// -- Setup -------------------------------------------------------------------
let modal: Web3Modal | undefined = undefined

// -- Lib ---------------------------------------------------------------------
export function createWeb3Modal(options: Omit<Web3ModalOptions, '_sdkVersion'>) {
  if (!modal) {
    modal = new Web3Modal({ ...options, _sdkVersion: `vue-wagmi-${VERSION}` })
  }

  return modal
}

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

  const themeMode = ref<ThemeMode | undefined>(modal.getThemeMode())
  const themeVariables = ref<ThemeVariables | undefined>(modal.getThemeVariables())

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

  return ref({
    open,
    close
  })
}

export { defaultWagmiConfig } from '../src/utils/defaultWagmiCoreConfig.js'
