import type { CaipNetwork } from '@reown/appkit-common'
import type { Connector, Provider } from '@reown/appkit-controllers'

interface ChainAdapterConnector extends Connector {
  chains: CaipNetwork[]
}

export interface StellarConnector extends ChainAdapterConnector, Provider {
  chains: CaipNetwork[]
  /**
   * Signs a transaction envelope XDR and returns the fully signed envelope.
   */
  signXDR(params: StellarConnector.SignXDRParams): Promise<StellarConnector.SignXDRResult>
  /**
   * Signs a transaction envelope XDR and submits it to the network's Horizon endpoint.
   */
  signAndSubmitXDR(
    params: StellarConnector.SignAndSubmitXDRParams
  ): Promise<StellarConnector.SignAndSubmitXDRResult>
  /**
   * Signs an arbitrary message under the account's Ed25519 key, using the SEP-53
   * domain-separated payload `sha256("StellarMessage" || 0x00 || message)`.
   */
  signMessage(
    params: StellarConnector.SignMessageParams
  ): Promise<StellarConnector.SignMessageResult>
  /**
   * Signs a Soroban `SorobanAuthorizationEntry` with address credentials.
   */
  signAuthEntry(
    params: StellarConnector.SignAuthEntryParams
  ): Promise<StellarConnector.SignAuthEntryResult>
}

export declare namespace StellarConnector {
  type SignXDRParams = {
    /** Base64-encoded transaction envelope */
    xdr: string
    /** Signer address in StrKey form, e.g. `G...` */
    address: string
  }
  type SignXDRResult = {
    signedXDR: string
    signerAddress: string
  }

  type SignAndSubmitXDRParams = SignXDRParams & {
    /** When true, the wallet reports whether the transaction landed successfully */
    waitForInclusion?: boolean
  }
  type SignAndSubmitXDRResult = {
    txHash: string
    signedXDR: string
    successful?: boolean
  }

  type SignMessageParams = {
    message: string
    /** Signer address in StrKey form, e.g. `G...` */
    address: string
    /** How `message` is encoded. Defaults to `utf-8`. */
    messageEncoding?: 'utf-8' | 'base64'
  }
  type SignMessageResult = {
    /** Base64-encoded 64-byte Ed25519 signature */
    signature: string
    signerAddress: string
  }

  type SignAuthEntryParams = {
    /** Base64-encoded unsigned `SorobanAuthorizationEntry` */
    authEntry: string
    /** Signer address in StrKey form, e.g. `G...` */
    address: string
  }
  type SignAuthEntryResult = {
    signedAuthEntry: string
    signerAddress: string
  }
}
