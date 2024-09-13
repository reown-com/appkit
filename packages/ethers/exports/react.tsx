'use client'

import { AppKit, AccountController } from '@reown/appkit'
import type { AppKitOptions } from '@reown/appkit'
import { EVMEthersClient, type AdapterOptions } from '@reown/appkit-adapter-ethers'
import { getAppKit } from '@reown/appkit/library/react'
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

export function createAppKit(options: EthersAppKitOptions) {
  ethersAdapter = new EVMEthersClient()
  appkit = new AppKit({
    ...options,
    sdkVersion: `react-ethers-${packageJson.version}`,
    adapters: [ethersAdapter]
  })
  getAppKit(appkit)

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

export function useAppKitAccount() {
  const { address, isConnected, status } = useSnapshot(AccountController.state)

  return {
    address,
    isConnected,
    status
  }
}

export {
  useAppKitTheme,
  useAppKit,
  useAppKitState,
  useAppKitEvents,
  useWalletInfo
} from '@reown/appkit/library/react'
