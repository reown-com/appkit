import { type ChainNamespace, NumberUtil, ParseUtil } from '@reown/appkit-common'
import {
  CoreHelperUtil,
  FetchUtil,
  OptionsController,
  type PaymentAsset,
  getNativeTokenAddress
} from '@reown/appkit-controllers'
import { HelpersUtil } from '@reown/appkit-utils'

import type { Exchange, ExchangeBuyStatus } from '../types/exchange.js'
import type { Quote, QuoteStatus } from '../types/quote.js'
import { API_URL } from './ConstantsUtil.js'
import { getDirectTransferQuote } from './PaymentUtil.js'

const api = new FetchUtil({ baseUrl: CoreHelperUtil.getApiUrl(), clientId: null })

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

type GetTransfersQuoteParams = {
  address?: string
  sourceToken: PaymentAsset
  toToken: PaymentAsset
  recipient: string
  amount: string
}

type GetQuoteParams = {
  address?: string
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

type GetAssetsForExchangeResult = {
  exchangeId: string
  assets: Record<ChainNamespace, PaymentAsset[]>
}

function getSdkProperties() {
  const { projectId, sdkType, sdkVersion } = OptionsController.state

  return {
    projectId,
    st: sdkType || 'appkit',
    sv: sdkVersion || 'html-wagmi-4.2.2'
  }
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

export async function getTransfersQuote(params: GetTransfersQuoteParams) {
  const amount = NumberUtil.bigNumber(params.amount)
    .times(10 ** params.toToken.metadata.decimals)
    .toString()

  const { chainId: originChainId, chainNamespace: originChainNamespace } =
    ParseUtil.parseCaipNetworkId(params.sourceToken.network)

  const { chainId: destinationChainId, chainNamespace: destinationChainNamespace } =
    ParseUtil.parseCaipNetworkId(params.toToken.network)

  const originCurrency =
    params.sourceToken.asset === 'native'
      ? getNativeTokenAddress(originChainNamespace)
      : params.sourceToken.asset

  const destinationCurrency =
    params.toToken.asset === 'native'
      ? getNativeTokenAddress(destinationChainNamespace)
      : params.toToken.asset

  const response = await api.post<GetQuoteResult>({
    path: '/appkit/v1/transfers/quote',
    body: {
      user: params.address,
      originChainId: originChainId.toString(),
      originCurrency,
      destinationChainId: destinationChainId.toString(),
      destinationCurrency,
      recipient: params.recipient,
      amount
    },
    params: getSdkProperties()
  })

  return response
}

export async function getQuote(params: GetQuoteParams) {
  const isSameChain = HelpersUtil.isLowerCaseMatch(
    params.sourceToken.network,
    params.toToken.network
  )

  const isSameAsset = HelpersUtil.isLowerCaseMatch(params.sourceToken.asset, params.toToken.asset)

  if (isSameChain && isSameAsset) {
    return getDirectTransferQuote(params)
  }

  return getTransfersQuote(params)
}

export async function getQuoteStatus(params: GetQuoteStatusParams) {
  const response = await api.get<GetQuoteStatusResult>({
    path: '/appkit/v1/transfers/status',
    params: {
      requestId: params.requestId,
      ...getSdkProperties()
    }
  })

  return response
}

export async function getAssetsForExchange(exchangeId: string) {
  const response = await api.get<GetAssetsForExchangeResult>({
    path: `/appkit/v1/transfers/assets/exchanges/${exchangeId}`,
    params: getSdkProperties()
  })

  return response
}
