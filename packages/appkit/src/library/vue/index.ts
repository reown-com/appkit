import { onUnmounted, reactive, ref } from 'vue'

import type { ChainNamespace } from '@reown/appkit-common'
import { type ConnectorType, type Event } from '@reown/appkit-controllers'
import type {
  AppKitAccountButton,
  AppKitButton,
  AppKitConnectButton,
  AppKitNetworkButton,
  W3mAccountButton,
  W3mButton,
  W3mConnectButton,
  W3mNetworkButton
} from '@reown/appkit-scaffold-ui'
import { ProviderUtil } from '@reown/appkit-utils'

import type {
  AppKitBaseClient as AppKit,
  OpenOptions,
  Views
} from '../../client/appkit-base-client.js'
import type { AppKitOptions } from '../../utils/TypesUtil.js'

export interface AppKitEvent {
  timestamp: number
  data: Event
}

type ThemeModeOptions = AppKitOptions['themeMode']

type ThemeVariablesOptions = AppKitOptions['themeVariables']

type UseAppKitReturnType<T> = {
  walletProvider: T | undefined
  walletProviderType: ConnectorType | undefined
}

declare module 'vue' {
  export interface ComponentCustomProperties {
    AppKitButton: Pick<
      AppKitButton,
      'size' | 'label' | 'loadingLabel' | 'disabled' | 'balance' | 'namespace'
    >
    AppKitConnectButton: Pick<AppKitConnectButton, 'size' | 'label' | 'loadingLabel'>
    AppKitAccountButton: Pick<AppKitAccountButton, 'disabled' | 'balance'>
    AppKitNetworkButton: Pick<AppKitNetworkButton, 'disabled'>
    W3mConnectButton: Pick<W3mConnectButton, 'size' | 'label' | 'loadingLabel'>
    W3mAccountButton: Pick<W3mAccountButton, 'disabled' | 'balance'>
    W3mButton: Pick<W3mButton, 'size' | 'label' | 'loadingLabel' | 'disabled' | 'balance'>
    W3mNetworkButton: Pick<W3mNetworkButton, 'disabled'>
  }
}

let modal: AppKit | undefined = undefined

export function getAppKit(appKit: AppKit) {
  if (appKit) {
    modal = appKit
  }
}

// -- Core Hooks ---------------------------------------------------------------
export * from '@reown/appkit-controllers/vue'

export function useAppKitProvider<T>(chainNamespace: ChainNamespace): UseAppKitReturnType<T> {
  const walletProvider = ref(ProviderUtil.state.providers[chainNamespace] as T | undefined)
  const walletProviderType = ref(ProviderUtil.state.providerIds[chainNamespace])

  const unsubscribe = ProviderUtil.subscribe(newState => {
    walletProvider.value = newState.providers[chainNamespace]
    walletProviderType.value = newState.providerIds[chainNamespace]
  })

  onUnmounted(() => {
    unsubscribe?.()
  })

  return reactive({
    walletProvider,
    walletProviderType
  }) as UseAppKitReturnType<T>
}

export function useAppKitTheme() {
  if (!modal) {
    throw new Error('Please call "createAppKit" before using "useAppKitTheme" hook')
  }

  function setThemeMode(themeMode: ThemeModeOptions) {
    if (themeMode) {
      modal?.setThemeMode(themeMode)
    }
  }

  function setThemeVariables(themeVariables: ThemeVariablesOptions) {
    if (themeVariables) {
      modal?.setThemeVariables(themeVariables)
    }
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

  return reactive({
    setThemeMode,
    setThemeVariables,
    themeMode,
    themeVariables
  })
}

export function useAppKit() {
  if (!modal) {
    throw new Error('Please call "createAppKit" before using "useAppKit" composable')
  }

  async function open<View extends Views>(options?: OpenOptions<View>) {
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

export function useWalletInfo() {
  if (!modal) {
    throw new Error('Please call "createAppKit" before using "useAppKit" composable')
  }

  const walletInfo = ref(modal.getWalletInfo())

  const unsubscribe = modal.subscribeWalletInfo(newValue => {
    walletInfo.value = newValue
  })

  onUnmounted(() => {
    unsubscribe?.()
  })

  return reactive({ walletInfo })
}

export function useAppKitState() {
  if (!modal) {
    throw new Error('Please call "createAppKit" before using "useAppKitState" composable')
  }

  const initial = modal.getState()
  const open = ref(initial.open)
  const selectedNetworkId = ref(initial.selectedNetworkId)

  const unsubscribe = modal?.subscribeState(next => {
    open.value = next.open
    selectedNetworkId.value = next.selectedNetworkId
  })

  onUnmounted(() => {
    unsubscribe?.()
  })

  return reactive({ open, selectedNetworkId })
}

export function useAppKitEvents(): AppKitEvent {
  if (!modal) {
    throw new Error('Please call "createAppKit" before using "useAppKitEvents" composable')
  }

  const event = reactive(modal.getEvent())
  const unsubscribe = modal?.subscribeEvents(next => {
    event.data = next.data
    event.timestamp = next.timestamp
  })

  onUnmounted(() => {
    unsubscribe?.()
  })

  return event
}
