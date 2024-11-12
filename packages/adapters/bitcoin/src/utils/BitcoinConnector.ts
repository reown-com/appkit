import type { ChainAdapterConnector } from '../../../../appkit/dist/types/src/adapters/ChainAdapterConnector.js'

export interface BitcoinConnector extends ChainAdapterConnector {
  connect(): Promise<string>
  getAccountAddresses(): Promise<BitcoinConnector.AccountAddress[]>
}

export namespace BitcoinConnector {
  export type AccountAddress = {
    // Public address belonging to the account.
    address: string
    // Public key for the derivation path in hex, without 0x prefix
    publicKey?: string
    // Derivation path of the address e.g. "m/84'/0'/0'/0/0"
    path?: string
    intention?: 'payment' | 'ordinal'
  }
}
