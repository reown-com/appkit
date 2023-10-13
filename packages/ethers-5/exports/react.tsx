'use client'

import type { Web3ModalOptions } from '../src/client.js'
import { Web3Modal } from '../src/client.js'
import { VERSION } from '@web3modal/utils'
import { ProviderController } from '../src/store/index.js'
import { getWeb3Modal } from '@web3modal/scaffold-react'
import type { Web3ModalScaffold } from '@web3modal/scaffold'
import { useSnapshot } from 'valtio'

// -- Types -------------------------------------------------------------------
export type { Web3ModalOptions } from '../src/client.js'

// -- Setup -------------------------------------------------------------------
let modal: Web3ModalScaffold | undefined = undefined

export function createWeb3Modal(options: Web3ModalOptions) {
  if (!modal) {
    modal = new Web3Modal({
      ...options,
      _sdkVersion: `react-ethers-5-${VERSION}`
    }) as Web3ModalScaffold
  }
  getWeb3Modal(modal)

  return modal
}

// -- Hooks -------------------------------------------------------------------
export function useWeb3ModalProvider() {
  const state = useSnapshot(ProviderController.state)

  const provider = state.provider
  const providerType = state.providerType

  return {
    provider,
    providerType
  }
}

export function useWeb3ModalAccount() {
  const state = useSnapshot(ProviderController.state)

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
export { defaultEthersConfig } from '../src/utils/defaultEthersReactConfig.js'
