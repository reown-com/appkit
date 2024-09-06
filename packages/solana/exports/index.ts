import { AppKit } from '@rerock/base'
import { SolanaWeb3JsClient } from '@rerock/adapter-solana'
import type { SolanaAppKitOptions } from './options'
import type { Provider } from '@rerock/adapter-solana'
import { ConstantsUtil } from '@rerock/scaffold-utils'

// -- Types -------------------------------------------------------------
export type { SolanaAppKitOptions, Provider }

// -- Setup -------------------------------------------------------------
export function createWeb3Modal(options: SolanaAppKitOptions) {
  const solanaAdapter = new SolanaWeb3JsClient({
    wallets: options.wallets
  })

  return new AppKit({
    ...options,
    sdkVersion: `html-solana-${ConstantsUtil.VERSION}`,
    adapters: [solanaAdapter]
  })
}
