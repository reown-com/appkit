import type { ChainAdapterConnector } from '../../../../appkit/dist/types/src/adapters/ChainAdapterConnector.js'
import type { Provider } from '@reown/appkit-core'

export interface BitcoinConnector extends ChainAdapterConnector, Provider {
  connect(): Promise<string>
  getAccountAddresses(): Promise<BitcoinConnector.AccountAddress[]>
  signMessage(params: { address: string; message: string }): Promise<string>
  sendTransfer(params: { address: string; amount: string; recipient: string }): Promise<string>
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
