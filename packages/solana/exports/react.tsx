'use client'

import { AppKit } from '@rerock/appkit'
import {
  SolanaWeb3JsClient,
  type Provider,
  useWeb3ModalConnection
} from '@rerock/appkit-adapter-solana/react'
import { getWeb3Modal } from '@rerock/appkit/library/react'
import type { SolanaAppKitOptions } from './options.js'
import { ConstantsUtil } from '@rerock/scaffold-utils'

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
    sdkVersion: `react-solana-${ConstantsUtil.VERSION}`,
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
} from '@rerock/appkit/library/react'
export { useWeb3ModalConnection }
