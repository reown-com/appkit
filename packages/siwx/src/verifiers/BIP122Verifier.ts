import type { SIWXSession } from '@reown/appkit-core'
import { SIWXVerifier } from '../core/SIWXVerifier.js'
import { ConstantsUtil } from '@reown/appkit-common'
import bitcoinMessage from 'bitcoinjs-message'

export class BIP122Verifier extends SIWXVerifier {
  public readonly chainNamespace = ConstantsUtil.CHAIN.BITCOIN

  public async verify(session: SIWXSession): Promise<boolean> {
    try {
      return Promise.resolve(
        bitcoinMessage.verify(session.message, session.data.accountAddress, session.signature)
      )
    } catch (error) {
      return false
    }
  }
}
