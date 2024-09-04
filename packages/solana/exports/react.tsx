'use client'

import { AppKit } from '@web3modal/base'
import {
  SolanaWeb3JsClient,
  type Provider,
  useWeb3ModalConnection
} from '@web3modal/adapter-solana/react'
import { getWeb3Modal } from '@web3modal/base/library/react'
import type { SolanaAppKitOptions } from './options.js'
import { getWeb3Modal } from '@web3modal/base/utils/library/react'
import { AppKit, type CaipNetwork } from '@web3modal/base'
import type { SolStoreUtilState } from '@web3modal/scaffold-utils/solana'

// -- Types -------------------------------------------------------------------
export type { SolanaAppKitOptions, Provider }

// -- Setup -------------------------------------------------------------
let appkit: AppKit<SolStoreUtilState, CaipNetwork> | undefined = undefined
let solanaAdapter: SolanaWeb3JsClient | undefined = undefined

export function createWeb3Modal(options: SolanaAppKitOptions) {
  solanaAdapter = new SolanaWeb3JsClient({
    wallets: options.wallets
  })
  appkit = new AppKit<SolStoreUtilState, CaipNetwork>({
    ...options,
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
} from '@web3modal/base/library/react'
export { useWeb3ModalConnection }
