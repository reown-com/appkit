/* eslint-disable max-classes-per-file */

export class WalletStandardFeatureNotSupportedError extends Error {
  constructor(feature: string) {
    super(`The wallet does not support the "${feature}" feature`)
  }
}

export class WalletConnectMethodNotSupportedError extends Error {
  constructor(method: string) {
    super(`The method "${method}" is not supported by the wallet`)
  }
}
