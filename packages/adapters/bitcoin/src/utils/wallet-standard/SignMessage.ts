import type { WalletAccount } from '@wallet-standard/base'

/**
 * This should be in the package `@exodus/bitcoin-wallet-standard`, but as it is outdated we have it here.
 * References to https://github.com/ExodusMovement/bitcoin-wallet-standard/blob/master/packages/core/features/src/signMessage.ts
 */

/** Name of the feature. */
export const BitcoinSignMessage = 'bitcoin:signMessage'

/**
 * `bitcoin:signMessage` is a {@link "@wallet-standard/base".Wallet.features | feature} that may be implemented by a
 * {@link "@wallet-standard/base".Wallet} to allow the app to request to sign a message with the specified
 * {@link "@wallet-standard/base".Wallet.accounts | account}.
 *
 * The wallet should prefix the message to be signed to avoid signing a valid transaction.
 * For an example of the prefix (and hashing algorithm), see:
 * https://github.com/bitcoinjs/bitcoinjs-message/blob/c43430f4c03c292c719e7801e425d887cbdf7464/index.js#L57.
 *
 * @group SignMessage
 */
export type BitcoinSignMessageFeature = {
  /** Name of the feature. */
  readonly [BitcoinSignMessage]: {
    /** Version of the feature implemented by the Wallet. */
    readonly version: BitcoinSignMessageVersion

    /** Method to call to use the feature. */
    readonly signMessage: BitcoinSignMessageMethod
  }
}

/**
 * Version of the {@link BitcoinSignMessageFeature} implemented by a {@link "@wallet-standard/base".Wallet}.
 *
 * @group SignMessage
 */
export type BitcoinSignMessageVersion = '1.0.0'

/**
 * Method to call to use the {@link BitcoinSignMessageFeature}.
 *
 * @group SignMessage
 */
export type BitcoinSignMessageMethod = (
  ...inputs: readonly BitcoinSignMessageInput[]
) => Promise<readonly BitcoinSignMessageOutput[]>

/**
 * Input for the {@link BitcoinSignMessageMethod}.
 *
 * @group SignMessage
 */
export interface BitcoinSignMessageInput {
  /** Account to use. */
  readonly account: WalletAccount

  /** Message to sign, as raw bytes. */
  readonly message: Uint8Array
}

/**
 * Output of the {@link BitcoinSignMessageMethod}.
 *
 * @group SignMessage
 */
export interface BitcoinSignMessageOutput {
  /**
   * Message bytes that were signed.
   * The wallet may prefix or otherwise modify the message before signing it.
   */
  readonly signedMessage: Uint8Array

  /** Message signature produced. */
  readonly signature: Uint8Array
}
