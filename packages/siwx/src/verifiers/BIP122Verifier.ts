import { ConstantsUtil } from '@reown/appkit-common'
import type { SIWXSession } from '@reown/appkit-controllers'

import { SIWXVerifier } from '../core/SIWXVerifier.js'

/**
 * Default verifier for BIP122 sessions.
 * Note: This verifier uses bip322-js which requires Node.js Buffer polyfills in browser environments.
 */
export class BIP122Verifier extends SIWXVerifier {
  public readonly chainNamespace = ConstantsUtil.CHAIN.BITCOIN
  private verifierModule: typeof import('bip322-js') | null = null

  public async verify(session: SIWXSession): Promise<boolean> {
    try {
      // Lazy load bip322-js to allow tree-shaking in environments where it's not needed
      if (!this.verifierModule) {
        this.verifierModule = await import('bip322-js')
      }
      return Promise.resolve(
        this.verifierModule.Verifier.verifySignature(session.data.accountAddress, session.message, session.signature)
      )
    } catch (error) {
      void(error);
      return false
    }
  }
}