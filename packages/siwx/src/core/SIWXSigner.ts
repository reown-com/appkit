export abstract class SIWXSigner {
  public abstract signMessage(message: string): Promise<string>
}
