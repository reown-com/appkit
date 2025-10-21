import type { CaipNetworkId } from '@reown/appkit-common'
import type {
  SIWXConfig as SIWXConfigInterface,
  SIWXMessage,
  SIWXSession
} from '@reown/appkit-controllers'

import DefaultSigner from '../signers/DefaultSigner.js'
import type { SIWXMessenger } from './SIWXMessenger.js'
import type { SIWXSigner } from './SIWXSigner.js'
import type { SIWXStorage } from './SIWXStorage.js'
import type { SIWXVerifier } from './SIWXVerifier.js'

/**
 * This is the base class for a SIWX config.
 * You may extend this class to create your own configuration replacing the default logic.
 */
export abstract class SIWXConfig implements SIWXConfigInterface {
  private messenger: SIWXMessenger
  private verifiers: SIWXVerifier[]
  private storage: SIWXStorage
  public signer: SIWXSigner

  public required: boolean

  constructor(params: SIWXConfig.ConstructorParams) {
    this.messenger = params.messenger
    this.verifiers = params.verifiers
    this.storage = params.storage
    this.required = params.required ?? true
    this.signer = params.signer || new DefaultSigner()
  }

  /**
   * Uses the messenger to create a message.
   *
   * @param input SIWXMessage.Input
   * @returns Promise<SIWXMessage>
   */
  public createMessage(input: SIWXMessage.Input): Promise<SIWXMessage> {
    return this.messenger.createMessage(input)
  }

  /**
   * Combine the verifiers to verify the session and storage to store it.
   * It will throw an error if the session is not valid.
   *
   * @param session SIWXSession
   * @returns Promise<void>
   */
  public async addSession(session: SIWXSession): Promise<void> {
    const isValid = await this.verifySession(session)
    if (!isValid) {
      throw new Error('The signature is not valid')
    }

    return this.storage.add(session)
  }

  /**
   * Combine the verifiers to verify the sessions and storage to store all of them.
   * It will throw an error if any of the sessions is not valid.
   *
   * @param chainId CaipNetworkId
   * @param address string
   * @returns Promise<SIWXSession[]>
   */
  public async setSessions(sessions: SIWXSession[]): Promise<void> {
    const verifications = await Promise.all(sessions.map(session => this.verifySession(session)))

    const invalidSession = sessions.find((_, index) => !verifications[index])
    if (invalidSession) {
      throw new Error('The signature is not valid', { cause: invalidSession })
    }

    return this.storage.set(sessions)
  }

  /**
   * Get the sessions from the storage and verify them.
   * If the session is not valid, it will be removed from the storage.
   *
   * @param chainId CaipNetworkId
   * @param address string
   * @returns Promise<SIWXSession[]>
   */
  public async getSessions(chainId: CaipNetworkId, address: string): Promise<SIWXSession[]> {
    const sessions = await this.storage.get(chainId, address)
    const verifications = await Promise.all(
      sessions.map(async session => {
        if (await this.verifySession(session)) {
          return true
        }

        await this.storage.delete(session.data.chainId, session.data.accountAddress)

        return false
      })
    )

    return sessions.filter((_, index) => verifications[index])
  }

  /**
   * Remove the session from the storage.
   *
   * @param chainId CaipNetworkId
   * @param address string
   * @returns Promise<void>
   */
  public async revokeSession(chainId: CaipNetworkId, address: string): Promise<void> {
    return this.storage.delete(chainId, address)
  }

  /**
   * This method should verify the session.
   * It will first check if the verifier should verify the session and then call the verify method.
   * It will return `true` if the session is valid for all verifications and there is at least one verification.
   *
   * @param session SIWXSession
   * @returns Promise<boolean> - If `true` means the session is valid.
   */
  protected async verifySession(session: SIWXSession): Promise<boolean> {
    const chainVerifiers = this.verifiers.filter(verifier => verifier.shouldVerify(session))
    const verifications = await Promise.all(
      chainVerifiers.map(verifier => verifier.verify(session))
    )

    return verifications.length > 0 && verifications.every(result => result)
  }

  /**
   * This method determines whether the wallet stays connected when the user denies the signature request.
   *
   * @returns {boolean}
   */
  getRequired() {
    return this.required
  }

  public signMessage({
    message
  }: {
    message: string
    chainId: string
    accountAddress: string
  }): Promise<string> {
    return this.signer.signMessage(message)
  }
}

export namespace SIWXConfig {
  export type ConstructorParams = {
    /**
     * The messenger to create the messages.
     */
    messenger: SIWXMessenger

    /**
     * The verifiers to verify the sessions.
     */
    verifiers: SIWXVerifier[]

    /**
     * The storage to store the sessions.
     */
    storage: SIWXStorage

    /**
     * If false the wallet stays connected when user denies the signature request.
     * @default true
     */
    required?: boolean

    /**
     * The signer handler to sign the message. If not provided, a signature request will be made to the wallet.
     */
    signer?: SIWXSigner
  }
}
