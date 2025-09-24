//
import {
  type CaipNetworkId,
  type ChainNamespace,
  ConstantsUtil,
  SafeLocalStorage,
  type SafeLocalStorageItems,
  SafeLocalStorageKeys
} from '@reown/appkit-common'

import { ApiController } from '../../controllers/ApiController.js'
import { BlockchainApiController } from '../../controllers/BlockchainApiController.js'
import { ChainController } from '../../controllers/ChainController.js'
import { getActiveCaipNetwork } from '../../utils/ChainControllerUtil.js'
import type { SIWXConfig, SIWXMessage, SIWXSession } from '../../utils/SIWXUtil.js'
import { ReownAuthenticationMessenger } from './ReownAuthenticationMessenger.js'

/**
 * This is the configuration for using SIWX with Reown Authentication service.
 * It allows you to authenticate and capture user sessions through the Cloud Dashboard.
 */
export class ReownAuthentication implements SIWXConfig {
  private readonly localAuthStorageKey: keyof SafeLocalStorageItems
  private readonly localNonceStorageKey: keyof SafeLocalStorageItems
  private readonly messenger: ReownAuthenticationMessenger

  private required: boolean
  private otpUuid: string | null = null

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

    this.messenger = new ReownAuthenticationMessenger({
      getNonce: this.getNonce.bind(this)
    })
  }

  async createMessage(input: SIWXMessage.Input): Promise<SIWXMessage> {
    return this.messenger.createMessage(input)
  }

  async addSession(session: SIWXSession): Promise<void> {
    const response = await this.request({
      method: 'POST',
      key: 'authenticate',
      body: {
        data: session.data,
        message: session.message,
        signature: session.signature,
        clientId: this.getClientId(),
        walletInfo: this.getWalletInfo()
      },
      headers: ['nonce', 'otp']
    })

    this.setStorageToken(response.token, this.localAuthStorageKey)
    this.emit('sessionChanged', session)
    this.setAppKitAccountUser(jwtDecode(response.token))

    this.otpUuid = null
  }

  async getSessions(chainId: CaipNetworkId, address: string): Promise<SIWXSession[]> {
    try {
      if (!this.getStorageToken(this.localAuthStorageKey)) {
        return []
      }

      const account = await this.request({
        method: 'GET',
        key: 'me',
        query: {},
        headers: ['auth'] as const
      })

      if (!account) {
        return []
      }

      const isSameAddress = account.address.toLowerCase() === address.toLowerCase()
      const isSameNetwork = account.caip2Network === chainId

      if (!isSameAddress || !isSameNetwork) {
        return []
      }

      const session: SIWXSession = {
        data: {
          accountAddress: account.address,
          chainId: account.caip2Network
        } as SIWXMessage.Data,
        message: '',
        signature: ''
      }

      this.emit('sessionChanged', session)
      this.setAppKitAccountUser(account)

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

    return this.request({
      method: 'GET',
      key: 'me',
      body: undefined,
      query: {
        includeAppKitAccount: true
      },
      headers: ['auth']
    })
  }

  async setSessionAccountMetadata(metadata: object | null = null) {
    if (!this.getStorageToken(this.localAuthStorageKey)) {
      throw new Error('Not authenticated')
    }

    return this.request({
      method: 'PUT',
      key: 'account-metadata',
      body: { metadata },
      headers: ['auth']
    })
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

  async requestEmailOtp({ email, account }: { email: string; account: string }) {
    const otp = await this.request({
      method: 'POST',
      key: 'otp',
      body: { email, account }
    })

    this.otpUuid = otp.uuid

    this.messenger.resources = [`email:${email}`]

    return otp
  }

  confirmEmailOtp({ code }: { code: string }) {
    return this.request({
      method: 'PUT',
      key: 'otp',
      body: { code },
      headers: ['otp']
    })
  }

  private async request<
    Method extends ReownAuthentication.Methods,
    Key extends ReownAuthentication.RequestKeys<Method>
  >({
    method,
    key,
    query,
    body,
    headers
  }: ReownAuthentication.RequestParams<Key, Method>): Promise<
    ReownAuthentication.RequestResponse<Method, Key>
  > {
    const { projectId, st, sv } = this.getSDKProperties()

    const url = new URL(`${ConstantsUtil.W3M_API_URL}/auth/v1/${String(key)}`)
    url.searchParams.set('projectId', projectId)
    url.searchParams.set('st', st)
    url.searchParams.set('sv', sv)

    if (query) {
      Object.entries(query).forEach(([queryKey, queryValue]) =>
        url.searchParams.set(queryKey, String(queryValue))
      )
    }

    const response = await fetch(url, {
      method,
      body: body ? JSON.stringify(body) : undefined,
      headers: Array.isArray(headers)
        ? headers.reduce((acc, header) => {
            switch (header) {
              case 'nonce':
                acc['x-nonce-jwt'] = `Bearer ${this.getStorageToken(this.localNonceStorageKey)}`
                break
              case 'auth':
                acc['Authorization'] = `Bearer ${this.getStorageToken(this.localAuthStorageKey)}`
                break
              case 'otp':
                if (this.otpUuid) {
                  acc['x-otp'] = this.otpUuid
                }
                break
              default:
                break
            }

            return acc
          }, {})
        : undefined
    })

    if (!response.ok) {
      throw new Error(await response.text())
    }

    if (response.headers.get('content-type')?.includes('application/json')) {
      return response.json()
    }

    return null as ReownAuthentication.RequestResponse<Method, Key>
  }

  private getStorageToken(key: keyof SafeLocalStorageItems): string | undefined {
    return SafeLocalStorage.getItem(key)
  }

  private setStorageToken(token: string, key: keyof SafeLocalStorageItems): void {
    SafeLocalStorage.setItem(key, token)
  }

  private clearStorageTokens(): void {
    this.otpUuid = null
    SafeLocalStorage.removeItem(this.localAuthStorageKey)
    SafeLocalStorage.removeItem(this.localNonceStorageKey)
    this.emit('sessionChanged', undefined)
  }

  private async getNonce(): Promise<string> {
    const { nonce, token } = await this.request({
      method: 'GET',
      key: 'nonce'
    })

    this.setStorageToken(token, this.localNonceStorageKey)

    return nonce
  }

  private getClientId(): string | null {
    return BlockchainApiController.state.clientId
  }

  private getWalletInfo(): ReownAuthentication.WalletInfo | undefined {
    const walletInfo = ChainController.getAccountData()?.connectedWalletInfo

    if (!walletInfo) {
      return undefined
    }

    if ('social' in walletInfo && 'identifier' in walletInfo) {
      const social = walletInfo['social'] as string
      const identifier = walletInfo['identifier'] as string

      return { type: 'social', social, identifier }
    }

    const { name, icon } = walletInfo

    let type: ReownAuthentication.WalletInfo['type'] = 'unknown'

    switch (walletInfo.type) {
      case 'EXTERNAL':
      case 'INJECTED':
      case 'ANNOUNCED':
        type = 'extension'
        break
      case 'WALLET_CONNECT':
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

  private setAppKitAccountUser(session: ReownAuthentication.SessionAccount) {
    const { email } = session

    if (email) {
      Object.values(ConstantsUtil.CHAIN).forEach(chainNamespace => {
        ChainController.setAccountProp('user', { email }, chainNamespace)
      })
    }
  }
}

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

  export type AvailableRequestHeaders = {
    nonce: {
      'x-nonce-jwt': string
    }
    auth: {
      Authorization: string
    }
    otp: {
      'x-otp'?: string
    }
  }

  export type RequestParams<Key extends keyof Requests[Method], Method extends Methods> = {
    method: Method
    key: Key
    // @ts-expect-error - This is matching correctly already
  } & Pick<Requests[Method][Key], 'query' | 'body' | 'headers'>

  export type RequestResponse<
    Method extends Methods,
    Key extends RequestKeys<Method>
    // @ts-expect-error - This is matching correctly already
  > = Requests[Method][Key]['response']

  export type Request<
    Body,
    Response,
    Query extends Record<string, unknown> | undefined = undefined,
    Headers extends (keyof AvailableRequestHeaders)[] | undefined = undefined
  > = (Response extends undefined
    ? {
        response?: never
      }
    : {
        response: Response
      }) &
    (Body extends undefined ? { body?: never } : { body: Body }) &
    (Query extends undefined ? { query?: never } : { query: Query }) &
    (Headers extends undefined ? { headers?: never } : { headers: Headers })

  export type Requests = {
    GET: {
      nonce: Request<undefined, { nonce: string; token: string }>
      me: Request<
        undefined,
        Omit<SessionAccount, 'appKitAccount'>,
        { includeAppKitAccount?: boolean },
        ['auth']
      >
    }
    POST: {
      authenticate: Request<
        {
          data?: SIWXMessage.Data
          message: string
          signature: string
          clientId?: string | null
          walletInfo?: WalletInfo
        },
        {
          token: string
        },
        undefined,
        ['nonce', 'otp']
      >
      'sign-out': Request<undefined, never, never, ['auth']>
      otp: Request<{ email: string; account: string }, { uuid: string | null }>
    }
    PUT: {
      'account-metadata': Request<{ metadata: object | null }, unknown, undefined, ['auth']>
      otp: Request<{ code: string }, null, undefined, ['otp']>
    }
  }

  export type Methods = 'GET' | 'POST' | 'PUT'

  export type RequestKeys<Method extends Methods> = keyof Requests[Method]

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
    chainNamespace: ChainNamespace
    caip2Network: string
    uri: string
    domain: string
    projectUuid: string
    profileUuid: string
    nonce: string
    email?: string
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

/**
 * Decodes a JWT token and returns its payload
 * @param token - The JWT token to decode
 * @returns The decoded payload or null if invalid
 */
function jwtDecode(token: string): Omit<ReownAuthentication.SessionAccount, 'appKitAccount'> {
  // Split the token into parts
  const parts = token.split('.')

  // Check if the token has the correct format (header.payload.signature)
  if (parts.length !== 3) {
    throw new Error('Invalid token')
  }

  // Decode the payload (second part)
  const payload = parts[1]

  if (typeof payload !== 'string') {
    throw new Error('Invalid token')
  }

  // Convert base64url to base64
  const base64 = payload.replace(/-/gu, '+').replace(/_/gu, '/')

  // Add padding if needed
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')

  // Decode and parse the JSON
  const decoded = JSON.parse(atob(padded))

  return decoded
}
