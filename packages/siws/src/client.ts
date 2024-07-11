import type {
  SIWSCreateMessageArgs,
  SIWSVerifyMessageArgs,
  SIWSConfig,
  SIWSClientMethods,
  SIWSSession
} from '../core/utils/TypeUtils.js'
import type { SIWSControllerClient } from '../core/controller/SIWSController.js'
import { PublicKey } from '@solana/web3.js'

import {
  ConnectionController,
  RouterUtil,
  AccountController,
  NetworkController,
  StorageUtil,
  RouterController,
  SigninMessageCustom
} from '@web3modal/core'

import { ConstantsUtil } from '../core/utils/ConstantsUtil.js'
import base58 from 'bs58'

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
    const nonce = await this.methods.getNonce()

    if (!address) {
      throw new Error('An address is required to create a SIWS message.')
    }
    const chainId = NetworkController.state.caipNetwork?.id

    if (!chainId) {
      throw new Error('A chainId is required to create a SIWS message.')
    }

    const { domain, statement } = await this.getMessageParams()
    // console.log('_messageParams_', messageParams)

    // const message = this.methods.createMessage({
    //   address,
    //   chainId,
    //   nonce,
    //   version: '1',
    //   typeSiwx: 'Solana',
    //   iat: messageParams.iat || new Date().toISOString(),
    //   ...messageParams
    // })

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

    const publicKey = new PublicKey(address)

    console.log('_nonce_', nonce)
    console.log('_pubkey_', publicKey?.toBase58(), domain)

    const message = new SigninMessageCustom({
      domain,
      statement: `Sign this message to sign in to the app.`,
      nonce: nonce,
      publicKey: publicKey?.toBase58()
      // domain: window.location.host,
      // publicKey: wallet.publicKey?.toBase58(),
      // statement: `Sign this message to sign in to the app.`,
      // nonce: csrf
    })

    // const data = new TextEncoder().encode(message.prepare())
    // const signature = await wallet.signMessage(data)

    const signature = await ConnectionController.signMessage(message.prepare())
    // const serializedSignature = base58.encode(signature)

    const isValid = await this.methods.verifyMessage({
      message: JSON.stringify(message),
      signature
    })
    //

    // const signature = await ConnectionController.signMessage(message)
    // const isValid = await this.methods.verifyMessage({ message, signature })

    console.log('_isValid_', isValid)

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
