import type { ChainNamespace } from '@reown/appkit-common'
import type { SIWXSession } from '@reown/appkit-core'

export abstract class SIWXVerifier {
  public abstract readonly chainNamespace: ChainNamespace

  public shouldVerify(session: SIWXSession): boolean {
    return session.data.chainId.startsWith(this.chainNamespace)
  }

  abstract verify(session: SIWXSession): Promise<boolean>
}

export namespace SIWXVerifier {
  export type ConstructorParams = {
    chainNamespace: ChainNamespace
  }
}
