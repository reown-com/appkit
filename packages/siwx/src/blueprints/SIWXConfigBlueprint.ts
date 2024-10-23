import type { SIWXConfig, SIWXMessage, SIWXMessageInput, SIWXSession } from '@reown/appkit-core'
import type { SIWXMessageBlueprint } from './SIWXMessageBlueprint.js'
import type { SIWXVerifierBlueprint } from './SIWXVerifierBlueprint.js'
import type { SIWXStorageBlueprint } from './SIWXStorageBlueprint.js'
import type { CaipNetworkId } from '@reown/appkit-common'

export abstract class SIWXConfigBlueprint implements SIWXConfig {
  private messenger: SIWXMessageBlueprint
  private verifiers: SIWXVerifierBlueprint[]
  private storage: SIWXStorageBlueprint

  constructor(params: SIWXConfigBlueprint.BlueprintParams) {
    this.messenger = params.messenger
    this.verifiers = params.verifiers
    this.storage = params.storage
  }

  public createMessage(input: SIWXMessageInput): Promise<SIWXMessage> {
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

  public async getSessions(chainId: CaipNetworkId): Promise<SIWXSession[]> {
    return this.storage.get(chainId)
  }

  public async revokeSession(chainId: string, address: string): Promise<void> {
    return this.storage.delete(chainId, address)
  }

  protected async verifySession(session: SIWXSession): Promise<boolean> {
    const chainVerifiers = this.verifiers.filter(verifier => verifier.shouldVerify(session))
    const verifications = await Promise.all(
      chainVerifiers.map(verifier => verifier.verify(session))
    )

    return verifications.every(result => result)
  }
}

export namespace SIWXConfigBlueprint {
  export type BlueprintParams = {
    messenger: SIWXMessageBlueprint
    verifiers: SIWXVerifierBlueprint[]
    storage: SIWXStorageBlueprint
  }
}
