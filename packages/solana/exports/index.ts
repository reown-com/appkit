import { AppKit } from '@web3modal/base'
import { SolanaWeb3JsClient } from '@web3modal/base/adapters/solana/web3js'
import { ConstantsUtil } from '@web3modal/scaffold-utils'
import type { SolanaAppKitOptions } from './options'
import type { Provider } from '@web3modal/base/adapters/solana/web3js'

// -- Configs -----------------------------------------------------------
export { defaultSolanaConfig } from '@web3modal/base/adapters/solana/web3js'

// -- Types -------------------------------------------------------------
export type { SolanaAppKitOptions, Provider }

// -- Setup -------------------------------------------------------------
export function createWeb3Modal(options: SolanaAppKitOptions) {
  const solanaAdapter = new SolanaWeb3JsClient({
    solanaConfig: options.solanaConfig,
    chains: options.chains,
    wallets: options.wallets,
    projectId: options.projectId,
    defaultChain: options.defaultChain
  })

  return new AppKit({
    ...options,
    defaultChain: solanaAdapter.defaultChain,
    adapters: [solanaAdapter],
    sdkType: 'w3m',
    sdkVersion: `html-solana-${ConstantsUtil.VERSION}`
  })
}
