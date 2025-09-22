import UniversalProvider from '@walletconnect/universal-provider'

import type { CaipNetworkId, ChainNamespace } from '@reown/appkit-common'
import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import type { W3mFrameProvider } from '@reown/appkit-wallet'
import { W3mFrameRpcConstants } from '@reown/appkit-wallet/utils'

import { ChainController } from '../controllers/ChainController.js'
import { ConnectionController } from '../controllers/ConnectionController.js'
import { ConnectorController } from '../controllers/ConnectorController.js'
import { EventsController } from '../controllers/EventsController.js'
import { ModalController } from '../controllers/ModalController.js'
import { OptionsController } from '../controllers/OptionsController.js'
import { RouterController } from '../controllers/RouterController.js'
import { SnackController } from '../controllers/SnackController.js'
import { getActiveCaipNetwork, getPreferredAccountType } from './ChainControllerUtil.js'
import { CoreHelperUtil } from './CoreHelperUtil.js'

/**
 * SIWXUtil holds the methods to interact with the SIWX plugin and must be called internally on AppKit.
 */

let addEmbeddedWalletSessionPromise: Promise<void> | null = null

export const SIWXUtil = {
  getSIWX() {
    return OptionsController.state.siwx
  },

  async initializeIfEnabled(caipAddress = ChainController.getActiveCaipAddress()) {
    const siwx = OptionsController.state.siwx

    if (!(siwx && caipAddress)) {
      return
    }
    const [namespace, chainId, address] = caipAddress.split(':') as [ChainNamespace, string, string]

    if (!ChainController.checkIfSupportedNetwork(namespace, `${namespace}:${chainId}`)) {
      return
    }

    try {
      if (OptionsController.state.remoteFeatures?.emailCapture) {
        const user = ChainController.getAccountData(namespace)?.user

        await ModalController.open({
          view: 'DataCapture',
          data: {
            email: user?.email ?? undefined
          }
        })

        return
      }

      if (addEmbeddedWalletSessionPromise) {
        await addEmbeddedWalletSessionPromise
      }

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
        properties: this.getSIWXEventProperties(error)
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
    const network = getActiveCaipNetwork()
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
      const connectorId = ConnectorController.getConnectorId(network.chainNamespace)

      if (connectorId === CommonConstantsUtil.CONNECTOR_ID.AUTH) {
        RouterController.pushTransactionStack({})
      }

      const signature = await client.signMessage(message)

      await siwx.addSession({
        data: siwxMessage,
        message,
        signature
      })

      ChainController.setLastConnectedSIWECaipNetwork(network)

      ModalController.close()

      EventsController.sendEvent({
        type: 'track',
        event: 'SIWX_AUTH_SUCCESS',
        properties: this.getSIWXEventProperties()
      })
    } catch (error) {
      if (!ModalController.state.open || RouterController.state.view === 'ApproveTransaction') {
        await ModalController.open({
          view: 'SIWXSignMessage'
        })
      }

      SnackController.showError('Error signing message')
      EventsController.sendEvent({
        type: 'track',
        event: 'SIWX_AUTH_ERROR',
        properties: this.getSIWXEventProperties(error)
      })

      // eslint-disable-next-line no-console
      console.error('SWIXUtil:requestSignMessage', error)
    }
  },
  async cancelSignMessage() {
    try {
      const siwx = this.getSIWX()
      const isRequired = siwx?.getRequired?.()

      if (isRequired) {
        const lastNetwork = ChainController.getLastConnectedSIWECaipNetwork()
        if (lastNetwork) {
          const sessions = await siwx?.getSessions(
            lastNetwork?.caipNetworkId,
            CoreHelperUtil.getPlainAddress(ChainController.getActiveCaipAddress()) || ''
          )
          if (sessions && sessions.length > 0) {
            await ChainController.switchActiveNetwork(lastNetwork)
          } else {
            await ConnectionController.disconnect()
          }
        } else {
          await ConnectionController.disconnect()
        }
      } else {
        ModalController.close()
      }

      ModalController.close()

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
  async getAllSessions() {
    const siwx = this.getSIWX()
    const allRequestedCaipNetworks = ChainController.getAllRequestedCaipNetworks()
    const sessions = [] as SIWXSession[]
    await Promise.all(
      allRequestedCaipNetworks.map(async caipNetwork => {
        const session = await siwx?.getSessions(
          caipNetwork.caipNetworkId,
          CoreHelperUtil.getPlainAddress(ChainController.getActiveCaipAddress()) || ''
        )
        if (session) {
          sessions.push(...session)
        }
      })
    )

    return sessions
  },
  async getSessions(args?: { address?: string; caipNetworkId?: CaipNetworkId }) {
    const siwx = OptionsController.state.siwx
    let address = args?.address
    if (!address) {
      const activeCaipAddress = ChainController.getActiveCaipAddress()
      address = CoreHelperUtil.getPlainAddress(activeCaipAddress)
    }

    let network = args?.caipNetworkId
    if (!network) {
      const activeCaipNetwork = ChainController.getActiveCaipNetwork()
      network = activeCaipNetwork?.caipNetworkId
    }

    if (!(siwx && address && network)) {
      return []
    }

    return siwx.getSessions(network, address)
  },
  async isSIWXCloseDisabled() {
    const siwx = this.getSIWX()

    if (siwx) {
      const isApproveSignScreen = RouterController.state.view === 'ApproveTransaction'
      const isSiwxSignMessage = RouterController.state.view === 'SIWXSignMessage'

      if (isApproveSignScreen || isSiwxSignMessage) {
        return siwx.getRequired?.() && (await this.getSessions()).length === 0
      }
    }

    return false
  },
  async authConnectorAuthenticate({
    authConnector,
    chainId,
    socialUri,
    preferredAccountType,
    chainNamespace
  }: {
    authConnector: W3mFrameProvider
    chainId?: number | string
    socialUri?: string
    preferredAccountType?: string
    chainNamespace: ChainNamespace
  }) {
    const siwx = SIWXUtil.getSIWX()
    const network = getActiveCaipNetwork()

    if (
      !siwx ||
      !chainNamespace.includes(CommonConstantsUtil.CHAIN.EVM) ||
      // Request to input email and sign message when email capture is enabled
      OptionsController.state.remoteFeatures?.emailCapture
    ) {
      const result = await authConnector.connect({
        chainId,
        socialUri,
        preferredAccountType
      })

      return {
        address: result.address,
        chainId: result.chainId,
        accounts: result.accounts
      }
    }

    const caipNetwork = `${chainNamespace}:${chainId}` as CaipNetworkId

    const siwxMessage = await siwx.createMessage({
      chainId: caipNetwork,
      accountAddress: '<<AccountAddress>>'
    })

    // Extract only the serializable data properties for postMessage, toString() is not possible to include in the postMessage
    const siwxMessageData = {
      accountAddress: siwxMessage.accountAddress,
      chainId: siwxMessage.chainId,
      domain: siwxMessage.domain,
      uri: siwxMessage.uri,
      version: siwxMessage.version,
      nonce: siwxMessage.nonce,
      notBefore: siwxMessage.notBefore,
      statement: siwxMessage.statement,
      resources: siwxMessage.resources,
      requestId: siwxMessage.requestId,
      issuedAt: siwxMessage.issuedAt,
      expirationTime: siwxMessage.expirationTime,
      serializedMessage: siwxMessage.toString()
    }

    const result = await authConnector.connect({
      chainId,
      socialUri,
      siwxMessage: siwxMessageData,
      preferredAccountType
    })

    siwxMessageData.accountAddress = result.address
    siwxMessageData.serializedMessage = result.message || ''

    if (result.signature && result.message) {
      const promise = SIWXUtil.addEmbeddedWalletSession(
        siwxMessageData,
        result.message,
        result.signature
      )

      await promise
    }

    ChainController.setLastConnectedSIWECaipNetwork(network)

    return {
      address: result.address,
      chainId: result.chainId,
      accounts: result.accounts
    }
  },

  async addEmbeddedWalletSession(
    siwxMessageData: SIWXMessage.Data,
    message: string,
    signature: string
  ): Promise<void> {
    if (addEmbeddedWalletSessionPromise) {
      return addEmbeddedWalletSessionPromise
    }

    const siwx = SIWXUtil.getSIWX()

    if (!siwx) {
      return Promise.resolve()
    }

    addEmbeddedWalletSessionPromise = siwx
      .addSession({
        data: siwxMessageData,
        message,
        signature
      })
      .finally(() => {
        addEmbeddedWalletSessionPromise = null
      })

    return addEmbeddedWalletSessionPromise
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
    const network = getActiveCaipNetwork()
    const namespaces = new Set(chains.map(chain => chain.split(':')[0] as ChainNamespace))

    if (!siwx || namespaces.size !== 1 || !namespaces.has('eip155')) {
      return false
    }

    // Ignores chainId and account address to get other message data
    const siwxMessage = await siwx.createMessage({
      chainId: getActiveCaipNetwork()?.caipNetworkId || ('' as CaipNetworkId),
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
      // The first chainId is what is used for universal provider to build the message
      chains: [siwxMessage.chainId, ...chains.filter(chain => chain !== siwxMessage.chainId)]
    })

    SnackController.showLoading('Authenticating...', { autoClose: false })

    const walletInfo = {
      ...result.session.peer.metadata,
      name: result.session.peer.metadata.name,
      icon: result.session.peer.metadata.icons?.[0],
      type: 'WALLET_CONNECT'
    }

    ChainController.setAccountProp(
      'connectedWalletInfo',
      walletInfo,
      Array.from(namespaces)[0] as ChainNamespace
    )

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

        if (network) {
          ChainController.setLastConnectedSIWECaipNetwork(network)
        }

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
          properties: SIWXUtil.getSIWXEventProperties(error)
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
  getSIWXEventProperties(error?: unknown) {
    const namespace = ChainController.state.activeChain

    if (!namespace) {
      throw new Error('SIWXUtil:getSIWXEventProperties - namespace is required')
    }

    return {
      network: ChainController.state.activeCaipNetwork?.caipNetworkId || '',
      isSmartAccount:
        getPreferredAccountType(namespace) === W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT,
      message: error ? CoreHelperUtil.parseError(error) : undefined
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

  /**
   * This method determines whether the wallet stays connected when the user denies the signature request.
   *
   * @returns {boolean}
   */
  getRequired?: () => boolean

  /**
   * This method determines whether the session should be cleared when the user disconnects.
   *
   * @default true
   * @returns {boolean}
   */
  signOutOnDisconnect?: boolean
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
