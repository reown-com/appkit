import { useSnapshot } from 'valtio'

import { AppKit } from '../../src/client.js'
import type {
  Chain,
  Provider,
  ProviderType
} from '../../adapters/solana/web3js/utils/scaffold/SolanaTypesUtil.js'
import type { BaseWalletAdapter } from '@solana/wallet-adapter-base'
import type { AppKitOptions } from '../../utils/TypesUtil.js'
import { SolanaWeb3JsClient } from '../../adapters/solana/web3js/client.js'
import { SolStoreUtil } from '../../adapters/solana/web3js/utils/scaffold/index.js'

// -- Views ------------------------------------------------------------
export * from '@web3modal/scaffold-ui'

// -- Utils & Other -----------------------------------------------------
export type * from '@web3modal/core'
export { CoreHelperUtil } from '@web3modal/core'

// -- Configs -----------------------------------------------------------
export { defaultSolanaConfig } from '../../adapters/solana/web3js/utils/defaultSolanaConfig.js'

// -- Setup -------------------------------------------------------------
let solanaAdapter: SolanaWeb3JsClient | undefined = undefined

type SolanaAppKitOptions = Omit<AppKitOptions, 'adapters' | 'sdkType' | 'sdkVersion'> & {
  solanaConfig: ProviderType
  chains: Chain[]
  wallets: BaseWalletAdapter[]
}

export function createAppKit(options: SolanaAppKitOptions) {
  solanaAdapter = new SolanaWeb3JsClient({
    solanaConfig: options.solanaConfig,
    chains: options.chains
  })
  return new AppKit({
    ...options,
    adapters: [solanaAdapter],
    sdkType: 'w3m',
    sdkVersion: 'html-solana-undefined'
  })
}

export { AppKit }

// -- Hooks ------------------------------------------------------------
export {
  useWeb3ModalTheme,
  useWeb3Modal,
  useWeb3ModalState,
  useWeb3ModalEvents
} from '@web3modal/scaffold-react'

// -- Solana Hooks -----------------------------------------------------
export function useWeb3ModalProvider() {
  const { provider, providerType, connection } = useSnapshot(SolStoreUtil.state)

  return {
    walletProvider: provider as Provider,
    walletProviderType: providerType,
    connection
  }
}

export function useDisconnect() {
  function disconnect() {
    solanaAdapter?.disconnect()
  }

  return {
    disconnect
  }
}

export function useWeb3ModalAccount() {
  const { address, isConnected, chainId, currentChain } = useSnapshot(SolStoreUtil.state)

  return {
    address,
    isConnected,
    currentChain,
    chainId
  }
}
