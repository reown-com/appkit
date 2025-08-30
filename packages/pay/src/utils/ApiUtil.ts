import { OptionsController } from '@reown/appkit-controllers'

import type { Exchange, ExchangeBuyStatus } from '../types/exchange.js'
import { API_URL } from './ConstantsUtil.js'

class JsonRpcError extends Error {}

export function getApiUrl() {
  const projectId = OptionsController.getSnapshot().projectId

  return `${API_URL}?projectId=${projectId}`
}

type JsonRpcResponse<T> = {
  jsonrpc: string
  id: number
  result: T
}

type GetExchangesParams = {
  page: number
  includeOnly?: string[]
  exclude?: string[]
  asset?: string
  amount?: string
}

export type GetExchangesResult = {
  exchanges: Exchange[]
  total: number
}

type GetPayUrlParams = {
  exchangeId: string
  asset: string
  amount: string
  recipient: string
}

type GetPayUrlResult = {
  url: string
  sessionId: string
}

type GetBuyStatusParams = {
  sessionId: string
  exchangeId: string
}

type GetBuyStatusResult = {
  status: ExchangeBuyStatus
  txHash?: string
}

async function sendRequest<T>(method: string, params: unknown): Promise<JsonRpcResponse<T>> {
  const url = getApiUrl()
  const { sdkType: st, sdkVersion: sv, projectId } = OptionsController.getSnapshot()

  const requestBody = {
    jsonrpc: '2.0',
    id: 1,
    method,
    params: {
      ...(params || {}),
      st,
      sv,
      projectId
    }
  }
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(requestBody),
    headers: { 'Content-Type': 'application/json' }
  })

  const json = await response.json()

  if (json.error) {
    throw new JsonRpcError(json.error.message)
  }

  return json as JsonRpcResponse<T>
}

export async function getExchanges(params: GetExchangesParams) {
  const response = await sendRequest<GetExchangesResult>('reown_getExchanges', params)

  return response.result
}

export async function getPayUrl(params: GetPayUrlParams) {
  const response = await sendRequest<GetPayUrlResult>('reown_getExchangePayUrl', params)

  return response.result
}

export async function getBuyStatus(params: GetBuyStatusParams) {
  const response = await sendRequest<GetBuyStatusResult>('reown_getExchangeBuyStatus', params)

  return response.result
}
