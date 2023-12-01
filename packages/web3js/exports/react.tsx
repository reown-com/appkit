'use client'

import type { Web3ModalOptions } from '@web3modal/connectors'
import { Web3Modal } from '@web3modal/connectors'
import { ConstantsUtil } from '@web3modal/scaffold-utils'
import { EthersStoreUtil } from '@web3modal/scaffold-utils/ethers'
import { getWeb3Modal } from '@web3modal/scaffold-react'
import { ethereumHelpers } from '../utils/ethereumHelpers.js'
import { useSnapshot } from 'valtio'

// -- Types -------------------------------------------------------------------
export type { Web3ModalOptions } from '@web3modal/connectors'

// -- Setup -------------------------------------------------------------------
let modal: Web3Modal | undefined = undefined

export function createWeb3Modal(options: Web3ModalOptions) {
  if (!modal) {
    modal = new Web3Modal({
      ...options,
      _sdkVersion: `react-web3js-${ConstantsUtil.VERSION}`,
      ethereumHelpers
    })
  }
  getWeb3Modal(modal)

  return modal
}

// -- Hooks -------------------------------------------------------------------
export function useWeb3ModalProvider() {
  const state = useSnapshot(EthersStoreUtil.state)

  const walletProvider = state.provider
  const walletProviderType = state.providerType

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
  const state = useSnapshot(EthersStoreUtil.state)

  const address = state.address
  const isConnected = state.isConnected
  const chainId = state.chainId

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

// -- Universal Exports -------------------------------------------------------
export { defaultConfig } from '@web3modal/connectors'
