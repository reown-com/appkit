import '@web3modal/polyfills'

export { SolanaWeb3JsClient } from './client.js'

// -- Types -----------------------------------------------------------
export type { Web3ModalClientOptions } from './client.js'
export type { ProviderType, Provider } from './utils/scaffold/SolanaTypesUtil.js'
export type { BaseWalletAdapter } from '@solana/wallet-adapter-base'
export type { Chain } from '@web3modal/scaffold-utils'

// -- Utils -----------------------------------------------------------
export { defaultSolanaConfig } from './utils/defaultSolanaConfig.js'
export { SolStoreUtil } from './utils/scaffold/SolanaStoreUtil.js'

// -- Constants -------------------------------------------------------
export { solana, solanaDevnet, solanaTestnet } from './utils/chains.js'
