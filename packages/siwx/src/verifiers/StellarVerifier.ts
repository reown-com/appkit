import nacl from 'tweetnacl'
import { sha256 } from 'viem'

import { ConstantsUtil, StellarStrKeyUtil } from '@reown/appkit-common'
import type { SIWXSession } from '@reown/appkit-controllers'

import { SIWXVerifier } from '../core/SIWXVerifier.js'

const SEP53_PREFIX = 'StellarMessage'

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }

  return bytes
}

/**
 * Default verifier for Stellar sessions.
 *
 * Stellar signs with Ed25519 like Solana, but wallets sign the SEP-53
 * domain-separated payload `sha256("StellarMessage" || 0x00 || message)` rather
 * than the message itself, and addresses are StrKey-encoded instead of base58.
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
      const prefix = new TextEncoder().encode(SEP53_PREFIX)

      const payload = new Uint8Array(prefix.length + 1 + message.length)
      payload.set(prefix, 0)
      payload[prefix.length] = 0
      payload.set(message, prefix.length + 1)

      const digest = sha256(payload, 'bytes')

      return Promise.resolve(nacl.sign.detached.verify(digest, signature, publicKey))
    } catch (error) {
      return Promise.resolve(false)
    }
  }
}
