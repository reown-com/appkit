'use client'

import { AppKit } from '@web3modal/base'
import type { AppKitOptions } from '@web3modal/base'
import { EVMEthersClient, type AdapterOptions } from '@web3modal/base/adapters/evm/ethers'
import { ConstantsUtil } from '@web3modal/scaffold-utils'
import {
  EthersStoreUtil,
  type Chain,
  type EthersStoreUtilState
} from '@web3modal/scaffold-utils/ethers'
import { getWeb3Modal } from '@web3modal/base/utils/library/react'
import { useSnapshot } from 'valtio'
import type { Eip1193Provider } from 'ethers'

// -- Configs -----------------------------------------------------------
export { defaultConfig } from '@web3modal/base/adapters/evm/ethers'

// -- Setup -------------------------------------------------------------------
let appkit: AppKit<EthersStoreUtilState, number> | undefined = undefined
let ethersAdapter: EVMEthersClient | undefined = undefined

export type EthersAppKitOptions = Omit<
  AppKitOptions<Chain>,
  'adapters' | 'sdkType' | 'sdkVersion'
> &
  AdapterOptions

export function createWeb3Modal(options: EthersAppKitOptions) {
  ethersAdapter = new EVMEthersClient({
    ethersConfig: options.ethersConfig,
    siweConfig: options.siweConfig,
    chains: options.chains,
    defaultChain: options.defaultChain
  })
  appkit = new AppKit<EthersStoreUtilState, number>({
    ...options,
    defaultChain: ethersAdapter.defaultChain,
    adapters: [ethersAdapter],
    sdkType: 'w3m',
    sdkVersion: `react-ethers-${ConstantsUtil.VERSION}`
  })
  getWeb3Modal<EthersStoreUtilState, number>(appkit)

  return appkit
}

// -- Hooks -------------------------------------------------------------------
export function useWeb3ModalProvider() {
  const { provider, providerType } = useSnapshot(EthersStoreUtil.state)

  const walletProvider = provider as Eip1193Provider | undefined
  const walletProviderType = providerType

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
  async function switchNetwork(chainId: number) {
    await ethersAdapter?.switchNetwork(chainId)
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
