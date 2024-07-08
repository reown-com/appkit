import { SolanaWeb3JsClient } from '../../adapters/solana/web3js/client.js'
import type {
  Chain,
  ProviderType
} from '../../adapters/solana/web3js/utils/scaffold/SolanaTypesUtil.js'
import type { BaseWalletAdapter } from '@solana/wallet-adapter-base'
import { AppKit } from '../../src/client.js'
import type { AppKitOptions } from '../../utils/TypesUtil.js'

// -- Views ------------------------------------------------------------
export * from '@web3modal/scaffold-ui'

// -- Utils & Other -----------------------------------------------------
export type * from '@web3modal/core'
export { CoreHelperUtil } from '@web3modal/core'

// -- Configs -----------------------------------------------------------
export { defaultSolanaConfig } from '../../adapters/solana/web3js/utils/defaultSolanaConfig.js'

// -- Setup -------------------------------------------------------------
type SolanaAppKitOptions = Omit<AppKitOptions, 'adapters' | 'sdkType' | 'sdkVersion'> & {
  solanaConfig: ProviderType
  chains: Chain[]
  wallets: BaseWalletAdapter[]
}

export function createAppKit(options: SolanaAppKitOptions) {
  const solanaAdapter = new SolanaWeb3JsClient({
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
