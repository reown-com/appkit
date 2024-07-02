import '@web3modal/polyfills'

export { EVMWagmiClient } from './evm/EVMWagmiAdapter/client.js'
export { SolanaWeb3JsClient } from './solana/SolanaWeb3JsAdapter/client.js'
export type {
  CoreConfig,
  ReactConfig,
  Web3ModalClientOptions
} from './evm/EVMWagmiAdapter/client.js'
export { EthereumAdapterClient } from './walletconnect/EthereumAdapter/client.js'

// -- Utils
export { defaultWagmiConfig } from './evm/EVMWagmiAdapter/utils/defaultWagmiCoreConfig.js'
export { defaultSolanaConfig } from './solana/SolanaWeb3JsAdapter/utils/defaultSolanaConfig.js'
