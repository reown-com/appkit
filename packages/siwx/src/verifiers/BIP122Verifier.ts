import type { SIWXSession } from '@reown/appkit-core'
import { SIWXVerifier } from '../core/SIWXVerifier.js'
import { ConstantsUtil } from '@reown/appkit-common'

import { Verifier } from 'bip322-js'

export class BIP122Verifier extends SIWXVerifier {
  public readonly chainNamespace = ConstantsUtil.CHAIN.BITCOIN

  public async verify(session: SIWXSession): Promise<boolean> {
    try {
      return Promise.resolve(
        Verifier.verifySignature(session.data.accountAddress, session.message, session.signature)
      )
    } catch (error) {
      return false
    }
  }
}
