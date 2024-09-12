'use client'

import { AppKit } from '@rerock/base'
import type { AppKitOptions } from '@rerock/base'
import type { CaipNetwork } from '@rerock/common'
import { ProviderUtil } from '@rerock/base/store'
import { EVMEthers5Client, type AdapterOptions } from '@rerock/appkit-adapter-ethers5'
import { getWeb3Modal } from '@rerock/base/library/react'
import { useSnapshot } from 'valtio'
import { ethers } from 'ethers'
import { ConstantsUtil } from '@rerock/scaffold-utils'

// -- Setup -------------------------------------------------------------------
let appkit: AppKit | undefined = undefined
let ethersAdapter: EVMEthers5Client | undefined = undefined

export type Ethers5AppKitOptions = Omit<AppKitOptions, 'adapters' | 'sdkType' | 'sdkVersion'> &
  AdapterOptions

export function createWeb3Modal(options: Ethers5AppKitOptions) {
  ethersAdapter = new EVMEthers5Client()
  appkit = new AppKit({
    ...options,
    sdkVersion: `react-ethers5-${ConstantsUtil.VERSION}`,
    adapters: [ethersAdapter]
  })
  getWeb3Modal(appkit)

  return appkit
}

// -- Hooks -------------------------------------------------------------------
export function useWeb3ModalProvider() {
  const { providers, providerIds } = useSnapshot(ProviderUtil.state)

  const walletProvider = providers['eip155'] as ethers.providers.ExternalProvider | undefined
  const walletProviderType = providerIds['eip155']

  return {
    walletProvider,
    walletProviderType
  }
}

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

export {
  useWeb3ModalTheme,
  useWeb3Modal,
  useWeb3ModalState,
  useWeb3ModalEvents,
  useWalletInfo
} from '@rerock/base/library/react'
