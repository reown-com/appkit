// -- Networks ---------------------------------------------------------------
export * from 'viem/chains'
export * from './solana/index.js'
export * from './bitcoin.js'
export * from './polkadot/index.js'

// -- Utils ------------------------------------------------------------------
export * from './utils.js'

// -- Types ---------------------------------------------------------------
export type { AppKitNetwork, ChainNamespace } from '@laughingwhales/appkit-common'
export { AVAILABLE_NAMESPACES } from '@laughingwhales/appkit-common'
