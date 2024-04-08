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
  PurchaseCurrency,
  BlockchainApiBalanceResponse
} from '../utils/TypeUtil.js'
import { OptionsController } from './OptionsController.js'

const DEFAULT_OPTIONS = {
  purchaseCurrencies: [
    {
      id: '2b92315d-eab7-5bef-84fa-089a131333f5',
      name: 'USD Coin',
      symbol: 'USDC',
      networks: [
        {
          name: 'ethereum-mainnet',
          display_name: 'Ethereum',
          chain_id: '1',
          contract_address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
        },
        {
          name: 'polygon-mainnet',
          display_name: 'Polygon',
          chain_id: '137',
          contract_address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
        }
      ]
    },
    {
      id: '2b92315d-eab7-5bef-84fa-089a131333f5',
      name: 'Ether',
      symbol: 'ETH',
      networks: [
        {
          name: 'ethereum-mainnet',
          display_name: 'Ethereum',
          chain_id: '1',
          contract_address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
        },
        {
          name: 'polygon-mainnet',
          display_name: 'Polygon',
          chain_id: '137',
          contract_address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
        }
      ]
    }
  ],
  paymentCurrencies: [
    {
      id: 'USD',
      payment_method_limits: [
        {
          id: 'card',
          min: '10.00',
          max: '7500.00'
        },
        {
          id: 'ach_bank_account',
          min: '10.00',
          max: '25000.00'
        }
      ]
    },
    {
      id: 'EUR',
      payment_method_limits: [
        {
          id: 'card',
          min: '10.00',
          max: '7500.00'
        },
        {
          id: 'ach_bank_account',
          min: '10.00',
          max: '25000.00'
        }
      ]
    }
  ]
}

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

  async getBalance(address: string) {
    return api.get<BlockchainApiBalanceResponse>({
      path: `/v1/account/${address}/balance`,
      params: {
        currency: 'usd',
        projectId: OptionsController.state.projectId
      }
    })
  },

  async generateOnRampURL({
    destinationWallets,
    partnerUserId,
    defaultNetwork,
    purchaseAmount,
    paymentAmount
  }: GenerateOnRampUrlArgs) {
    const response = await api.post<{ url: string }>({
      path: `/v1/generators/onrampurl?projectId=${OptionsController.state.projectId}`,
      body: {
        destinationWallets,
        defaultNetwork,
        partnerUserId,
        defaultExperience: 'buy',
        presetCryptoAmount: purchaseAmount,
        presetFiatAmount: paymentAmount
      }
    })

    return response.url
  },

  async getOnrampOptions() {
    try {
      const response = await api.get<{
        paymentCurrencies: PaymentCurrency[]
        purchaseCurrencies: PurchaseCurrency[]
      }>({
        path: `/v1/onramp/options?projectId=${OptionsController.state.projectId}`
      })

      return response
    } catch (e) {
      return DEFAULT_OPTIONS
    }
  },

  async getOnrampQuote({ purchaseCurrency, paymentCurrency, amount, network }: GetQuoteArgs) {
    try {
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
    } catch (e) {
      // Mocking response as 1:1 until endpoint is ready
      return {
        coinbaseFee: { amount, currency: paymentCurrency.id },
        networkFee: { amount, currency: paymentCurrency.id },
        paymentSubtotal: { amount, currency: paymentCurrency.id },
        paymentTotal: { amount, currency: paymentCurrency.id },
        purchaseAmount: { amount, currency: paymentCurrency.id },
        quoteId: 'mocked-quote-id'
      }
    }
  }
}
