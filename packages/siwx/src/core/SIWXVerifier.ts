import type { ChainNamespace } from '@reown/appkit-common'
import type { SIWXSession } from '@reown/appkit-controllers'

/**
 * This is the base class for a SIWX verifier.
 */
export abstract class SIWXVerifier {
  /**
   * The chain namespace that this verifier should verify.
   */
  public abstract readonly chainNamespace: ChainNamespace

  /**
   * This method should return true if the verifier should verify the session.
   * By default it will check by the chain namespace, but you may override it for a specific requirement.
   *
   * @param session SIWXSession
   * @returns boolean
   */
  public shouldVerify(session: SIWXSession): boolean {
    return session.data.chainId.startsWith(this.chainNamespace)
  }

  /**
   * This method should verify the session.
   * You must implement this method with the verification logic.
   *
   * @param session SIWXSession
   * @returns Promise<boolean> - If `true` means the session is valid.
   */
  abstract verify(session: SIWXSession): Promise<boolean>
}
