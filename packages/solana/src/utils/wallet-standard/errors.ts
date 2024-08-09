export class StandardWalletFeatureNotSupportedError extends Error {
  constructor(feature: string) {
    super(`The wallet does not support the "${feature}" feature`)
  }
}
