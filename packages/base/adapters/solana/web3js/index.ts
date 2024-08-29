import '@web3modal/polyfills'

export { SolanaWeb3JsClient } from './client.js'

// -- Types -----------------------------------------------------------
export type { AdapterOptions } from './client.js'
export type * from '@web3modal/scaffold-utils/solana'
export type * from '@solana/wallet-adapter-base'

// -- Utils -----------------------------------------------------------
export * from '@web3modal/scaffold-utils/solana'

// -- Constants -------------------------------------------------------
export { solana, solanaDevnet, solanaTestnet } from './utils/chains.js'
