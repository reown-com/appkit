'use client'

import { ThemeController, type ThemeMode, type ThemeVariables } from '@web3modal/scaffold'
import type { Web3ModalOptions } from '../src/client.js'
import { Web3Modal } from '../src/client.js'
import { VERSION } from '../src/utils/constants.js'
import { useEffect, useState } from 'react'

// -- Types -------------------------------------------------------------------
export type { Web3ModalOptions } from '../src/client.js'
type OpenOptions = Parameters<Web3Modal['open']>[0]

// -- Setup -------------------------------------------------------------------
let modal: Web3Modal | undefined = undefined

// -- Lib ---------------------------------------------------------------------
export function createWeb3Modal(options: Omit<Web3ModalOptions, '_sdkVersion'>) {
  if (!modal) {
    modal = new Web3Modal({ ...options, _sdkVersion: `react-wagmi-${VERSION}` })
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

  const [themeMode, setInternalThemeMode] = useState(getThemeMode())
  const [themeVariables, setInternalThemeVariables] = useState(getThemeVariables())

  useEffect(() => {
    modal?.subscribeThemeMode(setInternalThemeMode)
    modal?.subscribeThemeVariables(setInternalThemeVariables)

    return () => {
      modal?.unmount()
    }
  }, [])

  return {
    themeMode,
    themeVariables,
    getThemeMode,
    getThemeVariables,
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

export { defaultWagmiConfig } from '../src/utils/defaultWagmiReactConfig.js'
