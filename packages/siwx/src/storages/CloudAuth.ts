import {
  ApiController,
  BlockchainApiController,
  type SIWXMessage,
  type SIWXSession
} from '@reown/appkit-core'
import type { SIWXStorage } from '../core/SIWXStorage.js'
import { ConstantsUtil, type CaipNetworkId } from '@reown/appkit-common'

export class CloudAuth implements SIWXStorage {
  add(session: SIWXSession): Promise<void> {
    return this.request('authenticate', {
      message: session.message,
      signature: session.signature,
      clientId: BlockchainApiController.state.clientId
    })
  }

  delete(_chainId: string, _address: string): Promise<void> {
    return this.request('sign-out', undefined)
  }

  async get(chainId: CaipNetworkId, address: string): Promise<SIWXSession[]> {
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

  set(_sessions: SIWXSession[]): Promise<void> {
    throw new Error('Set is not available for CloudAuth')
  }

  private async request<Key extends CloudAuth.RequestKey>(
    key: Key,
    params: CloudAuth.Requests[Key]['body']
  ): Promise<CloudAuth.Requests[Key]['response']> {
    const response = await fetch(`${ConstantsUtil.W3M_API_URL}/auth/v1/${key}`, {
      method: RequestMethod[key],
      body: JSON.stringify(params),
      headers: ApiController._getApiHeaders() satisfies { 'x-project-id': string }
    })

    if (response.headers.get('content-type')?.includes('application/json')) {
      return response.json()
    }

    throw new Error(await response.text())
  }
}

const RequestMethod = {
  nonce: 'GET',
  me: 'GET',
  authenticate: 'POST',
  'update-user-metadata': 'PATCH',
  'sign-out': 'POST'
} satisfies { [key in CloudAuth.RequestKey]: CloudAuth.Requests[key]['method'] }

export namespace CloudAuth {
  export type Request<Method extends 'GET' | 'POST' | 'PATCH', Params, Response> = {
    method: Method
    body: Params
    response: Response
  }

  export type Requests = {
    nonce: Request<'GET', undefined, { nonce: string }>
    me: Request<'GET', undefined, { address: string; chainId: string }>
    authenticate: Request<
      'POST',
      {
        message: string
        signature: string
        clientId?: string | null
      },
      never
    >
    'update-user-metadata': Request<'PATCH', Record<string, unknown>, unknown>
    'sign-out': Request<'POST', undefined, never>
  }

  export type RequestKey = keyof Requests
}
