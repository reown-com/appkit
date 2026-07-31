import type { SignMessageContext } from '@reown/appkit-controllers'

export abstract class SIWXSigner {
  public abstract signMessage(message: string, context?: SignMessageContext): Promise<string>
}
