'use client'

import { useSnapshot } from 'valtio'

import { ConstantsUtil } from '@web3modal/scaffold-utils'
import { getWeb3Modal } from '@web3modal/scaffold-react'
import { SolStoreUtil } from "@web3modal/scaffold-utils/solana"

import { Web3Modal } from '../src/client.js'
import type { Web3ModalOptions } from '../src/client.js'

// -- Setup -------------------------------------------------------------------
let modal: Web3Modal | undefined = undefined

export function createWeb3Modal(options: Web3ModalOptions) {
  if (!modal) {
    modal = new Web3Modal({
      ...options,
      _sdkVersion: `react-solana-${ConstantsUtil.VERSION}`
    })
  }
  getWeb3Modal(modal)

  return modal
}

// -- Hooks -------------------------------------------------------------------
export function useWeb3ModalProvider() {
  const { provider, providerType } = useSnapshot(SolStoreUtil.state)

  const walletProvider = provider as any/*@todo add as provider type here*/ | undefined

  const walletProviderType = providerType

  return {
    walletProvider,
    walletProviderType
  }
}

export function useDisconnect() {
  async function disconnect() {
    await modal?.disconnect()
  }

  return {
    disconnect
  }
}

export function useWeb3ModalAccount() {
  const { address, isConnected, chainId } = useSnapshot(SolStoreUtil.state)

  return {
    address,
    isConnected,
    chainId
  }
}

export {
  useWeb3ModalTheme,
  useWeb3Modal,
  useWeb3ModalState,
  useWeb3ModalEvents
} from '@web3modal/scaffold-react'

export { defaultSolanaConfig } from '../src/utils/defaultConfig.js'

