import { useEffect, useState, useSyncExternalStore } from 'react'
import type {
  W3mAccountButton,
  W3mButton,
  W3mConnectButton,
  W3mNetworkButton,
  W3mOnrampWidget
} from '../index.js'
import { AppKit } from '../../src/client.js'

type OpenOptions = Parameters<AppKit['open']>[0]

type ThemeModeOptions = Parameters<AppKit['setThemeMode']>[0]

type ThemeVariablesOptions = Parameters<AppKit['setThemeVariables']>[0]

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'w3m-connect-button': Pick<W3mConnectButton, 'size' | 'label' | 'loadingLabel'>
      'w3m-account-button': Pick<W3mAccountButton, 'disabled' | 'balance'>
      'w3m-button': Pick<W3mButton, 'size' | 'label' | 'loadingLabel' | 'disabled' | 'balance'>
      'w3m-network-button': Pick<W3mNetworkButton, 'disabled'>
      'w3m-onramp-widget': Pick<W3mOnrampWidget, 'disabled'>
    }
  }
}

let modal: AppKit | undefined = undefined

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getAppKit(appKit: any) {
  if (appKit) {
    modal = appKit as AppKit
  }
}

export function useAppKitTheme() {
  if (!modal) {
    throw new Error('Please call "createAppKit" before using "useAppKitTheme" hook')
  }

  function setThemeMode(themeMode: ThemeModeOptions) {
    modal?.setThemeMode(themeMode)
  }

  function setThemeVariables(themeVariables: ThemeVariablesOptions) {
    modal?.setThemeVariables(themeVariables)
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

  async function open(options?: OpenOptions) {
    await modal?.open(options)
  }

  async function close() {
    await modal?.close()
  }

  return { open, close }
}

export function useWalletInfo() {
  if (!modal) {
    throw new Error('Please call "createAppKit" before using "useAppKit" hook')
  }

  const walletInfo = useSyncExternalStore(
    modal.subscribeWalletInfo,
    modal.getWalletInfo,
    modal.getWalletInfo
  )

  return { walletInfo }
}

export function useAppKitState() {
  if (!modal) {
    throw new Error('Please call "createAppKit" before using "useAppKitState" hook')
  }

  const [state, setState] = useState(modal.getState())

  useEffect(() => {
    const unsubscribe = modal?.subscribeState(newState => {
      setState({ ...newState })
    })

    return () => {
      unsubscribe?.()
    }
  }, [])

  return state
}

export function useAppKitEvents() {
  if (!modal) {
    throw new Error('Please call "createAppKit" before using "useAppKitState" hook')
  }

  const [event, setEvents] = useState(modal.getEvent())

  useEffect(() => {
    const unsubscribe = modal?.subscribeEvents(newEvent => {
      setEvents({ ...newEvent })
    })

    return () => {
      unsubscribe?.()
    }
  }, [])

  return event
}
