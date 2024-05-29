import '@web3modal/polyfills'

export { EVMWagmiClient } from './evm/EVMWagmiAdapter/client.js'
export type {
  CoreConfig,
  ReactConfig,
  Web3ModalClientOptions
} from './evm/EVMWagmiAdapter/client.js'

// -- Utils
export { defaultWagmiConfig } from './evm/EVMWagmiAdapter/utils/defaultWagmiCoreConfig.js'

export { SolanaWeb3JsClient } from './solana/SolanaWeb3JsAdapter/client.js'
