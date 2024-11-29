import { SIWXConfig } from '../core/SIWXConfig.js'
import { InformalMessenger } from '../messengers/index.js'
import { LocalStorage } from '../storages/index.js'
import { BIP122Verifier } from '../verifiers/BIP122Verifier.js'
import { EIP155Verifier, SolanaVerifier } from '../verifiers/index.js'

const DEFAULTS = {
  getDefaultMessenger: () =>
    new InformalMessenger({
      domain: typeof document === 'undefined' ? 'Unknown Domain' : document.location.host,
      uri: typeof document === 'undefined' ? 'Unknown URI' : document.location.href,
      getNonce: async () => Promise.resolve(Math.round(Math.random() * 10000).toString())
    }),

  getDefaultVerifiers: () => [new EIP155Verifier(), new SolanaVerifier(), new BIP122Verifier()],

  getDefaultStorage: () => new LocalStorage({ key: '@appkit/siwx' })
}

export class DefaultSIWX extends SIWXConfig {
  constructor(params: Partial<SIWXConfig.ConstructorParams> = {}) {
    super({
      messenger: params.messenger || DEFAULTS.getDefaultMessenger(),
      verifiers: params.verifiers || DEFAULTS.getDefaultVerifiers(),
      storage: params.storage || DEFAULTS.getDefaultStorage()
    })
  }
}
