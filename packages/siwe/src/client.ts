import { type SIWEControllerClient } from '../core/controller/SIWEController.js'
import type {
  SIWEClientMethods,
  SIWEConfig,
  SIWECreateMessageArgs,
  SIWEMessageArgs,
  SIWESession,
  SIWEVerifyMessageArgs
} from '../core/utils/TypeUtils.js'

import { SIWXUtil } from '@reown/appkit-core'
import { ConstantsUtil } from '../core/utils/ConstantsUtil.js'

// -- Client -------------------------------------------------------------------- //
export class AppKitSIWEClient {
  public options: SIWEControllerClient['options']

  public methods: SIWEClientMethods

  public constructor(siweConfig: SIWEConfig) {
    const {
      enabled = true,
      nonceRefetchIntervalMs = ConstantsUtil.FIVE_MINUTES_IN_MS,
      sessionRefetchIntervalMs = ConstantsUtil.FIVE_MINUTES_IN_MS,
      signOutOnAccountChange = true,
      signOutOnDisconnect = true,
      signOutOnNetworkChange = true,
      ...siweConfigMethods
    } = siweConfig

    this.options = {
      // Default options
      enabled,
      nonceRefetchIntervalMs,
      sessionRefetchIntervalMs,
      signOutOnDisconnect,
      signOutOnAccountChange,
      signOutOnNetworkChange
    }

    this.methods = siweConfigMethods
  }

  async getNonce(address?: string) {
    const nonce = await this.methods.getNonce(address)
    if (!nonce) {
      throw new Error('siweControllerClient:getNonce - nonce is undefined')
    }

    return nonce
  }

  async getMessageParams?() {
    return ((await this.methods.getMessageParams?.()) || {}) as SIWEMessageArgs
  }

  createMessage(args: SIWECreateMessageArgs) {
    const message = this.methods.createMessage(args)

    if (!message) {
      throw new Error('siweControllerClient:createMessage - message is undefined')
    }

    return message
  }

  async verifyMessage(args: SIWEVerifyMessageArgs) {
    const isValid = await this.methods.verifyMessage(args)

    return isValid
  }

  async getSession() {
    const session = await this.methods.getSession()
    if (!session) {
      throw new Error('siweControllerClient:getSession - session is undefined')
    }

    return session
  }

  async signIn(): Promise<SIWESession> {
    await SIWXUtil.requestSignMessage()
    const session = await this.methods.getSession()

    if (!session) {
      throw new Error('Error verifying SIWE signature')
    }

    return session
  }

  async signOut() {
    const siwx = SIWXUtil.getSIWX()

    if (!siwx) {
      return false
    }

    await siwx.setSessions([])

    return true
  }
}
