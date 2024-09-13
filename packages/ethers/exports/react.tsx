'use client'

import { AppKit, AccountController, CoreHelperUtil } from '@reown/appkit'
import type { AppKitOptions } from '@reown/appkit'
import { EVMEthersClient, type AdapterOptions } from '@reown/appkit-adapter-ethers'
import { getWeb3Modal } from '@reown/appkit/library/react'
import { useSnapshot } from 'valtio'
import type { CaipNetwork } from '@reown/appkit-common'
import packageJson from '../package.json' assert { type: 'json' }

// -- Types -------------------------------------------------------------
export type { AdapterOptions } from '@reown/appkit-adapter-ethers'

// -- Setup -------------------------------------------------------------------
let appkit: AppKit | undefined = undefined
let ethersAdapter: EVMEthersClient | undefined = undefined

export type EthersAppKitOptions = Omit<AppKitOptions, 'adapters' | 'sdkType' | 'sdkVersion'> &
  AdapterOptions

export function createWeb3Modal(options: EthersAppKitOptions) {
  ethersAdapter = new EVMEthersClient()
  appkit = new AppKit({
    ...options,
    sdkVersion: `react-ethers-${packageJson.version}`,
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
  const { caipAddress, status } = useSnapshot(AccountController.state)

  return {
    address: CoreHelperUtil.getPlainAddress(caipAddress),
    isConnected: Boolean(caipAddress),
    status
  }
}

export {
  useWeb3ModalTheme,
  useWeb3Modal,
  useWeb3ModalState,
  useWeb3ModalEvents,
  useWalletInfo
} from '@reown/appkit/library/react'
