import type { CaipNetworkId, ChainNamespace } from '@reown/appkit-common'
import { OptionsController } from '../controllers/OptionsController.js'
import { CoreHelperUtil } from './CoreHelperUtil.js'
import { ChainController } from '../controllers/ChainController.js'
import { ConnectionController } from '../controllers/ConnectionController.js'
import { ModalController } from '../controllers/ModalController.js'
import { SnackController } from '../controllers/SnackController.js'
import { RouterController } from '../controllers/RouterController.js'
import UniversalProvider from '@walletconnect/universal-provider'
import { EventsController } from '../controllers/EventsController.js'
import { AccountController } from '../controllers/AccountController.js'
import { W3mFrameRpcConstants } from '@reown/appkit-wallet'
import { StorageUtil } from './StorageUtil.js'

/**
 * SIWXUtil holds the methods to interact with the SIWX plugin and must be called internally on AppKit.
 */
export const SIWXUtil = {
  getSIWX() {
    return OptionsController.state.siwx
  },
  async initializeIfEnabled() {
    const siwx = OptionsController.state.siwx
    const caipAddress = ChainController.getActiveCaipAddress()

    if (!(siwx && caipAddress)) {
      return
    }
    const [namespace, chainId, address] = caipAddress.split(':') as [ChainNamespace, string, string]

    if (!ChainController.checkIfSupportedNetwork(namespace)) {
      return
    }

    try {
      const sessions = await siwx.getSessions(`${namespace}:${chainId}`, address)

      if (sessions.length) {
        return
      }

      await ModalController.open({
        view: 'SIWXSignMessage'
      })
    } catch (error: unknown) {
      // eslint-disable-next-line no-console
      console.error('SIWXUtil:initializeIfEnabled', error)

      EventsController.sendEvent({
        type: 'track',
        event: 'SIWX_AUTH_ERROR',
        properties: this.getSIWXEventProperties()
      })

      // eslint-disable-next-line no-console
      await ConnectionController._getClient()?.disconnect().catch(console.error)
      RouterController.reset('Connect')
      SnackController.showError('A problem occurred while trying initialize authentication')
    }
  },
  async requestSignMessage() {
    const siwx = OptionsController.state.siwx
    const address = CoreHelperUtil.getPlainAddress(ChainController.getActiveCaipAddress())
    const network = ChainController.getActiveCaipNetwork()
    const client = ConnectionController._getClient()

    if (!siwx) {
      throw new Error('SIWX is not enabled')
    }

    if (!address) {
      throw new Error('No ActiveCaipAddress found')
    }

    if (!network) {
      throw new Error('No ActiveCaipNetwork or client found')
    }

    if (!client) {
      throw new Error('No ConnectionController client found')
    }

    try {
      const siwxMessage = await siwx.createMessage({
        chainId: network.caipNetworkId,
        accountAddress: address
      })

      const message = siwxMessage.toString()

      if (StorageUtil.getConnectedConnectorId() === 'ID_AUTH') {
        RouterController.pushTransactionStack({
          view: null,
          goBack: false,
          replace: true
        })
      }

      const signature = await client.signMessage(message)

      await siwx.addSession({
        data: siwxMessage,
        message,
        signature: signature as `0x${string}`
      })

      ModalController.close()

      EventsController.sendEvent({
        type: 'track',
        event: 'SIWX_AUTH_SUCCESS',
        properties: this.getSIWXEventProperties()
      })
    } catch (error) {
      const properties = this.getSIWXEventProperties()

      if (!ModalController.state.open || RouterController.state.view === 'ApproveTransaction') {
        await ModalController.open({
          view: 'SIWXSignMessage'
        })
      }

      if (properties.isSmartAccount) {
        SnackController.showError('This application might not support Smart Accounts')
      } else {
        SnackController.showError('Signature declined')
      }

      EventsController.sendEvent({
        type: 'track',
        event: 'SIWX_AUTH_ERROR',
        properties
      })

      // eslint-disable-next-line no-console
      console.error('SWIXUtil:requestSignMessage', error)
    }
  },
  async cancelSignMessage() {
    try {
      await ConnectionController.disconnect()
      RouterController.reset('Connect')
      EventsController.sendEvent({
        event: 'CLICK_CANCEL_SIWX',
        type: 'track',
        properties: this.getSIWXEventProperties()
      })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('SIWXUtil:cancelSignMessage', error)
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
        return (await this.getSessions()).length === 0
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

    if (!siwx || namespaces.size !== 1 || !namespaces.has('eip155')) {
      return false
    }

    // Ignores chainId and account address to get other message data
    const siwxMessage = await siwx.createMessage({
      chainId: ChainController.getActiveCaipNetwork()?.caipNetworkId || ('' as CaipNetworkId),
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
      chainId: siwxMessage.chainId,

      methods,
      chains
    })

    SnackController.showLoading('Authenticating...', { autoClose: false })

    if (result?.auths?.length) {
      const sessions = result.auths.map<SIWXSession>(cacao => {
        const message = universalProvider.client.formatAuthMessage({
          request: cacao.p,
          iss: cacao.p.iss
        })

        return {
          data: {
            ...cacao.p,
            accountAddress: cacao.p.iss.split(':').slice(-1).join(''),
            chainId: cacao.p.iss.split(':').slice(2, 4).join(':') as CaipNetworkId,
            uri: cacao.p.aud,
            version: cacao.p.version || siwxMessage.version,
            expirationTime: cacao.p.exp,
            issuedAt: cacao.p.iat,
            notBefore: cacao.p.nbf
          },
          message,
          signature: cacao.s.s,
          cacao
        }
      })

      try {
        await siwx.setSessions(sessions)

        EventsController.sendEvent({
          type: 'track',
          event: 'SIWX_AUTH_SUCCESS',
          properties: SIWXUtil.getSIWXEventProperties()
        })
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('SIWX:universalProviderAuth - failed to set sessions', error)

        EventsController.sendEvent({
          type: 'track',
          event: 'SIWX_AUTH_ERROR',
          properties: SIWXUtil.getSIWXEventProperties()
        })

        // eslint-disable-next-line no-console
        await universalProvider.disconnect().catch(console.error)
        throw error
      } finally {
        SnackController.hide()
      }
    }

    return true
  },
  getSIWXEventProperties() {
    return {
      network: ChainController.state.activeCaipNetwork?.caipNetworkId || '',
      isSmartAccount:
        AccountController.state.preferredAccountType ===
        W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
    }
  },
  async clearSessions() {
    const siwx = this.getSIWX()

    if (siwx) {
      await siwx.setSessions([])
    }
  }
}

/**
 * This interface represents the SIWX configuration plugin, which is used to create and manage SIWX messages and sessions.
 * AppKit provides predefined implementations for this interface through `@reown/appkit-siwx`.
 * You may use it to create a custom implementation following your needs, but watch close for the methods requirements.
 */
export interface SIWXConfig {
  /**
   * This method will be called to create a new message to be signed by the user.
   *
   * Constraints:
   * - The message MUST be unique and contain all the necessary information to verify the user's identity.
   * - SIWXMessage.toString() method MUST be implemented to return the message string.
   *
   * @param input SIWXMessage.Input
   * @returns SIWXMessage
   */
  createMessage: (input: SIWXMessage.Input) => Promise<SIWXMessage>

  /**
   * This method will be called to store a new single session.
   *
   * Constraints:
   * - This method MUST verify if the session is valid and store it in the storage successfully.
   *
   * @param session SIWXSession
   */
  addSession: (session: SIWXSession) => Promise<void>

  /**
   * This method will be called to revoke all the sessions stored for a specific chain and address.
   *
   * Constraints:
   * - This method MUST delete all the sessions stored for the specific chain and address successfully.
   *
   * @param chainId CaipNetworkId
   * @param address string
   */
  revokeSession: (chainId: CaipNetworkId, address: string) => Promise<void>

  /**
   * This method will be called to replace all the sessions in the storage with the new ones.
   *
   * Constraints:
   * - This method MUST verify all the sessions before storing them in the storage;
   * - This method MUST replace all the sessions in the storage with the new ones succesfully otherwise it MUST throw an error.
   *
   * @param sessions SIWXSession[]
   */
  setSessions: (sessions: SIWXSession[]) => Promise<void>

  /**
   * This method will be called to get all the sessions stored for a specific chain and address.
   *
   * Constraints:
   * - This method MUST return only sessions that are verified and valid;
   * - This method MUST NOT return expired sessions.
   *
   * @param chainId CaipNetworkId
   * @param address string
   * @returns
   */
  getSessions: (chainId: CaipNetworkId, address: string) => Promise<SIWXSession[]>
}

/**
 * This interface represents a SIWX session, which is used to store the user's identity information.
 */
export interface SIWXSession {
  data: SIWXMessage.Data
  message: string
  signature: string
  cacao?: Cacao
}

/**
 * This interface represents a SIWX message, which is used to create a message to be signed by the user.
 * This must contain the necessary information to verify the user's identity and how to generate the string message.
 */
export interface SIWXMessage extends SIWXMessage.Data, SIWXMessage.Methods {}

export namespace SIWXMessage {
  /**
   * This interface represents the SIWX message data, which is used to create a message to be signed by the user.
   */
  export interface Data extends Input, Metadata, Identifier {}

  /**
   * This interface represents the SIWX message input.
   * Here must contain what is different for each user of the application.
   */
  export interface Input {
    accountAddress: string
    chainId: CaipNetworkId
    notBefore?: Timestamp
  }

  /**
   * This interface represents the SIWX message metadata.
   * Here must contain the main data related to the app.
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
   * This interface represents the SIWX message identifier.
   * Here must contain the request id and the timestamps.
   */
  export interface Identifier {
    requestId?: string
    issuedAt?: Timestamp
    expirationTime?: Timestamp
  }

  /**
   * This interface represents the SIWX message methods.
   * Here must contain the method to generate the message string and any other method performed by the SIWX message.
   */
  export interface Methods {
    toString: () => string
  }

  /**
   * The timestamp is a UTC string representing the time in ISO 8601 format.
   */
  export type Timestamp = string
}

/**
 * The Cacao interface is a reference of CAIP-74 and represents a chain-agnostic Object Capability (OCAP).
 * https://chainagnostic.org/CAIPs/caip-74
 */
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
