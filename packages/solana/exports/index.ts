import { AppKit } from '@web3modal/base'
import { SolanaWeb3JsClient } from '@web3modal/base/adapters/solana/web3js'
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
    wallets: options.wallets
  })

  return new AppKit({
    ...options,
    adapters: [solanaAdapter]
  })
}
