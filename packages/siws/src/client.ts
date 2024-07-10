import type {
  SIWSCreateMessageArgs,
  SIWSVerifyMessageArgs,
  SIWSConfig,
  SIWSClientMethods,
  SIWSSession
} from '../core/utils/TypeUtils.js'
import type { SIWSControllerClient } from '../core/controller/SIWSController.js'

import { ConnectionController, RouterUtil, AccountController } from '@web3modal/core'

import { ConstantsUtil } from '../core/utils/ConstantsUtil.js'

// -- Client -------------------------------------------------------------------- //
export class Web3ModalSIWSClient {
  public options: SIWSControllerClient['options']

  public methods: SIWSClientMethods

  public constructor(siwsConfig: SIWSConfig) {
    const {
      enabled = true,
      nonceRefetchIntervalMs = ConstantsUtil.FIVE_MINUTES_IN_MS,
      sessionRefetchIntervalMs = ConstantsUtil.FIVE_MINUTES_IN_MS,
      signOutOnAccountChange = true,
      signOutOnDisconnect = true,
      signOutOnNetworkChange = true,
      ...siwsConfigMethods
    } = siwsConfig

    this.options = {
      // Default options
      enabled,
      nonceRefetchIntervalMs,
      sessionRefetchIntervalMs,
      signOutOnDisconnect,
      signOutOnAccountChange,
      signOutOnNetworkChange
    }

    this.methods = siwsConfigMethods
  }

  async getNonce(address?: string) {
    const nonce = await this.methods.getNonce(address)
    if (!nonce) {
      throw new Error('siwsControllerClient:getNonce - nonce is undefined')
    }

    return nonce
  }

  async getMessageParams() {
    const params = await this.methods.getMessageParams()

    return params || {}
  }

  createMessage(args: SIWSCreateMessageArgs) {
    const message = this.methods.createMessage(args)

    if (!message) {
      throw new Error('siwsControllerClient:createMessage - message is undefined')
    }

    return message
  }

  async verifyMessage(args: SIWSVerifyMessageArgs) {
    const isValid = await this.methods.verifyMessage(args)

    return isValid
  }

  async getSession() {
    const session = await this.methods.getSession()
    if (!session) {
      throw new Error('siwsControllerClient:getSession - session is undefined')
    }

    return session
  }

  async signIn(): Promise<SIWSSession> {
    const address = AccountController.state.address
    const nonce = await this.methods.getNonce(address)
    if (!address) {
      throw new Error('An address is required to create a SIWS message.')
    }
    const chainId = '4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z'
    // NetworkUtil.caipNetworkIdToNumber(NetworkController.state.caipNetwork?.id)

    if (!chainId) {
      throw new Error('A chainId is required to create a SIWS message.')
    }
    const messageParams = await this.getMessageParams()

    const message = this.methods.createMessage({
      address: `solana:${chainId}:${address}`,
      chainId,
      nonce,
      version: '1',
      iat: messageParams.iat || new Date().toISOString(),
      ...messageParams
    })

    // const type = StorageUtil.getConnectedConnector()
    // if (type === 'AUTH') {
    //   RouterController.pushTransactionStack({
    //     view: null,
    //     goBack: false,
    //     replace: true,
    //     onCancel() {
    //       RouterController.replace('ConnectingSiws')
    //     }
    //   })
    // }

    const signature = await ConnectionController.signMessage(message)
    const isValid = await this.methods.verifyMessage({ message, signature })
    if (!isValid) {
      throw new Error('Error verifying SIWS signature')
    }

    const session = await this.methods.getSession()
    if (!session) {
      throw new Error('Error verifying SIWS signature')
    }
    if (this.methods.onSignIn) {
      this.methods.onSignIn(session)
    }

    RouterUtil.navigateAfterNetworkSwitch()

    return session
  }

  async signOut() {
    this.methods.onSignOut?.()

    return this.methods.signOut()
  }
}
