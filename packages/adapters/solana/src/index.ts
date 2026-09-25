import '@reown/appkit-polyfills'

export { SolanaAdapter } from './client.js'
export {
  getBalanceKit,
  getLatestBlockhashKit,
  waitForSignatureConfirmationKit
} from './utils/SolanaKitConnectionUtil.js'

// -- Types -----------------------------------------------------------
export type { AdapterOptions } from './client.js'
export type * from '@solana/wallet-adapter-base'
export type * from './utils/SolanaStoreUtil.js'
