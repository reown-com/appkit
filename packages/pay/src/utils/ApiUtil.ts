import { type ChainNamespace, NumberUtil, ParseUtil } from '@reown/appkit-common'
import {
  FetchUtil,
  OptionsController,
  type PaymentAsset,
  getNativeTokenAddress
} from '@reown/appkit-controllers'
import { HelpersUtil } from '@reown/appkit-utils'

import type { Exchange, ExchangeBuyStatus } from '../types/exchange.js'
import type { Quote, QuoteStatus } from '../types/quote.js'
import { API_URL } from './ConstantsUtil.js'
import { getSameChainQuote } from './PaymentUtil.js'

function getOrigin() {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  return ''
}

const devFetchUtil = new FetchUtil({ baseUrl: getOrigin(), clientId: null })

const DEAD_ADDRESSES_BY_NAMESPACE: Partial<Record<ChainNamespace, string>> = {
  eip155: '0x000000000000000000000000000000000000dead',
  solana: 'CbKGgVKLJFb8bBrf58DnAkdryX6ubewVytn7X957YwNr',
  bip122: 'bc1q4vxn43l44h30nkluqfxd9eckf45vr2awz38lwa'
}

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

type GetCrossChainQuoteParams = {
  address?: string
  sourceToken: PaymentAsset
  toToken: PaymentAsset
  recipient: string
  amount: string
}

type GetQuoteParams = {
  address: string
  sourceToken: PaymentAsset
  toToken: PaymentAsset
  recipient: string
  amount: string
}

type GetQuoteResult = Quote

type GetQuoteStatusParams = {
  requestId: string
}

type GetQuoteStatusResult = {
  status: QuoteStatus
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

export async function getCrossChainQuote(params: GetCrossChainQuoteParams) {
  const amount = NumberUtil.bigNumber(params.amount)
    .times(10 ** params.toToken.metadata.decimals)
    .toString()

  const { chainId: originChainId, chainNamespace: originChainNamespace } =
    ParseUtil.parseCaipNetworkId(params.sourceToken.network)

  const { chainId: destinationChainId, chainNamespace: destinationChainNamespace } =
    ParseUtil.parseCaipNetworkId(params.toToken.network)

  if (!params.address) {
    params.address = DEAD_ADDRESSES_BY_NAMESPACE[originChainNamespace]
  }

  const originCurrency =
    params.sourceToken.asset === 'native'
      ? getNativeTokenAddress(originChainNamespace)
      : params.sourceToken.asset

  const destinationCurrency =
    params.toToken.asset === 'native'
      ? getNativeTokenAddress(destinationChainNamespace)
      : params.toToken.asset

  const response = await devFetchUtil.post<GetQuoteResult>({
    path: '/api/quote',
    body: {
      user: params.address,
      originChainId: originChainId.toString(),
      originCurrency,
      destinationChainId: destinationChainId.toString(),
      destinationCurrency,
      recipient: params.recipient,
      amount
    }
  })

  return response
}

export async function getQuote(params: GetQuoteParams) {
  const isSameChain = HelpersUtil.isLowerCaseMatch(
    params.sourceToken.network,
    params.toToken.network
  )

  if (isSameChain) {
    const isSameAsset = HelpersUtil.isLowerCaseMatch(params.sourceToken.asset, params.toToken.asset)

    // eslint-disable-next-line no-warning-comments
    // TODO: Support same-chain deposit address with relay with any asset
    if (!isSameAsset) {
      throw new Error('Source and destination assets must be the same')
    }

    return getSameChainQuote(params)
  }

  return getCrossChainQuote(params)
}

export async function getQuoteStatus(params: GetQuoteStatusParams) {
  const response = await devFetchUtil.get<GetQuoteStatusResult>({
    path: '/api/status',
    params: {
      requestId: params.requestId
    }
  })

  return response
}
