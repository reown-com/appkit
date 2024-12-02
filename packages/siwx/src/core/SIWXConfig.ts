import type {
  SIWXConfig as SIWXConfigInterface,
  SIWXMessage,
  SIWXSession
} from '@reown/appkit-core'
import type { SIWXMessenger } from './SIWXMessenger.js'
import type { SIWXVerifier } from './SIWXVerifier.js'
import type { SIWXStorage } from './SIWXStorage.js'
import type { CaipNetworkId } from '@reown/appkit-common'

export abstract class SIWXConfig implements SIWXConfigInterface {
  private messenger: SIWXMessenger
  private verifiers: SIWXVerifier[]
  private storage: SIWXStorage

  constructor(params: SIWXConfig.ConstructorParams) {
    this.messenger = params.messenger
    this.verifiers = params.verifiers
    this.storage = params.storage
  }

  public createMessage(input: SIWXMessage.Input): Promise<SIWXMessage> {
    return this.messenger.createMessage(input)
  }

  public async addSession(session: SIWXSession): Promise<void> {
    const isValid = await this.verifySession(session)
    if (!isValid) {
      throw new Error('The signature is not valid')
    }

    return this.storage.add(session)
  }

  public async setSessions(sessions: SIWXSession[]): Promise<void> {
    const verifications = await Promise.all(sessions.map(session => this.verifySession(session)))

    const invalidSession = sessions.find((_, index) => !verifications[index])
    if (invalidSession) {
      throw new Error('The signature is not valid', { cause: invalidSession })
    }

    return this.storage.set(sessions)
  }

  public async getSessions(chainId: CaipNetworkId, address: string): Promise<SIWXSession[]> {
    return this.storage.get(chainId, address)
  }

  public async revokeSession(chainId: CaipNetworkId, address: string): Promise<void> {
    return this.storage.delete(chainId, address)
  }

  protected async verifySession(session: SIWXSession): Promise<boolean> {
    const chainVerifiers = this.verifiers.filter(verifier => verifier.shouldVerify(session))
    const verifications = await Promise.all(
      chainVerifiers.map(verifier => verifier.verify(session))
    )

    return verifications.length > 0 && verifications.every(result => result)
  }
}

export namespace SIWXConfig {
  export type ConstructorParams = {
    messenger: SIWXMessenger
    verifiers: SIWXVerifier[]
    storage: SIWXStorage
  }
}
