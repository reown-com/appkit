import nacl from 'tweetnacl'
import { sha256 } from 'viem'

import { ConstantsUtil, StellarStrKeyUtil } from '@reown/appkit-common'
import type { SIWXSession } from '@reown/appkit-controllers'

import { SIWXVerifier } from '../core/SIWXVerifier.js'

const SEP53_PREFIX = 'Stellar Signed Message:\n'
const LEGACY_PREFIX = 'StellarMessage'

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }

  return bytes
}

function concatBytes(...parts: Uint8Array[]): Uint8Array {
  const result = new Uint8Array(parts.reduce((length, part) => length + part.length, 0))
  let offset = 0

  for (const part of parts) {
    result.set(part, offset)
    offset += part.length
  }

  return result
}

function buildSep53Payload(message: Uint8Array): Uint8Array {
  return concatBytes(new TextEncoder().encode(SEP53_PREFIX), message)
}

// Kept for wallets built before SEP-53 was adopted, which separate the prefix with a 0x00 byte
function buildLegacyPayload(message: Uint8Array): Uint8Array {
  return concatBytes(new TextEncoder().encode(LEGACY_PREFIX), Uint8Array.of(0), message)
}

/**
 * Default verifier for Stellar sessions.
 *
 * Stellar signs with Ed25519 like Solana, but wallets sign the SEP-53
 * domain-separated payload `sha256("Stellar Signed Message:\n" || message)`
 * rather than the message itself, and addresses are StrKey-encoded instead of
 * base58. The earlier `sha256("StellarMessage" || 0x00 || message)` payload is
 * still accepted.
 */
export class StellarVerifier extends SIWXVerifier {
  public readonly chainNamespace = ConstantsUtil.CHAIN.STELLAR

  public async verify(session: SIWXSession): Promise<boolean> {
    try {
      const publicKey = StellarStrKeyUtil.decodeEd25519PublicKey(session.data.accountAddress)

      if (!publicKey) {
        return Promise.resolve(false)
      }

      const signature = base64ToBytes(session.signature)
      const message = new TextEncoder().encode(session.message.toString())

      const isValid = [buildSep53Payload(message), buildLegacyPayload(message)].some(payload =>
        nacl.sign.detached.verify(sha256(payload, 'bytes'), signature, publicKey)
      )

      return Promise.resolve(isValid)
    } catch (error) {
      return Promise.resolve(false)
    }
  }
}
