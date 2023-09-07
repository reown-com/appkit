'use client'

import type {
  W3mAccountButton,
  W3mButton,
  W3mConnectButton,
  W3mNetworkButton
} from '@web3modal/scaffold'
import { useEffect, useState } from 'react'
import type { Web3ModalOptions } from '../src/client.js'
import { Web3Modal } from '../src/client.js'
import { VERSION } from '../src/utils/constants.js'

// -- Types -------------------------------------------------------------------
export type { Web3ModalOptions } from '../src/client.js'

type OpenOptions = Parameters<Web3Modal['open']>[0]

type ThemeModeOptions = Parameters<Web3Modal['setThemeMode']>[0]

type ThemeVariablesOptions = Parameters<Web3Modal['setThemeVariables']>[0]

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'w3m-connect-button': Pick<W3mConnectButton, 'size' | 'label' | 'loadingLabel'>
      'w3m-account-button': Pick<W3mAccountButton, 'disabled' | 'balance'>
      'w3m-button': Pick<W3mButton, 'size' | 'label' | 'loadingLabel' | 'disabled' | 'balance'>
      'w3m-network-button': Pick<W3mNetworkButton, 'disabled'>
    }
  }
}

// -- Setup -------------------------------------------------------------------
let modal: Web3Modal | undefined = undefined

export function createWeb3Modal(options: Web3ModalOptions) {
  if (!modal) {
    modal = new Web3Modal({ ...options, _sdkVersion: `react-wagmi-${VERSION}` })
  }

  return modal
}

export { defaultWagmiConfig } from '../src/utils/defaultWagmiReactConfig.js'

// -- Hooks -------------------------------------------------------------------
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

export function useWeb3Modal() {
  if (!modal) {
    throw new Error('Please call "createWeb3Modal" before using "useWeb3Modal" hook')
  }

  async function open(options?: OpenOptions) {
    await modal?.open(options)
  }

  async function close() {
    await modal?.close()
  }

  return { open, close }
}
