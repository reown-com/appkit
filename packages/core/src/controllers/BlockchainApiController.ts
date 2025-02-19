import { proxy } from 'valtio/vanilla'

import type { CaipAddress, CaipNetworkId } from '@reown/appkit-common'

import { ConstantsUtil } from '../utils/ConstantsUtil.js'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { FetchUtil } from '../utils/FetchUtil.js'
import { StorageUtil } from '../utils/StorageUtil.js'
import type {
  BlockchainApiBalanceResponse,
  BlockchainApiGasPriceRequest,
  BlockchainApiGasPriceResponse,
  BlockchainApiGenerateApproveCalldataRequest,
  BlockchainApiGenerateApproveCalldataResponse,
  BlockchainApiGenerateSwapCalldataRequest,
  BlockchainApiGenerateSwapCalldataResponse,
  BlockchainApiIdentityRequest,
  BlockchainApiIdentityResponse,
  BlockchainApiLookupEnsName,
  BlockchainApiRegisterNameParams,
  BlockchainApiSuggestionResponse,
  BlockchainApiSwapAllowanceRequest,
  BlockchainApiSwapAllowanceResponse,
  BlockchainApiSwapQuoteRequest,
  BlockchainApiSwapQuoteResponse,
  BlockchainApiSwapTokensRequest,
  BlockchainApiSwapTokensResponse,
  BlockchainApiTokenPriceRequest,
  BlockchainApiTokenPriceResponse,
  BlockchainApiTransactionsRequest,
  BlockchainApiTransactionsResponse,
  GenerateOnRampUrlArgs,
  GetQuoteArgs,
  OnrampQuote,
  PaymentCurrency,
  PurchaseCurrency
} from '../utils/TypeUtil.js'
import { AccountController } from './AccountController.js'
import { ChainController } from './ChainController.js'
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

export interface BlockchainApiControllerState {
  clientId: string | null
  api: FetchUtil
  supportedChains: { http: CaipNetworkId[]; ws: CaipNetworkId[] }
}

// -- Helpers ------------------------------------------- //
const baseUrl = CoreHelperUtil.getBlockchainApiUrl()

// -- State --------------------------------------------- //
const state = proxy<BlockchainApiControllerState>({
  clientId: null,
  api: new FetchUtil({ baseUrl, clientId: null }),
  supportedChains: { http: [], ws: [] }
})

// -- Controller ---------------------------------------- //
export const BlockchainApiController = {
  state,

  getSdkProperties() {
    const { sdkType, sdkVersion } = OptionsController.state

    return {
      st: sdkType || 'unknown',
      sv: sdkVersion || 'unknown'
    }
  },

  async isNetworkSupported(network?: CaipNetworkId) {
    if (!network) {
      return false
    }
    try {
      if (!state.supportedChains.http.length) {
        await BlockchainApiController.getSupportedNetworks({
          projectId: OptionsController.state.projectId
        })
      }
    } catch (e) {
      return false
    }

    return state.supportedChains.http.includes(network)
  },
  async getSupportedNetworks({ projectId }: { projectId: string }) {
    const supportedChains = await state.api.get<BlockchainApiControllerState['supportedChains']>({
      path: 'v1/supported-chains',
      params: {
        projectId
      }
    })

    state.supportedChains = supportedChains

    return supportedChains
  },
  async fetchIdentity({ address }: BlockchainApiIdentityRequest) {
    const isSupported = await BlockchainApiController.isNetworkSupported(
      ChainController.state.activeCaipNetwork?.caipNetworkId
    )
    if (!isSupported) {
      return { avatar: '', name: '' }
    }

    const identityCache = StorageUtil.getIdentityFromCacheForAddress(address)
    if (identityCache) {
      return identityCache
    }

    const result = await state.api.get<BlockchainApiIdentityResponse>({
      path: `/v1/identity/${address}`,
      params: {
        projectId: OptionsController.state.projectId,
        sender: ChainController.state.activeCaipAddress
          ? CoreHelperUtil.getPlainAddress(ChainController.state.activeCaipAddress)
          : undefined
      }
    })

    StorageUtil.updateIdentityCache({
      address,
      identity: result,
      timestamp: Date.now()
    })

    return result
  },

  async fetchTransactions({
    account,
    projectId,
    cursor,
    onramp,
    signal,
    cache,
    chainId
  }: BlockchainApiTransactionsRequest) {
    const isSupported = await BlockchainApiController.isNetworkSupported(
      ChainController.state.activeCaipNetwork?.caipNetworkId
    )
    if (!isSupported) {
      return { data: [], next: undefined }
    }

    return state.api.get<BlockchainApiTransactionsResponse>({
      path: `/v1/account/${account}/history`,
      params: {
        projectId,
        cursor,
        onramp,
        chainId
      },
      signal,
      cache
    })
  },

  async fetchSwapQuote({
    projectId,
    amount,
    userAddress,
    from,
    to,
    gasPrice
  }: BlockchainApiSwapQuoteRequest) {
    const isSupported = await BlockchainApiController.isNetworkSupported(
      ChainController.state.activeCaipNetwork?.caipNetworkId
    )
    if (!isSupported) {
      return { quotes: [] }
    }

    return state.api.get<BlockchainApiSwapQuoteResponse>({
      path: `/v1/convert/quotes`,
      headers: {
        'Content-Type': 'application/json'
      },
      params: {
        projectId,
        amount,
        userAddress,
        from,
        to,
        gasPrice
      }
    })
  },

  async fetchSwapTokens({
    projectId,
    chainId
  }: BlockchainApiSwapTokensRequest): Promise<BlockchainApiSwapTokensResponse> {
    const isSupported = await BlockchainApiController.isNetworkSupported(
      ChainController.state.activeCaipNetwork?.caipNetworkId
    )
    if (!isSupported) {
      return { tokens: [] }
    }

    return state.api.get<BlockchainApiSwapTokensResponse>({
      path: `/v1/convert/tokens`,
      params: {
        projectId,
        chainId
      }
    })
  },

  async fetchTokenPrice({ projectId, addresses }: BlockchainApiTokenPriceRequest) {
    const isSupported = await BlockchainApiController.isNetworkSupported(
      ChainController.state.activeCaipNetwork?.caipNetworkId
    )
    if (!isSupported) {
      return { fungibles: [] }
    }

    return state.api.post<BlockchainApiTokenPriceResponse>({
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

  async fetchSwapAllowance({
    projectId,
    tokenAddress,
    userAddress
  }: BlockchainApiSwapAllowanceRequest) {
    const { st, sv } = BlockchainApiController.getSdkProperties()

    const isSupported = await BlockchainApiController.isNetworkSupported(
      ChainController.state.activeCaipNetwork?.caipNetworkId
    )
    if (!isSupported) {
      return { allowance: '0' }
    }

    return state.api.get<BlockchainApiSwapAllowanceResponse>({
      path: `/v1/convert/allowance`,
      params: {
        projectId,
        tokenAddress,
        userAddress,
        st,
        sv
      },
      headers: {
        'Content-Type': 'application/json'
      }
    })
  },

  async fetchGasPrice({ projectId, chainId }: BlockchainApiGasPriceRequest) {
    const { st, sv } = BlockchainApiController.getSdkProperties()

    const isSupported = await BlockchainApiController.isNetworkSupported(
      ChainController.state.activeCaipNetwork?.caipNetworkId
    )
    if (!isSupported) {
      throw new Error('Network not supported for Gas Price')
    }

    return state.api.get<BlockchainApiGasPriceResponse>({
      path: `/v1/convert/gas-price`,
      headers: {
        'Content-Type': 'application/json'
      },
      params: {
        projectId,
        chainId,
        st,
        sv
      }
    })
  },

  async generateSwapCalldata({
    amount,
    from,
    projectId,
    to,
    userAddress
  }: BlockchainApiGenerateSwapCalldataRequest) {
    const isSupported = await BlockchainApiController.isNetworkSupported(
      ChainController.state.activeCaipNetwork?.caipNetworkId
    )
    if (!isSupported) {
      throw new Error('Network not supported for Swaps')
    }

    return state.api.post<BlockchainApiGenerateSwapCalldataResponse>({
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

  async generateApproveCalldata({
    from,
    projectId,
    to,
    userAddress
  }: BlockchainApiGenerateApproveCalldataRequest) {
    const { st, sv } = BlockchainApiController.getSdkProperties()

    const isSupported = await BlockchainApiController.isNetworkSupported(
      ChainController.state.activeCaipNetwork?.caipNetworkId
    )
    if (!isSupported) {
      throw new Error('Network not supported for Swaps')
    }

    return state.api.get<BlockchainApiGenerateApproveCalldataResponse>({
      path: `/v1/convert/build-approve`,
      headers: {
        'Content-Type': 'application/json'
      },
      params: {
        projectId,
        userAddress,
        from,
        to,
        st,
        sv
      }
    })
  },

  async getBalance(address: string, chainId?: string, forceUpdate?: string) {
    const { st, sv } = BlockchainApiController.getSdkProperties()

    const isSupported = await BlockchainApiController.isNetworkSupported(
      ChainController.state.activeCaipNetwork?.caipNetworkId
    )
    if (!isSupported) {
      return { balances: [] }
    }
    const caipAddress = `${chainId}:${address}`
    const cachedBalance = StorageUtil.getBalanceCacheForCaipAddress(caipAddress)
    if (cachedBalance) {
      return cachedBalance
    }

    const balance = await state.api.get<BlockchainApiBalanceResponse>({
      path: `/v1/account/${address}/balance`,

      params: {
        currency: 'usd',
        projectId: OptionsController.state.projectId,
        chainId,
        forceUpdate,
        st,
        sv
      }
    })

    StorageUtil.updateBalanceCache({
      caipAddress,
      balance,
      timestamp: Date.now()
    })

    return balance
  },

  async lookupEnsName(name: string) {
    const isSupported = await BlockchainApiController.isNetworkSupported(
      ChainController.state.activeCaipNetwork?.caipNetworkId
    )
    if (!isSupported) {
      return { addresses: {}, attributes: [] }
    }

    return state.api.get<BlockchainApiLookupEnsName>({
      path: `/v1/profile/account/${name}`,
      params: {
        projectId: OptionsController.state.projectId,
        apiVersion: '2'
      }
    })
  },

  async reverseLookupEnsName({ address }: { address: string }) {
    const isSupported = await BlockchainApiController.isNetworkSupported(
      ChainController.state.activeCaipNetwork?.caipNetworkId
    )
    if (!isSupported) {
      return []
    }

    return state.api.get<BlockchainApiLookupEnsName[]>({
      path: `/v1/profile/reverse/${address}`,
      params: {
        sender: AccountController.state.address,
        projectId: OptionsController.state.projectId,
        apiVersion: '2'
      }
    })
  },

  async getEnsNameSuggestions(name: string) {
    const isSupported = await BlockchainApiController.isNetworkSupported(
      ChainController.state.activeCaipNetwork?.caipNetworkId
    )
    if (!isSupported) {
      return { suggestions: [] }
    }

    return state.api.get<BlockchainApiSuggestionResponse>({
      path: `/v1/profile/suggestions/${name}`,
      params: {
        projectId: OptionsController.state.projectId,
        zone: 'reown.id'
      }
    })
  },

  async registerEnsName({
    coinType,
    address,
    message,
    signature
  }: BlockchainApiRegisterNameParams) {
    const isSupported = await BlockchainApiController.isNetworkSupported(
      ChainController.state.activeCaipNetwork?.caipNetworkId
    )
    if (!isSupported) {
      return { success: false }
    }

    return state.api.post({
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
    const isSupported = await BlockchainApiController.isNetworkSupported(
      ChainController.state.activeCaipNetwork?.caipNetworkId
    )
    if (!isSupported) {
      return ''
    }

    const response = await state.api.post<{ url: string }>({
      path: `/v1/generators/onrampurl`,
      params: {
        projectId: OptionsController.state.projectId
      },
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
    const isSupported = await BlockchainApiController.isNetworkSupported(
      ChainController.state.activeCaipNetwork?.caipNetworkId
    )
    if (!isSupported) {
      return { paymentCurrencies: [], purchaseCurrencies: [] }
    }

    try {
      const response = await state.api.get<{
        paymentCurrencies: PaymentCurrency[]
        purchaseCurrencies: PurchaseCurrency[]
      }>({
        path: `/v1/onramp/options`,
        params: {
          projectId: OptionsController.state.projectId
        }
      })

      return response
    } catch (e) {
      return DEFAULT_OPTIONS
    }
  },

  async getOnrampQuote({
    purchaseCurrency,
    paymentCurrency,
    amount,
    network
  }: GetQuoteArgs): Promise<OnrampQuote | null> {
    try {
      const isSupported = await BlockchainApiController.isNetworkSupported(
        ChainController.state.activeCaipNetwork?.caipNetworkId
      )
      if (!isSupported) {
        return null
      }

      const response = await state.api.post<OnrampQuote>({
        path: `/v1/onramp/quote`,
        params: {
          projectId: OptionsController.state.projectId
        },
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
  },

  async getSmartSessions(caipAddress: CaipAddress) {
    const isSupported = await BlockchainApiController.isNetworkSupported(
      ChainController.state.activeCaipNetwork?.caipNetworkId
    )
    if (!isSupported) {
      return []
    }

    return state.api.get({
      path: `/v1/sessions/${caipAddress}`,
      params: {
        projectId: OptionsController.state.projectId
      }
    })
  },
  async revokeSmartSession(address: `0x${string}`, pci: string, signature: string) {
    const isSupported = await BlockchainApiController.isNetworkSupported(
      ChainController.state.activeCaipNetwork?.caipNetworkId
    )
    if (!isSupported) {
      return { success: false }
    }

    return state.api.post({
      path: `/v1/sessions/${address}/revoke`,
      params: {
        projectId: OptionsController.state.projectId
      },
      body: {
        pci,
        signature
      }
    })
  },
  setClientId(clientId: string | null) {
    state.clientId = clientId
    state.api = new FetchUtil({ baseUrl, clientId })
  }
}
