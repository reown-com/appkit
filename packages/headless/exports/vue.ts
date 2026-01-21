import { type Ref, onUnmounted, ref } from 'vue'

import type { ChainNamespace, AppKitNetwork, CaipNetwork } from '@reown/appkit-common'
import {
  ChainController
} from '@reown/appkit-controllers'
import type {
  UseAppKitNetworkReturn,
  PublicStateControllerState,
  EventsControllerState
} from '@reown/appkit-controllers'

import {
  HeadlessClient,
  createAppKitHeadless,
  getHeadlessClient,
  type CreateAppKitHeadlessOptions
} from '../src/client/headless-client.js'

// -- Re-export core hooks from controllers ------------------------------------
export {
  useAppKitAccount,
  useDisconnect,
  useAppKitConnections,
  useAppKitConnection
} from '@reown/appkit-controllers/vue'

// -- Re-export from index -----------------------------------------------------
export {
  HeadlessClient,
  createAppKitHeadless,
  getHeadlessClient
} from '../src/client/headless-client.js'

export type {
  HeadlessOptions,
  CreateAppKitHeadlessOptions,
  Views,
  OpenOptions
} from '../src/client/headless-client.js'

// -- Re-export types ----------------------------------------------------------
export type {
  CaipNetwork,
  CaipAddress,
  CaipNetworkId,
  AppKitNetwork,
  ChainNamespace
} from '@reown/appkit-common'

export type {
  UseAppKitAccountReturn,
  UseAppKitNetworkReturn,
  ConnectedWalletInfo,
  ThemeControllerState,
  PublicStateControllerState,
  Features,
  RemoteFeatures
} from '@reown/appkit-controllers'

// -- Headless client singleton ------------------------------------------------
let modal: HeadlessClient | undefined = undefined

export function createAppKit(options: CreateAppKitHeadlessOptions): HeadlessClient {
  if (!modal) {
    modal = createAppKitHeadless(options)
    getHeadlessClient(modal)
  }

  return modal
}

// Alias for createAppKitHeadless for easier migration
export { createAppKit as createAppKitHeadlessVue }

// -- Vue-specific composables -------------------------------------------------
export function useAppKitNetwork(): Ref<UseAppKitNetworkReturn> {
  const state = ref({
    caipNetwork: ChainController.state.activeCaipNetwork,
    chainId: ChainController.state.activeCaipNetwork?.id,
    caipNetworkId: ChainController.state.activeCaipNetwork?.caipNetworkId,
    switchNetwork: async (network: AppKitNetwork) => {
      await modal?.switchNetwork(network)
    }
  })

  const unsubscribe = ChainController.subscribeKey('activeCaipNetwork', (val: CaipNetwork | undefined) => {
    state.value.caipNetwork = val
    state.value.chainId = val?.id
    state.value.caipNetworkId = val?.caipNetworkId
  })

  onUnmounted(() => {
    unsubscribe()
  })

  return state as Ref<UseAppKitNetworkReturn>
}

export function useAppKitTheme() {
  if (!modal) {
    throw new Error('Please call "createAppKit" before using "useAppKitTheme" composable')
  }

  const themeMode = ref(modal.getThemeMode())
  const themeVariables = ref(modal.getThemeVariables())

  function setThemeMode(mode: 'dark' | 'light') {
    if (mode) {
      modal?.setThemeMode(mode)
    }
  }

  function setThemeVariables(variables: Record<string, string>) {
    if (variables) {
      modal?.setThemeVariables(variables)
    }
  }

  const unsubscribe = modal.subscribeTheme(state => {
    themeMode.value = state.themeMode
    themeVariables.value = state.themeVariables
  })

  onUnmounted(() => {
    unsubscribe()
  })

  return {
    themeMode,
    themeVariables,
    setThemeMode,
    setThemeVariables
  }
}

export function useAppKit() {
  if (!modal) {
    throw new Error('Please call "createAppKit" before using "useAppKit" composable')
  }

  // Note: open() and close() are no-ops in headless mode
  async function open() {
    console.warn('useAppKit: open() is a no-op in headless mode')
  }

  async function close() {
    await modal?.close()
  }

  return { open, close }
}

export function useWalletInfo(namespace?: ChainNamespace) {
  if (!modal) {
    throw new Error('Please call "createAppKit" before using "useWalletInfo" composable')
  }

  const walletInfo = ref(modal.getWalletInfo(namespace))

  const unsubscribe = modal.subscribeWalletInfo(newWalletInfo => {
    walletInfo.value = newWalletInfo
  }, namespace)

  onUnmounted(() => {
    unsubscribe()
  })

  return { walletInfo }
}

export function useAppKitState() {
  if (!modal) {
    throw new Error('Please call "createAppKit" before using "useAppKitState" composable')
  }

  const state = ref<PublicStateControllerState>({ ...modal.getState(), initialized: false })
  const remoteFeatures = ref(modal.getRemoteFeatures())

  const unsubscribeState = modal.subscribeState((newState: PublicStateControllerState) => {
    state.value = { ...newState }
  })

  const unsubscribeRemoteFeatures = modal.subscribeRemoteFeatures(newState => {
    remoteFeatures.value = newState
  })

  onUnmounted(() => {
    unsubscribeState()
    unsubscribeRemoteFeatures()
  })

  return { ...state.value, ...(remoteFeatures.value ?? {}) }
}

export function useAppKitEvents() {
  if (!modal) {
    throw new Error('Please call "createAppKit" before using "useAppKitEvents" composable')
  }

  const event = ref<EventsControllerState>(modal.getEvent())

  const unsubscribe = modal.subscribeEvents((newEvent: EventsControllerState) => {
    event.value = { ...newEvent }
  })

  onUnmounted(() => {
    unsubscribe()
  })

  return event
}
