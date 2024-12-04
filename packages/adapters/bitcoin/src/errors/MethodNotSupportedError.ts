export class MethodNotSupportedError extends Error {
  override name = 'MethodNotSupported'
  readonly method: string
  readonly walletId: string

  constructor(walletId: string, method: string, log?: string) {
    super(`Wallet call is not supported`)
    this.method = method
    this.walletId = walletId

    // eslint-disable-next-line no-console
    console.error(
      `BitcoinAdapter:MethodNotSupportedError:${walletId} - The connected wallet doesn't support the method "${method}".${
        log ? ` ${log}` : ''
      }`
    )
  }
}
