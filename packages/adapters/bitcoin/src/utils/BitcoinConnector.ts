import type { ChainAdapterConnector } from '../../../../appkit/dist/types/src/adapters/ChainAdapterConnector.js'
import type { Provider } from '@reown/appkit-core'

export interface BitcoinConnector extends ChainAdapterConnector, Provider {
  getAccountAddresses(): Promise<BitcoinConnector.AccountAddress[]>
  signMessage(params: BitcoinConnector.SignMessageParams): Promise<string>
  sendTransfer(params: BitcoinConnector.SendTransferParams): Promise<string>
  signPSBT(params: BitcoinConnector.SignPSBTParams): Promise<BitcoinConnector.SignPSBTResponse>
}

export namespace BitcoinConnector {
  export type AccountAddress = {
    // Public address belonging to the account.
    address: string
    // Public key for the derivation path in hex, without 0x prefix
    publicKey?: string
    // Derivation path of the address e.g. "m/84'/0'/0'/0/0"
    path?: string
    purpose: 'payment' | 'ordinal' | 'stx'
  }

  export type SignMessageParams = {
    message: string
    address: string
  }

  export type SendTransferParams = {
    amount: string
    recipient: string
  }

  export type SignPSBTParams = {
    psbt: string
    signInputs: {
      address: string
      index: number
      sighashTypes: number[]
    }[]
    broadcast?: boolean
  }

  export type SignPSBTResponse = {
    psbt: string
    txid?: string
  }
}
