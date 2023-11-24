import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { FetchUtil } from '../utils/FetchUtil.js'
import type {
  CoinbaseApiTransactionsRequest,
  CoinbaseApiTransactionsResponse
} from '../utils/TypeUtil.js'

// -- Helpers ------------------------------------------- //
const baseUrl = CoreHelperUtil.getCoinbaseApiUrl()
const api = new FetchUtil({ baseUrl })

// -- Controller ---------------------------------------- //
export const CoinbaseApiController = {
  fetchTransactions({ pageKey, pageSize }: CoinbaseApiTransactionsRequest) {
    return api.get<CoinbaseApiTransactionsResponse>({
      path: `api/v1/buy/user/0x63755B7B300228254FB7d16321eCD3B87f98ca2a/transactions?pageKey=${pageKey}&pageSize=${pageSize}`,
      headers: {
        'Cbpay-App-Id': process.env['NEXT_PUBLIC_COINBASE_APP_ID'] ?? '',
        'Cbpay-Api-Key': process.env['NEXT_PUBLIC_COINBASE_API_KEY'] ?? ''
      }
    })
  }
}
