import { type CaipNetworkId, type ChainNamespace, ParseUtil } from '@reown/appkit-common'

import { OptionsController } from '../controllers/OptionsController.js'

type PayStatus = 'UNKNOWN' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED'

export type CurrentPayment = {
  type: PaymentType
  exchangeId?: string
  sessionId?: string
  status?: PayStatus
  result?: string
}
export type PayResult = CurrentPayment['result']

export type PaymentAsset = {
  network: CaipNetworkId
  asset: string
  metadata: {
    name: string
    symbol: string
    decimals: number
    iconUrl?: string
  }
  price?: number
}

type PaymentType = 'wallet' | 'exchange'

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
  const { sdkType, sdkVersion, projectId } = OptionsController.getSnapshot()

  const url = new URL('https://rpc.walletconnect.org/v1/json-rpc')

  url.searchParams.set('projectId', projectId)
  url.searchParams.set('st', sdkType)
  url.searchParams.set('sv', sdkVersion)
  url.searchParams.set('source', 'fund-wallet')

  return url.toString()
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
  const { projectId } = OptionsController.getSnapshot()
  const requestBody = {
    jsonrpc: '2.0',
    id: 1,
    method,
    params: {
      ...(params || {}),
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

// -- Assets ------------------------------------------------------------------ //
const ethereumETH: PaymentAsset = {
  network: 'eip155:1',
  asset: 'native',
  metadata: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18
  }
}

const baseETH: PaymentAsset = {
  network: 'eip155:8453',
  asset: 'native',
  metadata: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18
  }
}

export const baseUSDC: PaymentAsset = {
  network: 'eip155:8453',
  asset: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
  metadata: {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6
  }
}

export const baseSepoliaUSDC: PaymentAsset = {
  network: 'eip155:84532',
  asset: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  metadata: {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6
  }
}

const baseSepoliaETH: PaymentAsset = {
  network: 'eip155:84532',
  asset: 'native',
  metadata: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18
  }
}

const ethereumUSDC: PaymentAsset = {
  network: 'eip155:1',
  asset: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  metadata: {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6
  }
}

const arbitrumUSDC: PaymentAsset = {
  network: 'eip155:42161',
  asset: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  metadata: {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6
  }
}

const polygonUSDC: PaymentAsset = {
  network: 'eip155:137',
  asset: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
  metadata: {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6
  }
}

const solanaUSDC: PaymentAsset = {
  network: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  asset: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  metadata: {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6
  }
}

const ethereumUSDT: PaymentAsset = {
  network: 'eip155:1',
  asset: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  metadata: {
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6
  }
}

const optimismUSDT: PaymentAsset = {
  network: 'eip155:10',
  asset: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
  metadata: {
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6
  }
}

const arbitrumUSDT: PaymentAsset = {
  network: 'eip155:42161',
  asset: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
  metadata: {
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6
  }
}

const polygonUSDT: PaymentAsset = {
  network: 'eip155:137',
  asset: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
  metadata: {
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6
  }
}

const solanaUSDT: PaymentAsset = {
  network: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  asset: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  metadata: {
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6
  }
}

const solanaSOL: PaymentAsset = {
  network: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  asset: 'native',
  metadata: {
    name: 'Solana',
    symbol: 'SOL',
    decimals: 9
  }
}

export const assets = {
  ethereumETH,
  baseETH,
  baseUSDC,
  baseSepoliaETH,
  ethereumUSDC,
  arbitrumUSDC,
  polygonUSDC,
  solanaUSDC,
  ethereumUSDT,
  optimismUSDT,
  arbitrumUSDT,
  polygonUSDT,
  solanaUSDT,
  solanaSOL
}

export function getPaymentAssetsForNetwork(network: CaipNetworkId): PaymentAsset[] {
  return Object.values(assets).filter(asset => asset.network === network)
}
