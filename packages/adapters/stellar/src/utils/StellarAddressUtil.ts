import { StellarStrKeyUtil } from '@reown/appkit-common'

export const StellarAddressUtil = {
  /**
   * Whether the given string is a well-formed Stellar account address (`G...`).
   */
  isValidAddress(address: string): boolean {
    return StellarStrKeyUtil.isValidEd25519PublicKey(address)
  },

  /**
   * Extracts the account address from a CAIP-10 string such as
   * `stellar:pubnet:GABC...`. Returns the input unchanged when it is already a
   * bare address.
   */
  parseCaipAddress(caipAddress: string): string {
    const parts = caipAddress.split(':')

    return parts[parts.length - 1] ?? ''
  }
}
