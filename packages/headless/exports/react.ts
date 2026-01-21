import { useEffect, useState } from 'react'

import type { AppKitNetwork, ChainNamespace } from '@reown/appkit-common'
import type {
  EventsControllerState,
  PublicStateControllerState,
  UseAppKitNetworkReturn
} from '@reown/appkit-controllers'
import { useAppKitNetworkCore } from '@reown/appkit-controllers/react'

import {
  type CreateAppKitHeadlessOptions,
  HeadlessClient,
  createAppKitHeadless,
  getHeadlessClient
} from '../src/client/headless-client.js'

// -- Re-export core hooks from controllers ------------------------------------
export {
  useAppKitProvider,
  useAppKitAccount,
  useDisconnect,
  useAppKitConnections,
  useAppKitConnection,
  useAppKitWallets
} from '@reown/appkit-controllers/react'

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

export type * from '@reown/appkit-controllers/react'

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
export { createAppKit as createAppKitHeadlessReact }

// -- React-specific hooks -----------------------------------------------------
export function useAppKitNetwork(): UseAppKitNetworkReturn {
  const { caipNetwork, caipNetworkId, chainId } = useAppKitNetworkCore()

  async function switchNetwork(network: AppKitNetwork) {
    await modal?.switchNetwork(network)
  }

  return {
    caipNetwork,
    caipNetworkId,
    chainId,
    switchNetwork
  }
}

export function useAppKitTheme() {
  if (!modal) {
    throw new Error('Please call "createAppKit" before using "useAppKitTheme" hook')
  }

  function setThemeMode(themeMode: 'dark' | 'light') {
    if (themeMode) {
      modal?.setThemeMode(themeMode)
    }
  }

  function setThemeVariables(themeVariables: Record<string, string>) {
    if (themeVariables) {
      modal?.setThemeVariables(themeVariables)
    }
  }

  const [themeMode, setInternalThemeMode] = useState(modal.getThemeMode())
  const [themeVariables, setInternalThemeVariables] = useState(modal.getThemeVariables())

  useEffect(() => {
    const unsubscribe = modal?.subscribeTheme(state => {
      setInternalThemeMode(state.themeMode)
      setInternalThemeVariables(state.themeVariables)
    })

    return () => {
      unsubscribe?.()
    }
  }, [])

  return {
    themeMode,
    themeVariables,
    setThemeMode,
    setThemeVariables
  }
}

export function useAppKit() {
  if (!modal) {
    throw new Error('Please call "createAppKit" before using "useAppKit" hook')
  }

  // Note: open() and close() are no-ops in headless mode
  function open() {
    // No-op in headless mode
  }

  function close() {
    modal?.close()
  }

  return { open, close }
}

export function useWalletInfo(namespace?: ChainNamespace) {
  if (!modal) {
    throw new Error('Please call "createAppKit" before using "useWalletInfo" hook')
  }

  const [walletInfo, setWalletInfo] = useState(() => modal?.getWalletInfo(namespace))

  useEffect(() => {
    setWalletInfo(modal?.getWalletInfo(namespace))

    const unsubscribe = modal?.subscribeWalletInfo(newWalletInfo => {
      setWalletInfo(newWalletInfo)
    }, namespace)

    return () => unsubscribe?.()
  }, [namespace])

  return { walletInfo }
}

export function useAppKitState() {
  if (!modal) {
    throw new Error('Please call "createAppKit" before using "useAppKitState" hook')
  }

  const [state, setState] = useState<PublicStateControllerState>({
    ...modal.getState(),
    initialized: false
  })
  const [remoteFeatures, setRemoteFeatures] = useState(modal.getRemoteFeatures())

  useEffect(() => {
    if (modal) {
      setState({ ...modal.getState() })
      setRemoteFeatures(modal.getRemoteFeatures())
      const unsubscribe = modal?.subscribeState((newState: PublicStateControllerState) => {
        setState({ ...newState })
      })
      const unsubscribeRemoteFeatures = modal?.subscribeRemoteFeatures(newState => {
        setRemoteFeatures(newState)
      })

      return () => {
        unsubscribe?.()
        unsubscribeRemoteFeatures?.()
      }
    }

    return () => null
  }, [])

  return { ...state, ...(remoteFeatures ?? {}) }
}

export function useAppKitEvents() {
  if (!modal) {
    throw new Error('Please call "createAppKit" before using "useAppKitEvents" hook')
  }

  const [event, setEvents] = useState<EventsControllerState>(modal.getEvent())

  useEffect(() => {
    const unsubscribe = modal?.subscribeEvents((newEvent: EventsControllerState) => {
      setEvents({ ...newEvent })
    })

    return () => {
      unsubscribe?.()
    }
  }, [])

  return event
}
