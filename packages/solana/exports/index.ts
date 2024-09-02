import { AppKit } from '@web3modal/base'
import { SolanaWeb3JsClient } from '@web3modal/adapter-solana'
import type { SolanaAppKitOptions } from './options'
import type { Provider } from '@web3modal/adapter-solana'

// -- Types -------------------------------------------------------------
export type { SolanaAppKitOptions, Provider }

// -- Setup -------------------------------------------------------------
export function createWeb3Modal(options: SolanaAppKitOptions) {
  const solanaAdapter = new SolanaWeb3JsClient({
    wallets: options.wallets
  })

  return new AppKit({
    ...options,
    adapters: [solanaAdapter]
  })
}
