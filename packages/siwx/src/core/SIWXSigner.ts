export abstract class SIWXSigner {
  public abstract signMessage(message: string, chainId?: string): Promise<string>
}
