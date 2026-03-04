/**
 * TRON address utility functions.
 * TRON addresses are Base58Check encoded, starting with 'T', and are 34 characters long.
 */
export const TronAddressUtil = {
  /**
   * Validates a TRON Base58Check address.
   * A valid TRON address starts with 'T' and is 34 characters long.
   */
  isValidAddress(address: string): boolean {
    if (!address || typeof address !== 'string') {
      return false
    }

    return /^T[1-9A-HJ-NP-Za-km-z]{33}$/u.test(address)
  }
}
