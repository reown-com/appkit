'use client'

import { AppKit } from '@rerock/appkit'
import type { AppKitOptions } from '@rerock/appkit'
import type { CaipNetwork } from '@rerock/appkit-common'
import { ProviderUtil } from '@rerock/appkit/store'
import { EVMEthers5Client, type AdapterOptions } from '@rerock/appkit-adapter-ethers5'
import { getWeb3Modal } from '@rerock/appkit/library/react'
import { useSnapshot } from 'valtio'
import { ethers } from 'ethers'
import { ConstantsUtil } from '@rerock/appkit-utils'

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
} from '@rerock/appkit/library/react'
