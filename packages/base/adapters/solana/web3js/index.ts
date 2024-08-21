import '@web3modal/polyfills'

export { SolanaWeb3JsClient } from './client.js'

// -- Types -----------------------------------------------------------
export type { Web3ModalClientOptions } from './client.js'
export type * from './utils/scaffold/SolanaTypesUtil.js'
export type * from '@solana/wallet-adapter-base'

// -- Utils -----------------------------------------------------------
export * from './utils/defaultConfig.js'
export * from './utils/scaffold/SolanaStoreUtil.js'

// -- Constants -------------------------------------------------------
export { solana, solanaDevnet, solanaTestnet } from './utils/chains.js'
