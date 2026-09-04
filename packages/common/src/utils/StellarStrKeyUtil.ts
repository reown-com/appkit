/**
 * Stellar StrKey decoding.
 *
 * A Stellar account address is the base32 (RFC 4648, unpadded) encoding of:
 *   version byte (1) || Ed25519 public key (32) || CRC16-XModem checksum (2, little endian)
 *
 * Kept dependency-free and in `common` so both the Stellar adapter and the SIWX
 * verifier can use it without either importing the other.
 */
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
// 6 << 3 -- the version byte that makes an address render as `G...`
const VERSION_BYTE_ED25519_PUBLIC_KEY = 0x30
const PUBLIC_KEY_LENGTH = 32
const CHECKSUM_LENGTH = 2
const DECODED_LENGTH = 1 + PUBLIC_KEY_LENGTH + CHECKSUM_LENGTH
const ENCODED_LENGTH = 56

function base32Decode(input: string): Uint8Array | undefined {
  const output = new Uint8Array(Math.floor((input.length * 5) / 8))
  let bits = 0
  let value = 0
  let index = 0

  for (const char of input) {
    const charIndex = BASE32_ALPHABET.indexOf(char)

    if (charIndex === -1) {
      return undefined
    }

    value = (value << 5) | charIndex
    bits += 5

    if (bits >= 8) {
      output[index] = (value >>> (bits - 8)) & 0xff
      index += 1
      bits -= 8
    }
  }

  return output.subarray(0, index)
}

/**
 * CRC16-XModem (polynomial 0x1021, zero initial value), as used by StrKey.
 */
function crc16xmodem(bytes: Uint8Array): number {
  let crc = 0

  for (const byte of bytes) {
    let code = (crc >>> 8) & 0xff

    code ^= byte & 0xff
    code ^= code >>> 4
    crc = (crc << 8) & 0xffff
    crc ^= code
    code = (code << 5) & 0xffff
    crc ^= code
    code = (code << 7) & 0xffff
    crc ^= code
  }

  return crc & 0xffff
}

export const StellarStrKeyUtil = {
  /**
   * Decodes a `G...` address into its raw 32-byte Ed25519 public key.
   * Returns `undefined` when the address is malformed, has the wrong version
   * byte, or fails its checksum.
   */
  decodeEd25519PublicKey(address: string): Uint8Array | undefined {
    if (typeof address !== 'string' || address.length !== ENCODED_LENGTH) {
      return undefined
    }

    const decoded = base32Decode(address)

    if (!decoded || decoded.length !== DECODED_LENGTH) {
      return undefined
    }

    if (decoded[0] !== VERSION_BYTE_ED25519_PUBLIC_KEY) {
      return undefined
    }

    const payload = decoded.subarray(0, DECODED_LENGTH - CHECKSUM_LENGTH)
    const expectedChecksum =
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      decoded[DECODED_LENGTH - 2]! | (decoded[DECODED_LENGTH - 1]! << 8)

    if (crc16xmodem(payload) !== expectedChecksum) {
      return undefined
    }

    return decoded.subarray(1, DECODED_LENGTH - CHECKSUM_LENGTH)
  },

  /**
   * Whether the given string is a well-formed Stellar account address.
   */
  isValidEd25519PublicKey(address: string): boolean {
    return this.decodeEd25519PublicKey(address) !== undefined
  }
}
