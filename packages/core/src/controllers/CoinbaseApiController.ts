import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { FetchUtil } from '../utils/FetchUtil.js'
import type {
  CoinbaseApiTransactionsRequest,
  CoinbaseApiTransactionsResponse
} from '../utils/TypeUtil.js'

export const DEFAULT_HOST = 'https://pay.coinbase.com'

export type DestinationWallet = {
  /* Destination address where the purchased assets will be sent. */
  address: string
  /** List of networks enabled for the associated address. All assets available per network are displayed to the user. */
  blockchains?: string[]
  /** List of assets enabled for the associated address. They are appended to the available list of assets. */
  assets?: string[]
  /** Restrict the networks available for the associated assets. */
  supportedNetworks?: string[]
}

export type OnRampExperience = 'buy' | 'send'

type BaseOnRampAppParams = {
  /** The destination wallets supported by your application (BTC, ETH, etc). */
  destinationWallets: DestinationWallet[]
  /** The preset input amount as a crypto value. i.e. 0.1 ETH. This will be the initial default for all cryptocurrencies. */
  presetCryptoAmount?: number
  /**
   * The preset input amount as a fiat value. i.e. 15 USD.
   * This will be the initial default for all cryptocurrencies. Ignored if presetCryptoAmount is also set.
   * Also note this only works for a subset of fiat currencies: USD, CAD, GBP, EUR
   * */
  presetFiatAmount?: number
  /** The default network that should be selected when multiple networks are present. */
  defaultNetwork?: string
  /** The default experience the user should see: either transfer funds from Coinbase (`'send'`) or buy them (`'buy'`). */
  defaultExperience?: OnRampExperience
  handlingRequestedUrls?: boolean
  /** ID used to link all user transactions created during the session. */
  partnerUserId?: string
}

export type OnRampAggregatorAppParams = {
  quoteId: string
  defaultAsset: string
  defaultNetwork?: string
  defaultPaymentMethod: string
  presetFiatAmount: number
  fiatCurrency: string
}

export type OnRampAppParams =
  | BaseOnRampAppParams
  | (BaseOnRampAppParams & OnRampAggregatorAppParams)

export type GenerateOnRampURLOptions = {
  appId: string
  host?: string
} & OnRampAppParams

// -- Types --------------------------------------------- //
// -- State --------------------------------------------- //

// -- Helpers ------------------------------------------- //
const baseUrl = CoreHelperUtil.getCoinbaseApiUrl()
const api = new FetchUtil({ baseUrl })

// -- Controller ---------------------------------------- //
export const CoinbaseApiController = {
  fetchTransactions({ accountAddress, pageKey, pageSize }: CoinbaseApiTransactionsRequest) {
    return api.get<CoinbaseApiTransactionsResponse>({
      path: `api/v1/buy/user/${accountAddress}/transactions?pageKey=${pageKey}&pageSize=${pageSize}`,
      headers: {
        'Cbpay-App-Id': process.env['NEXT_PUBLIC_COINBASE_APP_ID'] ?? '',
        'Cbpay-Api-Key': process.env['NEXT_PUBLIC_COINBASE_API_KEY'] ?? ''
      }
    })
  },
  generateOnRampURL({
    appId = process.env['NEXT_PUBLIC_COINBASE_APP_ID'] ?? '',
    host = DEFAULT_HOST,
    destinationWallets,
    ...otherParams
  }: GenerateOnRampURLOptions): string {
    const url = new URL(host)
    url.pathname = '/buy/select-asset'

    url.searchParams.append('appId', process.env['NEXT_PUBLIC_COINBASE_APP_ID'] ?? '')
    url.searchParams.append(
      'destinationWallets',
      JSON.stringify([
        {
          address: otherParams.partnerUserId,
          blockchains: ['ethereum'],
          assets: ['USDC']
        }
      ])
    )
    ;(Object.keys(otherParams) as (keyof typeof otherParams)[]).forEach(key => {
      const value = otherParams[key]
      if (value !== undefined) {
        url.searchParams.append(key, value.toString())
      }
    })

    url.searchParams.sort()

    return url.toString()
  }
}
