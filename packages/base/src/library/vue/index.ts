import { onUnmounted, reactive, ref } from 'vue'
import { useSnapshot } from 'valtio'
import { AccountController, type Event } from '@web3modal/core'
import type {
  W3mAccountButton,
  W3mButton,
  W3mConnectButton,
  W3mNetworkButton,
  W3mOnrampWidget
} from '@web3modal/scaffold-ui'
import type { AppKit } from '../../../src/client.js'
import type { AppKitOptions } from '../../utils/TypesUtil.js'
import { ProviderUtil } from '../../store/ProviderUtil.js'
import type { ChainNamespace } from '@web3modal/common'

type OpenOptions = {
  view: 'Account' | 'Connect' | 'Networks' | 'ApproveTransaction' | 'OnRampProviders'
}

type ThemeModeOptions = AppKitOptions['themeMode']

type ThemeVariablesOptions = AppKitOptions['themeVariables']

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    W3mConnectButton: Pick<W3mConnectButton, 'size' | 'label' | 'loadingLabel'>
    W3mAccountButton: Pick<W3mAccountButton, 'disabled' | 'balance'>
    W3mButton: Pick<W3mButton, 'size' | 'label' | 'loadingLabel' | 'disabled' | 'balance'>
    W3mNetworkButton: Pick<W3mNetworkButton, 'disabled'>
    W3mOnrampWidget: Pick<W3mOnrampWidget, 'disabled'>
  }
}

let modal: AppKit | undefined = undefined

export function getWeb3Modal<StoreState = unknown, SwitchNetworkParam = number>(
  appKit: AppKit<StoreState, SwitchNetworkParam>
) {
  if (appKit) {
    // @ts-expect-error it we should override the modal params
    modal = appKit
  }
}

export function useWeb3ModalAccount() {
  const { address, isConnected, status } = useSnapshot(AccountController.state)

  return {
    address,
    isConnected,
    status
  }
}

export function useWeb3ModalProvider<T>(chainNamespace: ChainNamespace) {
  const { providers, providerIds } = useSnapshot(ProviderUtil.state)

  const walletProvider = providers[chainNamespace] as T | undefined
  const walletProviderType = providerIds[chainNamespace]

  return {
    walletProvider,
    walletProviderType
  }
}

export function useWeb3ModalTheme() {
  if (!modal) {
    throw new Error('Please call "createWeb3Modal" before using "useWeb3ModalTheme" hook')
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

  return {
    setThemeMode,
    setThemeVariables,
    themeMode,
    themeVariables
  }
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

export function useWalletInfo() {
  if (!modal) {
    throw new Error('Please call "createWeb3Modal" before using "useWeb3Modal" composable')
  }

  const walletInfo = ref(modal.getWalletInfo())

  const unsubscribe = modal.subscribeWalletInfo(newValue => {
    walletInfo.value = newValue
  })

  onUnmounted(() => {
    unsubscribe?.()
  })

  return { walletInfo }
}

export function useWeb3ModalState() {
  if (!modal) {
    throw new Error('Please call "createWeb3Modal" before using "useWeb3ModalState" composable')
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

export interface Web3ModalEvent {
  timestamp: number
  data: Event
}

export function useWeb3ModalEvents(): Web3ModalEvent {
  if (!modal) {
    throw new Error('Please call "createWeb3Modal" before using "useWeb3ModalEvents" composable')
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
