/**
 * Type definitions for Polkadot injected wallet providers
 */

/**
 * Basic injected account structure from Polkadot extensions
 */
export interface InjectedAccount {
  address: string
  genesisHash?: string
  name?: string
  type?: string
}

/**
 * Injected account with metadata from Polkadot extensions
 */
export interface InjectedAccountWithMeta {
  address: string
  meta: {
    genesisHash?: string
    name?: string
    source: string
  }
  type?: string
}

/**
 * Polkadot provider interface matching browser extension APIs
 */
export interface PolkadotProvider {
  // Extension identification
  name: string
  version: string

  // Account management
  accounts: {
    get(anyType?: boolean): Promise<InjectedAccount[]>
    subscribe(callback: (accounts: InjectedAccount[]) => void): () => void
  }

  // Signer interface
  signer: any

  // Metadata management
  metadata?: {
    provide(metadata: Record<string, unknown>): Promise<boolean>
  }
}

/**
 * Polkadot extension metadata
 */
export interface PolkadotExtension {
  name: string
  version: string
  enable(origin: string): Promise<PolkadotProvider>
}

/**
 * Window interface extension for Polkadot extensions
 */
declare global {
  interface Window {
    injectedWeb3?: Record<string, PolkadotExtension>
  }
}

/**
 * Wallet source identifiers used by Polkadot extensions
 */
export type PolkadotWalletSource =
  | 'subwallet-js'
  | 'talisman'
  | 'polkadot-js'
  | 'polkadot-vault'
  | 'polkadot-js-extension'
  | 'polkadotjs-extension'
  | 'subwallet'
  | 'talisman-extension'
  | 'polkadotjs'

/**
 * Polkadot account structure
 */
export interface PolkadotAccount {
  address: string
  name?: string
  source: string
  type?: string
  genesisHash?: `0x${string}`
}

/**
 * Network configuration for Polkadot chains
 */
export interface PolkadotNetworkConfig {
  id: string
  name: string
  currency: string
  explorerUrl: string
  rpcUrl: string
  wsUrl?: string
}

/**
 * Balance information
 */
export interface PolkadotBalance {
  free: string
  reserved: string
  frozen: string
  decimals: number
  symbol: string
}

/**
 * Transaction parameters
 */
export interface PolkadotTransactionParams {
  to: string
  value: string
  data?: string
}

/**
 * Transaction result
 */
export interface PolkadotTransactionResult {
  hash: string
  blockHash?: string
  blockNumber?: number
}
