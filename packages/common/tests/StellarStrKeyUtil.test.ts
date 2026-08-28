import { describe, expect, it } from 'vitest'

import { StellarStrKeyUtil } from '../src/utils/StellarStrKeyUtil.js'

const VALID_ADDRESS = 'GB43KVROR7TFJ6KAPCYRF2FJROTZAH4FHLTJLPWX4DRZCC5NASLGITR6'

describe('StellarStrKeyUtil', () => {
  it('decodes a valid address to its 32-byte Ed25519 key', () => {
    const publicKey = StellarStrKeyUtil.decodeEd25519PublicKey(VALID_ADDRESS)

    expect(publicKey).toBeInstanceOf(Uint8Array)
    expect(publicKey).toHaveLength(32)
  })

  it('accepts a valid address', () => {
    expect(StellarStrKeyUtil.isValidEd25519PublicKey(VALID_ADDRESS)).toBe(true)
  })

  it('rejects an address whose checksum does not match', () => {
    // Flip the last character, leaving length and alphabet intact
    const corrupted = `${VALID_ADDRESS.slice(0, -1)}${VALID_ADDRESS.endsWith('A') ? 'B' : 'A'}`

    expect(StellarStrKeyUtil.isValidEd25519PublicKey(corrupted)).toBe(false)
  })

  it('rejects a muxed account address', () => {
    // Well-formed `M...` StrKey -- 69 chars, so not a plain account address
    const muxed = 'MAAQEAYEAUDAOCAJBIFQYDIOB4IBCEQTCQKRMFYYDENBWHA5DYPSAAAAAAAAAAAAAENNK'

    expect(StellarStrKeyUtil.isValidEd25519PublicKey(muxed)).toBe(false)
  })

  it('rejects wrong-length and non-base32 input', () => {
    expect(StellarStrKeyUtil.isValidEd25519PublicKey('')).toBe(false)
    expect(StellarStrKeyUtil.isValidEd25519PublicKey('GABC')).toBe(false)
    expect(StellarStrKeyUtil.isValidEd25519PublicKey(`${VALID_ADDRESS}A`)).toBe(false)
    // '1' and '8' are not in the base32 alphabet
    expect(StellarStrKeyUtil.isValidEd25519PublicKey(`${VALID_ADDRESS.slice(0, -1)}1`)).toBe(false)
  })

  it('rejects a secret seed for the same key', () => {
    /*
     * Same length and a valid checksum -- only the version byte differs, so this
     * is what proves the version byte is actually checked.
     */
    const secret = 'SAAQEAYEAUDAOCAJBIFQYDIOB4IBCEQTCQKRMFYYDENBWHA5DYPSBF5K'

    expect(secret).toHaveLength(56)
    expect(StellarStrKeyUtil.isValidEd25519PublicKey(secret)).toBe(false)
  })
})
