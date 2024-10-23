import type { ChainNamespace } from '@reown/appkit-common'
import type { SIWXSession } from '@reown/appkit-core'

export abstract class SIWXVerifier {
  public abstract readonly chainNamespace: ChainNamespace
  public abstract readonly messageVersion: string

  public shouldVerify(session: SIWXSession): boolean {
    return (
      session.message.version === this.messageVersion &&
      session.message.chainId.startsWith(this.chainNamespace)
    )
  }

  abstract verify(session: SIWXSession): Promise<boolean>
}

export namespace SIWXVerifier {
  export type ConstructorParams = {
    chainNamespace: ChainNamespace
  }
}
