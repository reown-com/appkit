import type { ChainAdapterConnector } from '../../../../appkit/dist/types/src/adapters/ChainAdapterConnector.js'
import type { Provider } from '@reown/appkit-core'

/**
 * This is the interface for a Bitcoin connector.
 */
export interface BitcoinConnector extends ChainAdapterConnector, Provider {
  getAccountAddresses(): Promise<BitcoinConnector.AccountAddress[]>
  signMessage(params: BitcoinConnector.SignMessageParams): Promise<string>
  sendTransfer(params: BitcoinConnector.SendTransferParams): Promise<string>
  signPSBT(params: BitcoinConnector.SignPSBTParams): Promise<BitcoinConnector.SignPSBTResponse>
}

export namespace BitcoinConnector {
  export type AccountAddress = {
    /**
     * Public address belonging to the account.
     */
    address: string
    /**
     * Public key for the derivation path in hex, without 0x prefix
     */
    publicKey?: string
    /**
     * The derivation path of the address e.g. "m/84'/0'/0'/0/0"
     */
    path?: string
    /**
     * The purpose of the address
     */
    purpose: 'payment' | 'ordinal' | 'stx'
  }

  export type SignMessageParams = {
    /**
     * The message to be signed
     */
    message: string
    /**
     * The address to sign the message with
     */
    address: string
  }

  export type SendTransferParams = {
    /**
     * The amount to be sent in satoshis
     */
    amount: string
    /**
     * The address to send the transfer to
     */
    recipient: string
  }

  export type SignPSBTParams = {
    /**
     * The PSBT to be signed, string base64 encoded
     */
    psbt: string
    signInputs: {
      /**
       * The address whose private key to use for signing.
       */
      address: string
      /**
       * Specifies which input to sign
       */
      index: number
      /**
       * Specifies which part(s) of the transaction the signature commits to
       */
      sighashTypes: number[]
    }[]

    /**
     * If `true`, the PSBT will be broadcasted after signing. Default is `false`.
     */
    broadcast?: boolean
  }

  export type SignPSBTResponse = {
    /**
     * The signed PSBT, string base64 encoded
     */
    psbt: string
    /**
     * The `string` transaction id of the broadcasted transaction or `undefined` if not broadcasted
     */
    txid?: string
  }
}
