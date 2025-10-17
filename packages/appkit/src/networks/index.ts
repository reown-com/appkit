// -- Networks ---------------------------------------------------------------
export * from 'viem/chains'
export * from './solana/index.js'
export * from './bitcoin.js'
export * from './ton/index.js'

// -- Utils ------------------------------------------------------------------
export * from './utils.js'

// -- Types ---------------------------------------------------------------
export type { AppKitNetwork, ChainNamespace } from '@reown/appkit-common'
export { AVAILABLE_NAMESPACES } from '@reown/appkit-common'
