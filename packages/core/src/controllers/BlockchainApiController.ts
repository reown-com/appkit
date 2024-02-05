import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { FetchUtil } from '../utils/FetchUtil.js'
import type {
  BlockchainApiTransactionsRequest,
  BlockchainApiTransactionsResponse,
  BlockchainApiIdentityRequest,
  BlockchainApiIdentityResponse,
  GenerateOnRampUrlArgs,
  GetQuoteArgs,
  OnrampQuote,
  PaymentCurrency,
  PurchaseCurrency
} from '../utils/TypeUtil.js'
import { OptionsController } from './OptionsController.js'

// -- Helpers ------------------------------------------- //
const baseUrl = CoreHelperUtil.getBlockchainApiUrl()
const api = new FetchUtil({ baseUrl })

// -- Controller ---------------------------------------- //
export const BlockchainApiController = {
  fetchIdentity({ caipChainId, address }: BlockchainApiIdentityRequest) {
    return api.get<BlockchainApiIdentityResponse>({
      path: `/v1/identity/${address}`,
      params: {
        chainId: caipChainId,
        projectId: OptionsController.state.projectId
      }
    })
  },

  fetchTransactions({
    account,
    projectId,
    cursor,
    onramp,
    signal
  }: BlockchainApiTransactionsRequest) {
    const queryParams = cursor ? { cursor } : {}

    return api.get<BlockchainApiTransactionsResponse>({
      path: `/v1/account/${account}/history?projectId=${projectId}${
        onramp ? `&onramp=${onramp}` : ''
      }`,
      params: queryParams,
      signal
    })
  },

  async generateOnRampURL({
    destinationWallets,
    partnerUserId,
    defaultNetwork
  }: GenerateOnRampUrlArgs) {
    const response = await api.post<{ url: string }>({
      path: `/v1/generators/onrampurl?projectId=${OptionsController.state.projectId}`,
      body: {
        destinationWallets,
        defaultNetwork,
        partnerUserId
      }
    })

    return response.url
  },

  async getOnrampOptions() {
    const response = await api.get<{
      paymentCurrencies: PaymentCurrency[]
      purchaseCurrencies: PurchaseCurrency[]
    }>({
      path: `/v1/onramp/options?projectId=${OptionsController.state.projectId}`
    })

    return response
  },

  async getOnrampQuote({ purchaseCurrency, paymentCurrency, amount, network }: GetQuoteArgs) {
    const response = await api.post<OnrampQuote>({
      path: `/v1/onramp/quote?projectId=${OptionsController.state.projectId}`,
      body: {
        purchaseCurrency,
        paymentCurrency,
        amount,
        network
      }
    })

    return response
  }
}
