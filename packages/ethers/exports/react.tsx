'use client'

import { AppKit, AccountController, CoreHelperUtil } from '@rerock/base'
import type { AppKitOptions } from '@rerock/base'
import { EVMEthersClient, type AdapterOptions } from '@rerock/adapter-ethers'
import { getWeb3Modal } from '@rerock/base/library/react'
import { useSnapshot } from 'valtio'
import type { CaipNetwork } from '@rerock/common'
import { ConstantsUtil } from '@rerock/scaffold-utils'

// -- Types -------------------------------------------------------------
export type { AdapterOptions } from '@rerock/adapter-ethers'

// -- Setup -------------------------------------------------------------------
let appkit: AppKit | undefined = undefined
let ethersAdapter: EVMEthersClient | undefined = undefined

export type EthersAppKitOptions = Omit<AppKitOptions, 'adapters' | 'sdkType' | 'sdkVersion'> &
  AdapterOptions

export function createWeb3Modal(options: EthersAppKitOptions) {
  ethersAdapter = new EVMEthersClient()
  appkit = new AppKit({
    ...options,
    sdkVersion: `react-ethers-${ConstantsUtil.VERSION}`,
    adapters: [ethersAdapter]
  })
  getWeb3Modal(appkit)

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
  const {  caipAddress, status } = useSnapshot(AccountController.state)

  return {
    address: CoreHelperUtil.getPlainAddress(caipAddress),
    isConnected: caipAddress ? true : false,
    status
  }
}

export {
  useWeb3ModalTheme,
  useWeb3Modal,
  useWeb3ModalState,
  useWeb3ModalEvents,
  useWalletInfo
} from '@rerock/base/library/react'
