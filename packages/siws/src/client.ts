import base58 from 'bs58'
import type {
  SIWSCreateMessageArgs,
  SIWSVerifyMessageArgs,
  SIWSConfig,
  SIWSClientMethods,
  SIWSSession,
  SIWSMessageArgs
} from '../core/utils/TypeUtils.js'
import type { SIWSControllerClient } from '../core/controller/SIWSController.js'

import { RouterUtil, NetworkController, StorageUtil, RouterController } from '@web3modal/core'
import type { ExtendedBaseWalletAdapter } from '@web3modal/solana'
import { ConstantsUtil } from '../core/utils/ConstantsUtil.js'
import { formatChainId } from '../core/utils/formatChainId.js'

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

  async signIn(adapter: ExtendedBaseWalletAdapter): Promise<SIWSSession> {
    const nonce = await this.methods.getNonce()
    const rawChainId = NetworkController.state.caipNetwork?.name
    const chainId = formatChainId(rawChainId)

    if (!chainId) {
      throw new Error('A chainId is required to create a SIWS message.')
    }

    const messageParams: SIWSMessageArgs = await this.getMessageParams()

    const dataMsg = {
      chainId,
      nonce,
      version: '1',
      typeSiwx: 'Solana',
      issuedAt: messageParams.iat || new Date().toISOString(),
      ...messageParams
    }

    const { signature, account } = await adapter.signIn(dataMsg)

    if (!account || !account.address) {
      throw new Error('An address is required to create a SIWS message.')
    }

    const message = this.methods.createMessage({ address: account.address, ...dataMsg })

    const type = StorageUtil.getConnectedConnector()
    if (type === 'AUTH') {
      RouterController.pushTransactionStack({
        view: null,
        goBack: false,
        replace: true,
        onCancel() {
          RouterController.replace('ConnectingSiws')
        }
      })
    }

    const isValid = await this.methods.verifyMessage({
      message,
      signature: base58.encode(signature)
    })

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
