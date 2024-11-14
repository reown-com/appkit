import type { CaipNetworkId } from '@reown/appkit-common'
import { OptionsController } from '../controllers/OptionsController.js'
import { CoreHelperUtil } from './CoreHelperUtil.js'
import { ChainController } from '../controllers/ChainController.js'
import { ConnectionController } from '../controllers/ConnectionController.js'
import { ModalController } from '../controllers/ModalController.js'
import { StorageUtil } from './StorageUtil.js'
import { SnackController } from '../controllers/SnackController.js'
import { RouterController } from '../controllers/RouterController.js'
import UniversalProvider from '@walletconnect/universal-provider'

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
      // eslint-disable-next-line no-console
      await client?.disconnect().catch(console.error)
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
  },
  async universalProviderAuthenticate({
    universalProvider,
    chains,
    methods
  }: {
    universalProvider: UniversalProvider
    chains: CaipNetworkId[]
    methods: string[]
  }) {
    const siwx = SIWXUtil.getSIWX()

    const namespaces = new Set(chains.map(chain => chain.split(':')[0]))

    if (!siwx || namespaces.size !== 1) {
      return false
    }

    // Ignores chainId and account address to get other message data
    const siwxMessage = await siwx.createMessage({
      chainId: '',
      accountAddress: ''
    })

    const result = await universalProvider.authenticate({
      nonce: siwxMessage.nonce,
      domain: siwxMessage.domain,
      uri: siwxMessage.uri,
      exp: siwxMessage.expirationTime,
      iat: siwxMessage.issuedAt,
      nbf: siwxMessage.notBefore,
      requestId: siwxMessage.requestId,
      version: siwxMessage.version,
      resources: siwxMessage.resources,
      statement: siwxMessage.statement,

      methods,
      chains
    })

    if (result?.auths?.length) {
      const sessions = result.auths.map<SIWXSession>(cacao => {
        const message = universalProvider.client.formatAuthMessage({
          request: cacao.p,
          iss: cacao.p.iss
        })

        return {
          data: {
            accountAddress: cacao.p.iss.split(':').slice(-1).join(''),
            chainId: cacao.p.iss.split(':').slice(2, 4).join(':'),
            uri: cacao.p.aud,
            domain: cacao.p.domain,
            nonce: cacao.p.nonce,
            version: cacao.p.version || siwxMessage.version,
            expirationTime: cacao.p.exp,
            statement: cacao.p.statement,
            issuedAt: cacao.p.iat,
            notBefore: cacao.p.nbf,
            requestId: cacao.p.requestId,
            resources: cacao.p.resources
          },
          message,
          signature: cacao.s.s,
          cacao
        }
      })

      try {
        await siwx.setSessions(sessions)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('SIWX:universalProviderAuth - failed to set sessions', error)
        // eslint-disable-next-line no-console
        await universalProvider.disconnect().catch(console.error)
        throw error
      }
    }

    return true
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
