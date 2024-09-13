'use client'

import { AppKit } from '@reown/appkit'
import {
  SolanaWeb3JsClient,
  type Provider,
  useWeb3ModalConnection
} from '@reown/appkit-adapter-solana/react'
import { getWeb3Modal } from '@reown/appkit/library/react'
import type { SolanaAppKitOptions } from './options.js'
import packageJson from '../package.json' assert { type: 'json' }

// -- Types -------------------------------------------------------------------
export type { SolanaAppKitOptions, Provider }

// -- Setup -------------------------------------------------------------
let appkit: AppKit | undefined = undefined
let solanaAdapter: SolanaWeb3JsClient | undefined = undefined

export function createWeb3Modal(options: SolanaAppKitOptions) {
  solanaAdapter = new SolanaWeb3JsClient({
    wallets: options.wallets
  })
  appkit = new AppKit({
    ...options,
    sdkVersion: `react-solana-${packageJson.version}`,
    adapters: [solanaAdapter]
  })
  getWeb3Modal(appkit)

  return appkit
}

// -- Hooks -------------------------------------------------------------------
export function useDisconnect() {
  async function disconnect() {
    await solanaAdapter?.connectionControllerClient?.disconnect()
  }

  return {
    disconnect
  }
}

export {
  useWeb3ModalTheme,
  useWeb3Modal,
  useWeb3ModalState,
  useWeb3ModalEvents
} from '@reown/appkit/library/react'
export { useWeb3ModalConnection }
