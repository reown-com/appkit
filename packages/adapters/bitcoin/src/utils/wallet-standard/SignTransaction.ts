import type { IdentifierString, WalletAccount } from '@wallet-standard/base'

/**
 * This should be in the package `@exodus/bitcoin-wallet-standard`, but as it is outdated we have it here.
 * References to https://github.com/ExodusMovement/bitcoin-wallet-standard/blob/master/packages/core/features/src/signTransaction.ts
 */

/** Name of the feature. */
export const BitcoinSignTransaction = 'bitcoin:signTransaction'

/**
 * `bitcoin:signTransaction` is a {@link "@wallet-standard/base".Wallet.features | feature} that may be implemented by a
 * {@link "@wallet-standard/base".Wallet} to allow the app to request to sign transactions with the specified
 * {@link "@wallet-standard/base".Wallet.accounts}.
 *
 * @group SignTransaction
 */
export type BitcoinSignTransactionFeature = {
  /** Name of the feature. */
  readonly [BitcoinSignTransaction]: {
    /** Version of the feature implemented by the Wallet. */
    readonly version: BitcoinSignTransactionVersion

    /** Method to call to use the feature. */
    readonly signTransaction: BitcoinSignTransactionMethod
  }
}

/**
 * Version of the {@link BitcoinSignTransactionFeature} implemented by a {@link "@wallet-standard/base".Wallet}.
 *
 * @group SignTransaction
 */
export type BitcoinSignTransactionVersion = '1.0.0'

/**
 * Method to call to use the {@link BitcoinSignTransactionFeature}.
 *
 * @group SignTransaction
 */
export type BitcoinSignTransactionMethod = (
  ...inputs: readonly BitcoinSignTransactionInput[]
) => Promise<readonly BitcoinSignTransactionOutput[]>

/**
 * Input for the {@link BitcoinSignTransactionMethod}.
 *
 * @group SignTransaction
 */
export interface BitcoinSignTransactionInput {
  /** Partially Signed Bitcoin Transaction (PSBT), as raw bytes. */
  readonly psbt: Uint8Array

  /** Transaction inputs to sign. */
  readonly inputsToSign: InputToSign[]

  /** Chain to use. */
  readonly chain?: IdentifierString
}

/**
 * Transaction input to be signed with the specified {@link "@wallet-standard/base".WalletAccount | account}.
 *
 * @group SignTransaction
 */
export interface InputToSign {
  /** Account to use. */
  readonly account: WalletAccount

  /** List of input indexes that should be signed by the account. */
  readonly signingIndexes: number[]

  /** A SIGHASH flag. */
  readonly sigHash?: BitcoinSigHashFlag
}

/**
 * Output of the {@link BitcoinSignTransactionMethod}.
 *
 * @group SignTransaction
 */
export interface BitcoinSignTransactionOutput {
  /** Signed Partially Signed Bitcoin Transaction (PSBT), as raw bytes. */
  readonly signedPsbt: Uint8Array
}

/** SIGHASH flag. */
export type BitcoinSigHashFlag =
  | 'ALL'
  | 'NONE'
  | 'SINGLE'
  | 'ALL|ANYONECANPAY'
  | 'NONE|ANYONECANPAY'
  | 'SINGLE|ANYONECANPAY'
