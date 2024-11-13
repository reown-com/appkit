import type { CaipNetworkId } from '@reown/appkit-common'
import { OptionsController } from '../controllers/OptionsController.js'
import { CoreHelperUtil } from './CoreHelperUtil.js'
import { ChainController } from '../controllers/ChainController.js'
import { ConnectionController } from '../controllers/ConnectionController.js'
import { ModalController } from '../controllers/ModalController.js'
import { StorageUtil } from './StorageUtil.js'
import { SnackController } from '../controllers/SnackController.js'
import { RouterController } from '../controllers/RouterController.js'

export const SIWXUtil = {
  getSIWX() {
    return OptionsController.state.siwx
  },
  async initializeIfEnabled() {
    const siwx = OptionsController.state.siwx
    const address = CoreHelperUtil.getPlainAddress(ChainController.getActiveCaipAddress())
    const network = ChainController.getActiveCaipNetwork()

    if (!(siwx && address && network)) {
      return
    }

    const client = ConnectionController._getClient()

    try {
      const sessions = await siwx.getSessions(network.caipNetworkId, address)
      if (sessions.length) {
        return
      }

      await ModalController.open({
        view:
          StorageUtil.getConnectedConnector() === 'ID_AUTH'
            ? 'ApproveTransaction'
            : 'SIWXSignMessage'
      })

      const siwxMessage = await siwx.createMessage({
        chainId: network.caipNetworkId,
        accountAddress: address
      })

      const message = siwxMessage.toString()

      const signature = await client?.signMessage(message)

      await siwx.addSession({
        data: siwxMessage,
        message,
        signature: signature as `0x${string}`
      })

      ModalController.close()
    } catch (error: unknown) {
      // eslint-disable-next-line no-console
      console.error('Failed to initialize SIWX', error)
      await client?.disconnect()
      await ModalController.open({ view: 'Connect' })
      SnackController.showError('It was not possible to verify the message signature')
    }
  },
  async getSessions() {
    const siwx = OptionsController.state.siwx
    const address = CoreHelperUtil.getPlainAddress(ChainController.getActiveCaipAddress())
    const network = ChainController.getActiveCaipNetwork()

    if (!(siwx && address && network)) {
      return []
    }

    return siwx.getSessions(network.caipNetworkId, address)
  },
  async isSIWXCloseDisabled() {
    const siwx = this.getSIWX()

    if (siwx) {
      const isApproveSignScreen = RouterController.state.view === 'ApproveTransaction'
      const isSiwxSignMessage = RouterController.state.view === 'SIWXSignMessage'

      if (isApproveSignScreen || isSiwxSignMessage) {
        return (await this.getSessions()).length > 1
      }
    }

    return false
  }
}

/**
 * @experimental - This is an experimental feature and it is not production ready
 */
export interface SIWXConfig {
  createMessage: (input: SIWXMessage.Input) => Promise<SIWXMessage>
  addSession: (session: SIWXSession) => Promise<void>
  revokeSession: (chainId: CaipNetworkId, address: string) => Promise<void>
  setSessions: (sessions: SIWXSession[]) => Promise<void>
  getSessions: (chainId: CaipNetworkId, address: string) => Promise<SIWXSession[]>
}

/**
 * @experimental - This is an experimental feature and it is not production ready
 */
export interface SIWXSession {
  data: SIWXMessage.Data
  message: string
  signature: string
  cacao?: Cacao
}

/**
 * @experimental - This is an experimental feature and it is not production ready
 */
export interface SIWXMessage extends SIWXMessage.Data, SIWXMessage.Methods {}

export namespace SIWXMessage {
  /**
   * @experimental - This is an experimental feature and it is not production ready
   */
  export interface Data extends Input, Metadata, Identifier {}

  /**
   * @experimental - This is an experimental feature and it is not production ready
   */
  export interface Input {
    accountAddress: string
    chainId: string
    notBefore?: Timestamp
  }

  /**
   * @experimental - This is an experimental feature and it is not production ready
   */
  export interface Metadata {
    domain: string
    uri: string
    version: string
    nonce: string
    statement?: string
    resources?: string[]
  }

  /**
   * @experimental - This is an experimental feature and it is not production ready
   */
  export interface Identifier {
    requestId?: string
    issuedAt?: Timestamp
    expirationTime?: Timestamp
  }

  /**
   * @experimental - This is an experimental feature and it is not production ready
   */
  export interface Methods {
    toString: () => string
  }

  /**
   * @experimental - This is an experimental feature and it is not production ready
   */
  export type Timestamp = string
}

export interface Cacao {
  h: Cacao.Header
  p: Cacao.Payload
  s: {
    t: 'eip191' | 'eip1271'
    s: string
    m?: string
  }
}

export namespace Cacao {
  export interface Header {
    t: 'caip122'
  }

  export interface Payload {
    domain: string
    aud: string
    nonce: string
    iss: string
    version?: string
    iat?: string
    nbf?: string
    exp?: string
    statement?: string
    requestId?: string
    resources?: string[]
    type?: string
  }
}
