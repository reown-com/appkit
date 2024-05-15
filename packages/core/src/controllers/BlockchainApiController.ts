import { ConstantsUtil } from '../utils/ConstantsUtil.js'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { FetchUtil } from '../utils/FetchUtil.js'
import type {
  BlockchainApiTransactionsRequest,
  BlockchainApiTransactionsResponse,
  BlockchainApiSwapTokensRequest,
  BlockchainApiSwapTokensResponse,
  BlockchainApiGenerateSwapCalldataRequest,
  BlockchainApiGenerateSwapCalldataResponse,
  BlockchainApiGenerateApproveCalldataRequest,
  BlockchainApiGenerateApproveCalldataResponse,
  BlockchainApiSwapAllowanceRequest,
  BlockchainApiSwapAllowanceResponse,
  BlockchainApiGasPriceRequest,
  BlockchainApiGasPriceResponse,
  BlockchainApiTokenPriceRequest,
  BlockchainApiTokenPriceResponse,
  BlockchainApiIdentityRequest,
  BlockchainApiIdentityResponse,
  GenerateOnRampUrlArgs,
  GetQuoteArgs,
  OnrampQuote,
  PaymentCurrency,
  PurchaseCurrency,
  BlockchainApiBalanceResponse,
  BlockchainApiLookupEnsName,
  BlockchainApiSuggestionResponse,
  BlockchainApiRegisterNameParams
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
  fetchIdentity({ address }: BlockchainApiIdentityRequest) {
    return api.get<BlockchainApiIdentityResponse>({
      path: `/v1/identity/${address}`,
      params: {
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

  fetchSwapTokens({ projectId, chainId }: BlockchainApiSwapTokensRequest) {
    return api.get<BlockchainApiSwapTokensResponse>({
      path: `/v1/convert/tokens?projectId=${projectId}&chainId=${chainId}`
    })
  },

  fetchTokenPrice({ projectId, addresses }: BlockchainApiTokenPriceRequest) {
    return api.post<BlockchainApiTokenPriceResponse>({
      path: '/v1/fungible/price',
      body: {
        projectId,
        currency: 'usd',
        addresses
      },
      headers: {
        'Content-Type': 'application/json'
      }
    })
  },

  fetchSwapAllowance({ projectId, tokenAddress, userAddress }: BlockchainApiSwapAllowanceRequest) {
    const { sdkType, sdkVersion } = OptionsController.state

    return api.get<BlockchainApiSwapAllowanceResponse>({
      path: `/v1/convert/allowance?projectId=${projectId}&tokenAddress=${tokenAddress}&userAddress=${userAddress}`,
      headers: {
        'Content-Type': 'application/json',
        'x-sdk-type': sdkType,
        'x-sdk-version': sdkVersion
      }
    })
  },

  fetchGasPrice({ projectId, chainId }: BlockchainApiGasPriceRequest) {
    const { sdkType, sdkVersion } = OptionsController.state

    return api.get<BlockchainApiGasPriceResponse>({
      path: `/v1/convert/gas-price?projectId=${projectId}&chainId=${chainId}`,
      headers: {
        'Content-Type': 'application/json',
        'x-sdk-type': sdkType,
        'x-sdk-version': sdkVersion
      }
    })
  },

  generateSwapCalldata({
    amount,
    from,
    projectId,
    to,
    userAddress
  }: BlockchainApiGenerateSwapCalldataRequest) {
    return api.post<BlockchainApiGenerateSwapCalldataResponse>({
      path: '/v1/convert/build-transaction',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        amount,
        eip155: {
          slippage: ConstantsUtil.CONVERT_SLIPPAGE_TOLERANCE
        },
        from,
        projectId,
        to,
        userAddress
      }
    })
  },

  generateApproveCalldata({
    from,
    projectId,
    to,
    userAddress
  }: BlockchainApiGenerateApproveCalldataRequest) {
    const { sdkType, sdkVersion } = OptionsController.state

    return api.get<BlockchainApiGenerateApproveCalldataResponse>({
      path: `/v1/convert/build-approve?projectId=${projectId}&userAddress=${userAddress}&from=${from}&to=${to}`,
      headers: {
        'Content-Type': 'application/json',
        'x-sdk-type': sdkType,
        'x-sdk-version': sdkVersion
      }
    })
  },

  async getBalance(address: string, chainId?: string) {
    const { sdkType, sdkVersion } = OptionsController.state

    return api.get<BlockchainApiBalanceResponse>({
      path: `/v1/account/${address}/balance`,
      headers: {
        'x-sdk-type': sdkType,
        'x-sdk-version': sdkVersion
      },
      params: {
        currency: 'usd',
        projectId: OptionsController.state.projectId,
        chainId
      }
    })
  },

  async lookupEnsName(name: string) {
    return api.get<BlockchainApiLookupEnsName>({
      path: `/v1/profile/account/${name}.wcn.id?projectId=${OptionsController.state.projectId}`
    })
  },

  async reverseLookupEnsName({ address }: { address: string }) {
    // Should add /coinType subroute once ready in BlockchainApi
    return api.get<BlockchainApiLookupEnsName[]>({
      path: `/v1/profile/reverse/${address}?projectId=${OptionsController.state.projectId}`
    })
  },

  async getEnsNameSuggestions(name: string) {
    return api.get<BlockchainApiSuggestionResponse>({
      path: `/v1/profile/suggestions/${name}?projectId=${OptionsController.state.projectId}`
    })
  },

  async registerEnsName({
    coinType,
    address,
    message,
    signature
  }: BlockchainApiRegisterNameParams) {
    return api.post({
      path: `/v1/profile/account`,
      body: { coin_type: coinType, address, message, signature },
      headers: {
        'Content-Type': 'application/json'
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
