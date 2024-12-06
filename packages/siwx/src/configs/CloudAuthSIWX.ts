import { ConstantsUtil, type CaipNetworkId } from '@reown/appkit-common'
import {
  AccountController,
  ApiController,
  BlockchainApiController,
  ChainController,
  type SIWXConfig,
  type SIWXMessage,
  type SIWXSession
} from '@reown/appkit-core'
import type { SIWXMessenger } from '../core/SIWXMessenger.js'
import { InformalMessenger } from '../index.js'

export class CloudAuthSIWX implements SIWXConfig {
  private readonly localStorageKey: string
  private readonly messenger: SIWXMessenger

  constructor(params: CloudAuthSIWX.ConstructorParams = {}) {
    this.localStorageKey = params.localStorageKey || '@appkit/siwx-token'

    this.messenger = new InformalMessenger({
      domain: typeof document === 'undefined' ? 'Unknown Domain' : document.location.host,
      uri: typeof document === 'undefined' ? 'Unknown URI' : document.location.href,
      getNonce: this.getNonce.bind(this),
      clearChainIdNamespace: true
    })
  }

  async createMessage(input: SIWXMessage.Input): Promise<SIWXMessage> {
    return this.messenger.createMessage(input)
  }

  async addSession(session: SIWXSession): Promise<void> {
    const response = await this.request('authenticate', {
      message: session.message,
      signature: session.signature,
      clientId: this.getClientId(),
      walletInfo: this.getWalletInfo()
    })
    this.setStorageToken(response.token)
  }

  async getSessions(chainId: CaipNetworkId, address: string): Promise<SIWXSession[]> {
    try {
      const siweSession = await this.request('me', undefined)

      const siweCaipNetworkId = `eip155:${siweSession?.chainId}`

      if (!siweSession || siweCaipNetworkId !== chainId || siweSession.address !== address) {
        return []
      }

      const session: SIWXSession = {
        data: {
          accountAddress: siweSession.address,
          chainId: siweCaipNetworkId
        } as SIWXMessage.Data,
        message: '',
        signature: ''
      }

      return [session]
    } catch {
      return []
    }
  }

  async revokeSession(_chainId: CaipNetworkId, _address: string): Promise<void> {
    return Promise.resolve(this.clearStorageToken())
  }

  async setSessions(sessions: SIWXSession[]): Promise<void> {
    if (sessions.length === 0) {
      this.clearStorageToken()
    } else {
      const session = (sessions.find(
        s => s.data.chainId === ChainController.getActiveCaipNetwork()?.caipNetworkId
      ) || sessions[0]) as SIWXSession

      await this.addSession(session)
    }
  }

  private async request<Key extends CloudAuthSIWX.RequestKey>(
    key: Key,
    params: CloudAuthSIWX.Requests[Key]['body']
  ): Promise<CloudAuthSIWX.Requests[Key]['response']> {
    const { projectId, st, sv } = this.getSDKProperties()
    const token = this.getStorageToken()

    const response = await fetch(
      `${ConstantsUtil.W3M_API_URL}/auth/v1/${key}?projectId=${projectId}&st=${st}&sv=${sv}`,
      {
        method: RequestMethod[key],
        body: params ? JSON.stringify(params) : undefined,
        headers: token
          ? {
              Authorization: `Bearer ${token}`
            }
          : undefined
      }
    )

    if (response.headers.get('content-type')?.includes('application/json')) {
      return response.json()
    }

    throw new Error(await response.text())
  }

  private getStorageToken(): string | undefined {
    return localStorage.getItem(this.localStorageKey) || undefined
  }

  private setStorageToken(token: string): void {
    localStorage.setItem(this.localStorageKey, token)
  }

  private clearStorageToken(): void {
    localStorage.removeItem(this.localStorageKey)
  }

  private async getNonce(): Promise<string> {
    const { nonce, token } = await this.request('nonce', undefined)

    this.setStorageToken(token)

    return nonce
  }

  private getClientId(): string | null {
    return BlockchainApiController.state.clientId
  }

  private getWalletInfo():
    | {
        name: string | undefined
        icon: string | undefined
      }
    | undefined {
    const { connectedWalletInfo } = AccountController.state
    if (!connectedWalletInfo) {
      return undefined
    }

    const { name, icon } = connectedWalletInfo

    return { name, icon }
  }

  private getSDKProperties(): { projectId: string; st: string; sv: string } {
    return ApiController._getSdkProperties()
  }
}

const RequestMethod = {
  nonce: 'GET',
  me: 'GET',
  authenticate: 'POST',
  'update-user-metadata': 'PATCH',
  'sign-out': 'POST'
} satisfies { [key in CloudAuthSIWX.RequestKey]: CloudAuthSIWX.Requests[key]['method'] }

export namespace CloudAuthSIWX {
  export type ConstructorParams = {
    localStorageKey?: string
  }

  export type Request<Method extends 'GET' | 'POST' | 'PATCH', Params, Response> = {
    method: Method
    body: Params
    response: Response
  }

  export type Requests = {
    nonce: Request<'GET', undefined, { nonce: string; token: string }>
    me: Request<'GET', undefined, { address: string; chainId: number }>
    authenticate: Request<
      'POST',
      {
        message: string
        signature: string
        clientId?: string | null
        walletInfo?: {
          name: string | undefined
          icon: string | undefined
        }
      },
      {
        token: string
      }
    >
    'update-user-metadata': Request<'PATCH', Record<string, unknown>, unknown>
    'sign-out': Request<'POST', undefined, never>
  }

  export type RequestKey = keyof Requests
}
