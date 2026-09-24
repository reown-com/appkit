import '@reown/appkit-polyfills'

export { SolanaAdapter } from './client.js'
export { createSPLTokenTransactionKit } from './utils/createSPLTokenTransactionKit.js'

// -- Types -----------------------------------------------------------
export type { AdapterOptions } from './client.js'
export type { SPLTokenTransactionKitArgs } from '@reown/appkit-utils/solana'
export type * from '@solana/wallet-adapter-base'
export type * from './utils/SolanaStoreUtil.js'
