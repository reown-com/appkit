import { onBeforeMount, ref } from 'vue'
import type { Web3ModalOptions } from '../src/client.js'
import { Web3Modal } from '../src/client.js'
import { VERSION } from '../src/utils/constants.js'
import type { ThemeMode, ThemeVariables } from '@web3modal/scaffold'

// -- Types -------------------------------------------------------------------
export type { Web3ModalOptions } from '../src/client.js'
type OpenOptions = Parameters<Web3Modal['open']>[0]

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

  function setThemeMode(themeMode: ThemeMode) {
    modal?.setThemeMode(themeMode)
  }

  function setThemeVariables(themeVariables: ThemeVariables) {
    modal?.setThemeVariables(themeVariables)
  }

  function getThemeMode() {
    return modal?.getThemeMode()
  }

  function getThemeVariables() {
    return modal?.getThemeVariables()
  }

  const themeMode = ref<ThemeMode | undefined>(modal.getThemeMode())
  const themeVariables = ref<ThemeVariables | undefined>(modal.getThemeVariables())

  const unsubscribe = modal?.subscribeTheme(
    mode => {
      themeMode.value = mode
    },
    mode => {
      themeVariables.value = mode
    }
  )

  onBeforeMount(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })

  return ref({
    themeMode,
    themeVariables,
    getThemeMode,
    getThemeVariables,
    setThemeMode,
    setThemeVariables
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
