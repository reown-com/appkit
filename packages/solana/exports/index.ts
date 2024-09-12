import { AppKit } from '@rerock/appkit'
import { SolanaWeb3JsClient } from '@rerock/appkit-adapter-solana'
import type { SolanaAppKitOptions } from './options'
import type { Provider } from '@rerock/appkit-adapter-solana'
import { ConstantsUtil } from '@rerock/appkit-utils'

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
