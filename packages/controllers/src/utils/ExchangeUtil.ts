import { type CaipNetworkId, type ChainNamespace, ParseUtil } from '@reown/appkit-common'

import { OptionsController } from '../controllers/OptionsController.js'

export type Exchange = {
  id: string
  imageUrl: string
  name: string
}

export type ExchangeBuyStatus = 'UNKNOWN' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED'

export type GetExchangesParams = {
  page?: number
  asset?: string
  amount?: number | string
  network?: CaipNetworkId
}

export type PayUrlParams = {
  network: CaipNetworkId
  asset: string
  amount: number | string
  recipient: string
}

const CHAIN_ASSET_INFO_MAP: Partial<
  Record<
    ChainNamespace,
    {
      native: { assetNamespace: string; assetReference: string }
      defaultTokenNamespace: string
    }
  >
> = {
  eip155: {
    native: { assetNamespace: 'slip44', assetReference: '60' },
    defaultTokenNamespace: 'erc20'
  },
  solana: {
    native: { assetNamespace: 'slip44', assetReference: '501' },
    defaultTokenNamespace: 'token'
  }
}

class JsonRpcError extends Error {}

export function getApiUrl() {
  const projectId = OptionsController.getSnapshot().projectId

  return `https://rpc.walletconnect.org/v1/json-rpc?projectId=${projectId}&source=fund-wallet`
}

export type JsonRpcResponse<T> = {
  jsonrpc: string
  id: number
  result: T
}

export type GetExchangesResult = {
  exchanges: Exchange[]
  total: number
}

export type GetPayUrlParams = {
  exchangeId: string
  asset: string
  amount: string
  recipient: string
}

export type GetPayUrlResult = {
  url: string
  sessionId: string
}

export type GetBuyStatusParams = {
  sessionId: string
  exchangeId: string
}

export type GetBuyStatusResult = {
  status: ExchangeBuyStatus
  txHash?: string
}

async function sendRequest<T>(method: string, params: unknown): Promise<JsonRpcResponse<T>> {
  const url = getApiUrl()
  const requestBody = {
    jsonrpc: '2.0',
    id: 1,
    method,
    params
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

export function formatCaip19Asset(caipNetworkId: CaipNetworkId, asset: string): string {
  const { chainNamespace, chainId } = ParseUtil.parseCaipNetworkId(caipNetworkId)

  const chainInfo = CHAIN_ASSET_INFO_MAP[chainNamespace]
  if (!chainInfo) {
    throw new Error(`Unsupported chain namespace for CAIP-19 formatting: ${chainNamespace}`)
  }

  let assetNamespace = chainInfo.native.assetNamespace
  let assetReference = chainInfo.native.assetReference

  if (asset !== 'native') {
    assetNamespace = chainInfo.defaultTokenNamespace
    assetReference = asset
  }

  const networkPart = `${chainNamespace}:${chainId}`

  return `${networkPart}/${assetNamespace}:${assetReference}`
}
