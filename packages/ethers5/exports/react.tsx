'use client'

import { AppKit } from '@web3modal/base'
import type { AppKitOptions } from '@web3modal/base'
import type { CaipNetwork } from '@web3modal/common'
import { ProviderUtil } from '@web3modal/base/utils/store'
import { EVMEthersClient, type AdapterOptions } from '@web3modal/base/adapters/evm/ethers'
import { EthersStoreUtil } from '@web3modal/scaffold-utils/ethers'
import { getWeb3Modal } from '@web3modal/base/utils/library/react'
import { useSnapshot } from 'valtio'
import { ethers } from 'ethers'

// -- Setup -------------------------------------------------------------------
let appkit: AppKit | undefined = undefined
let ethersAdapter: EVMEthersClient | undefined = undefined

export type Ethers5AppKitOptions = Omit<AppKitOptions, 'adapters' | 'sdkType' | 'sdkVersion'> &
  AdapterOptions

export function createWeb3Modal(options: Ethers5AppKitOptions) {
  ethersAdapter = new EVMEthersClient()
  appkit = new AppKit({
    ...options,
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

export function useWeb3ModalAccount() {
  const { address, isConnected, chainId, status } = useSnapshot(EthersStoreUtil.state)

  return {
    address,
    isConnected,
    chainId,
    status
  }
}

export function useWeb3ModalError() {
  const { error } = useSnapshot(EthersStoreUtil.state)

  return {
    error
  }
}

export {
  useWeb3ModalTheme,
  useWeb3Modal,
  useWeb3ModalState,
  useWeb3ModalEvents,
  useWalletInfo
} from '@web3modal/base/utils/library/react'
