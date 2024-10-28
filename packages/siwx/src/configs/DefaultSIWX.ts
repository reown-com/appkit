import { SIWXConfig } from '../core/SIWXConfig.js'
import { InformalMessenger } from '../messengers/index.js'
import { LocalStorage } from '../storages/index.js'
import { EIP155Verifier } from '../verifiers/index.js'

const DEFAULTS = {
  getDefaultMessenger: () =>
    new InformalMessenger({
      domain: 'localhost',
      getNonce: async () => Promise.resolve(Math.round(Math.random() * 10000).toString()),
      uri: 'http://localhost:3000'
    }),

  getDefaultVerifiers: () => [new EIP155Verifier()],

  getDefaultStorage: () => new LocalStorage({ key: 'siwx-sessions' })
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
