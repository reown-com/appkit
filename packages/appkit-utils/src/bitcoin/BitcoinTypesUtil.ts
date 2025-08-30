import type { CaipNetwork } from '@reown/appkit-common'
import type { Connector, Provider } from '@reown/appkit-controllers'

interface ChainAdapterConnector extends Connector {
  chains: CaipNetwork[]
}

/**
 * This is the interface for a Bitcoin connector.
 */
export interface BitcoinConnector extends ChainAdapterConnector, Provider {
  getAccountAddresses(): Promise<BitcoinConnector.AccountAddress[]>
  signMessage(params: BitcoinConnector.SignMessageParams): Promise<string>
  sendTransfer(params: BitcoinConnector.SendTransferParams): Promise<string>
  signPSBT(params: BitcoinConnector.SignPSBTParams): Promise<BitcoinConnector.SignPSBTResponse>
  switchNetwork(caipNetworkId: string): Promise<void>
}

// eslint-disable-next-line no-shadow
export enum AddressPurpose {
  Ordinal = 'ordinal',
  Payment = 'payment',
  Stacks = 'stx'
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
    purpose: AddressPurpose
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
    /**
     * The type of signature to use
     */
    protocol?: 'ecdsa' | 'bip322'
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

  /**
   * Parameters for signing a PSBT. The names or types of these parameters may vary across different providers. Refer to the links below for more information:
   * @link https://docs.unisat.io/dev/open-api-documentation/unisat-wallet#signpsbt
   * @link https://web3.okx.com/build/dev-docs/sdks/chains/bitcoin/provider#signpsbt
   * @link https://developer.onekey.so/connect-to-software/webapp-connect-onekey/btc/api-reference/signpsbt
   * @link https://leather.gitbook.io/developers/bitcoin-methods/signpsbt
   */
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
      /**
       * (Optional) The public key corresponding to the private key to use for signing.
       * At least specify either an address or a public key.
       */
      publicKey?: string
      /**
       * (Optional) When signing and unlocking Taproot addresses, the tweakSigner is used by default for signature generation.
       * Enabling this allows for signing with the original private key.
       */
      disableTweakSigner?: boolean
      /**
       * (Optional) By setting useTweakedSigner, you can forcibly decide whether or not to use tweakedSigner.
       * It has a higher priority than disableTweakSigner.
       */
      useTweakedSigner?: boolean
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
