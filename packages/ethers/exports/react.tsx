'use client'

import { AppKit, AccountController } from '@web3modal/base'
import type { AppKitOptions } from '@web3modal/base'
import { EVMEthersClient, type AdapterOptions } from '@web3modal/adapter-ethers'
import { getWeb3Modal } from '@web3modal/base/library/react'
import { ConstantsUtil } from '@web3modal/scaffold-utils'
import { type Chain, type EthersStoreUtilState } from '@web3modal/scaffold-utils/ethers'
import { useSnapshot } from 'valtio'
import type { CaipNetwork } from '@web3modal/common'

// -- Setup -------------------------------------------------------------------
let appkit: AppKit<EthersStoreUtilState, number> | undefined = undefined
let ethersAdapter: EVMEthersClient | undefined = undefined

export type EthersAppKitOptions = Omit<AppKitOptions, 'adapters' | 'sdkType' | 'sdkVersion'> &
  AdapterOptions

export function createWeb3Modal(options: EthersAppKitOptions) {
  ethersAdapter = new EVMEthersClient()
  appkit = new AppKit<EthersStoreUtilState, number>({
    ...options,
    adapters: [ethersAdapter]
  })
  getWeb3Modal<EthersStoreUtilState>(appkit)

  return appkit
}

// -- Hooks -------------------------------------------------------------------
export function useDisconnect() {
  async function disconnect() {
    await ethersAdapter?.disconnect()
  }

  return {
    disconnect
  }
}

export function useSwitchNetwork() {
  // Breaking change
  async function switchNetwork(caipNetwork: CaipNetwork) {
    await ethersAdapter?.switchNetwork(caipNetwork)
  }

  return {
    switchNetwork
  }
}

export function useWeb3ModalAccount() {
  const { address, isConnected, status } = useSnapshot(AccountController.state)

  return {
    address,
    isConnected,
    status
  }
}

export {
  useWeb3ModalTheme,
  useWeb3Modal,
  useWeb3ModalState,
  useWeb3ModalEvents,
  useWalletInfo
} from '@web3modal/base/library/react'
