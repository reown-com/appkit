import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { FetchUtil } from '../utils/FetchUtil.js'
import type {
  CoinbaseApiTransactionsRequest,
  CoinbaseApiTransactionsResponse
} from '../utils/TypeUtil.js'

export const DEFAULT_HOST = 'https://pay.coinbase.com'

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
  }
}
