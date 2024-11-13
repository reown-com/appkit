import { SIWXVerifier } from '../core/SIWXVerifier.js'
import type { SIWXSession } from '@reown/appkit-core'
import nacl from 'tweetnacl'
import bs58 from 'bs58'
import { ConstantsUtil } from '@reown/appkit-common'

export class SolanaVerifier extends SIWXVerifier {
  public readonly chainNamespace = ConstantsUtil.CHAIN.SOLANA

  public async verify(session: SIWXSession): Promise<boolean> {
    try {
      const publicKey = bs58.decode(session.data.accountAddress)
      const signature = bs58.decode(session.signature)
      const message = new TextEncoder().encode(session.message.toString())

      const isValid = nacl.sign.detached.verify(message, signature, publicKey)

      return Promise.resolve(isValid)
    } catch (error) {
      return Promise.resolve(false)
    }
  }
}
