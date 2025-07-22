import {
  type CaipNetworkId,
  ConstantsUtil,
  SafeLocalStorage,
  type SafeLocalStorageItems,
  SafeLocalStorageKeys
} from '@reown/appkit-common'
import {
  AccountController,
  ApiController,
  BlockchainApiController,
  type SIWXConfig,
  type SIWXMessage,
  type SIWXSession,
  getActiveCaipNetwork
} from '@reown/appkit-controllers'
import { ConstantsUtil as AppKitConstantUtil } from '@reown/appkit-utils'

import type { SIWXMessenger } from '../core/SIWXMessenger.js'
import { InformalMessenger } from '../index.js'

/**
 * This is the configuration for using SIWX with Reown Authentication service.
 * It allows you to authenticate and capture user sessions through the Cloud Dashboard.
 */
export class ReownAuthentication implements SIWXConfig {
  private readonly localAuthStorageKey: keyof SafeLocalStorageItems
  private readonly localNonceStorageKey: keyof SafeLocalStorageItems
  private readonly messenger: SIWXMessenger

  private required: boolean

  private listeners: ReownAuthentication.EventListeners = {
    sessionChanged: []
  }

  constructor(params: ReownAuthentication.ConstructorParams = {}) {
    this.localAuthStorageKey =
      (params.localAuthStorageKey as keyof SafeLocalStorageItems) ||
      SafeLocalStorageKeys.SIWX_AUTH_TOKEN
    this.localNonceStorageKey =
      (params.localNonceStorageKey as keyof SafeLocalStorageItems) ||
      SafeLocalStorageKeys.SIWX_NONCE_TOKEN
    this.required = params.required ?? true

    this.messenger = new InformalMessenger({
      domain: typeof document === 'undefined' ? 'Unknown Domain' : document.location.host,
      uri: typeof document === 'undefined' ? 'Unknown URI' : document.location.href,
      getNonce: this.getNonce.bind(this),
      clearChainIdNamespace: false
    })
  }

  async createMessage(input: SIWXMessage.Input): Promise<SIWXMessage> {
    return this.messenger.createMessage(input)
  }

  async addSession(session: SIWXSession): Promise<void> {
    const response = await this.request(
      'authenticate',
      {
        data: session.data,
        message: session.message,
        signature: session.signature,
        clientId: this.getClientId(),
        walletInfo: this.getWalletInfo()
      },
      'nonceJwt'
    )
    this.setStorageToken(response.token, this.localAuthStorageKey)
    this.emit('sessionChanged', session)
  }

  async getSessions(chainId: CaipNetworkId, address: string): Promise<SIWXSession[]> {
    try {
      if (!this.getStorageToken(this.localAuthStorageKey)) {
        return []
      }

      const siweSession = await this.request('me', undefined, 'authJwt')

      const isSameAddress = siweSession?.address.toLowerCase() === address.toLowerCase()
      const isSameNetwork = siweSession?.caip2Network === chainId

      if (!isSameAddress || !isSameNetwork) {
        return []
      }

      const session: SIWXSession = {
        data: {
          accountAddress: siweSession.address,
          chainId: siweSession.caip2Network
        } as SIWXMessage.Data,
        message: '',
        signature: ''
      }

      this.emit('sessionChanged', session)

      return [session]
    } catch {
      return []
    }
  }

  async revokeSession(_chainId: CaipNetworkId, _address: string): Promise<void> {
    return Promise.resolve(this.clearStorageTokens())
  }

  async setSessions(sessions: SIWXSession[]): Promise<void> {
    if (sessions.length === 0) {
      this.clearStorageTokens()
    } else {
      const session = (sessions.find(
        s => s.data.chainId === getActiveCaipNetwork()?.caipNetworkId
      ) || sessions[0]) as SIWXSession

      await this.addSession(session)
    }
  }

  getRequired() {
    return this.required
  }

  async getSessionAccount() {
    if (!this.getStorageToken(this.localAuthStorageKey)) {
      throw new Error('Not authenticated')
    }

    return this.request('me?includeAppKitAccount=true', undefined, 'authJwt')
  }

  async setSessionAccountMetadata(metadata: object | null = null) {
    if (!this.getStorageToken(this.localAuthStorageKey)) {
      throw new Error('Not authenticated')
    }

    return this.request('account-metadata', { metadata }, 'authJwt')
  }

  on<Event extends keyof ReownAuthentication.Events>(
    event: Event,
    callback: ReownAuthentication.Listener<Event>
  ) {
    this.listeners[event].push(callback)

    return () => {
      this.listeners[event] = this.listeners[event].filter(
        cb => cb !== callback
      ) as ReownAuthentication.EventListeners[Event]
    }
  }

  removeAllListeners() {
    const keys = Object.keys(this.listeners) as (keyof ReownAuthentication.Events)[]
    keys.forEach(key => {
      this.listeners[key] = []
    })
  }

  private async request<Key extends ReownAuthentication.RequestKey>(
    key: Key,
    params: ReownAuthentication.Requests[Key]['body'],
    tokenType?: 'authJwt' | 'nonceJwt'
  ): Promise<ReownAuthentication.Requests[Key]['response']> {
    const { projectId, st, sv } = this.getSDKProperties()

    let headers: Record<string, string> | undefined = undefined

    switch (tokenType) {
      case 'nonceJwt':
        headers = {
          'x-nonce-jwt': `Bearer ${this.getStorageToken(this.localNonceStorageKey)}`
        }
        break
      case 'authJwt':
        headers = {
          Authorization: `Bearer ${this.getStorageToken(this.localAuthStorageKey)}`
        }
        break
      default:
        break
    }

    const response = await fetch(
      new URL(
        `${ConstantsUtil.W3M_API_URL}/auth/v1/${key}?projectId=${projectId}&st=${st}&sv=${sv}`
      ),
      {
        method: RequestMethod[key],
        body: params ? JSON.stringify(params) : undefined,
        headers
      }
    )

    if (response.headers.get('content-type')?.includes('application/json')) {
      return response.json()
    }

    throw new Error(await response.text())
  }

  private getStorageToken(key: keyof SafeLocalStorageItems): string | undefined {
    return SafeLocalStorage.getItem(key)
  }

  private setStorageToken(token: string, key: keyof SafeLocalStorageItems): void {
    SafeLocalStorage.setItem(key, token)
  }

  private clearStorageTokens(): void {
    SafeLocalStorage.removeItem(this.localAuthStorageKey)
    SafeLocalStorage.removeItem(this.localNonceStorageKey)
    this.emit('sessionChanged', undefined)
  }

  private async getNonce(): Promise<string> {
    const { nonce, token } = await this.request('nonce', undefined)

    this.setStorageToken(token, this.localNonceStorageKey)

    return nonce
  }

  private getClientId(): string | null {
    return BlockchainApiController.state.clientId
  }

  private getWalletInfo(): ReownAuthentication.WalletInfo | undefined {
    const { connectedWalletInfo } = AccountController.state

    if (!connectedWalletInfo) {
      return undefined
    }

    if ('social' in connectedWalletInfo) {
      const social = connectedWalletInfo['social'] as string
      const identifier = connectedWalletInfo['identifier'] as string

      return { type: 'social', social, identifier }
    }

    const { name, icon } = connectedWalletInfo

    let type: ReownAuthentication.WalletInfo['type'] = 'unknown'

    switch (connectedWalletInfo['type']) {
      case AppKitConstantUtil.CONNECTOR_TYPE_EXTERNAL:
      case AppKitConstantUtil.CONNECTOR_TYPE_INJECTED:
      case AppKitConstantUtil.CONNECTOR_TYPE_ANNOUNCED:
        type = 'extension'
        break
      case AppKitConstantUtil.CONNECTOR_TYPE_WALLET_CONNECT:
        type = 'walletconnect'
        break
      default:
        type = 'unknown'
    }

    return {
      type,
      name,
      icon
    }
  }

  private getSDKProperties(): { projectId: string; st: string; sv: string } {
    return ApiController._getSdkProperties()
  }

  private emit<Event extends keyof ReownAuthentication.Events>(
    event: Event,
    data: ReownAuthentication.Events[Event]
  ) {
    this.listeners[event].forEach(listener => listener(data))
  }
}

const RequestMethod = {
  nonce: 'GET',
  me: 'GET',
  authenticate: 'POST',
  'account-metadata': 'PUT',
  'sign-out': 'POST',
  'me?includeAppKitAccount=true': 'GET'
} satisfies { [key in ReownAuthentication.RequestKey]: ReownAuthentication.Requests[key]['method'] }

export namespace ReownAuthentication {
  export type ConstructorParams = {
    /**
     * The key to use for storing the session token in local storage.
     * @default '@appkit/siwx-auth-token'
     */
    localAuthStorageKey?: string
    /**
     * The key to use for storing the nonce token in local storage.
     * @default '@appkit/siwx-nonce-token'
     */
    localNonceStorageKey?: string
    /**
     * If false the wallet stays connected when user denies the signature request.
     * @default true
     */
    required?: boolean
  }

  export type Request<Method extends 'GET' | 'POST' | 'PATCH' | 'PUT', Params, Response> = {
    method: Method
    body: Params
    response: Response
  }

  export type Requests = {
    nonce: Request<'GET', undefined, { nonce: string; token: string }>
    me: Request<'GET', undefined, Omit<SessionAccount, 'appKitAccount'>>
    'me?includeAppKitAccount=true': Request<'GET', undefined, SessionAccount>
    authenticate: Request<
      'POST',
      {
        data?: SIWXMessage.Data
        message: string
        signature: string
        clientId?: string | null
        walletInfo?: WalletInfo
      },
      {
        token: string
      }
    >
    'account-metadata': Request<'PUT', { metadata: object | null }, unknown>
    'sign-out': Request<'POST', undefined, never>
  }

  export type RequestKey = keyof Requests

  export type WalletInfo =
    | {
        type: 'walletconnect' | 'extension' | 'unknown'
        name: string | undefined
        icon: string | undefined
      }
    | { type: 'social'; social: string; identifier: string }

  export type Events = {
    sessionChanged: SIWXSession | undefined
  }

  export type Listener<Event extends keyof Events> = (event: Events[Event]) => void

  export type EventListeners = {
    [Key in keyof Events]: Listener<Key>[]
  }

  export type SessionAccount = {
    aud: string
    iss: string
    exp: number
    projectIdKey: string
    sub: string
    address: string
    chainId: number | string
    chainIdNamespace: string
    caip2Network: string
    uri: string
    domain: string
    projectUuid: string
    profileUuid: string
    nonce: string
    appKitAccount?: {
      uuid: string
      caip2_chain: string
      address: string
      profile_uuid: string
      created_at: string
      is_main_account: boolean
      verification_status: null
      connection_method: object | null
      metadata: object
      last_signed_in_at: string
      signed_up_at: string
      updated_at: string
    }
  }
}

export { ReownAuthentication as CloudAuthSIWX }
