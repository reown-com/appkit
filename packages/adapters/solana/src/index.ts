import '@rerock/appkit-polyfills'

export { SolanaWeb3JsClient } from './client.js'

// -- Types -----------------------------------------------------------
export type { AdapterOptions } from './client.js'
export type * from '@solana/wallet-adapter-base'
export type * from './utils/SolanaStoreUtil.js'

// -- Constants -------------------------------------------------------
export { solana, solanaDevnet, solanaTestnet } from './utils/chains.js'
