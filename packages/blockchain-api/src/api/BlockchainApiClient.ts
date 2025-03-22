import type { CaipAddress, CaipNetworkId, SdkVersion } from '@reown/appkit-common'

import type {
  BlockchainApiBalanceResponse,
  BlockchainApiClientConfig,
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
  PurchaseCurrency,
  RequestArgs,
  SmartSessionResponse
} from '../types/index.js'
import { FetchUtil } from '../utils/FetchUtil.js'
import { StorageUtil } from '../utils/StorageUtil.js'
import {
  BLOCKCHAIN_API_URL,
  CONVERT_SLIPPAGE_TOLERANCE,
  DEFAULT_ONRAMP_OPTIONS
} from '../utils/constants.js'

export class BlockchainApiClient {
  private api: FetchUtil
  private supportedChains: { http: CaipNetworkId[]; ws: CaipNetworkId[] } = { http: [], ws: [] }

  constructor(config: Partial<BlockchainApiClientConfig> = {}) {
    const baseUrl = config.baseUrl || BLOCKCHAIN_API_URL
    this.api = new FetchUtil({ baseUrl })
  }

  /**
   * Set client ID for the API client
   * @param clientId - The client ID to set
   */
  public setClientId(clientId: string | undefined): void {
    this.api.clientId = clientId
  }

  /**
   * Set project ID for the API client
   * @param projectId - The project ID to set
   */
  public setProjectId(projectId: string): void {
    this.api.projectId = projectId
  }

  /**
   * Set SDK type for the API client
   * @param sdkType - The SDK type to set
   */
  public setSdkType(sdkType: string): void {
    this.api.sdkType = sdkType
  }

  /**
   * Set SDK version for the API client
   * @param sdkVersion - The SDK version to set
   */
  public setSdkVersion(sdkVersion: SdkVersion): void {
    this.api.sdkVersion = sdkVersion
  }

  /**
   * Make a GET request to the blockchain API
   * @param request - Request arguments
   * @returns Promise with the response data
   */
  private async get<T>(request: RequestArgs): Promise<T> {
    const sdkParams = {
      st: this.api.sdkType || 'unknown',
      sv: this.api.sdkVersion || 'unknown'
    }

    const params = {
      ...(request.params || {}),
      ...sdkParams
    }

    return this.api.get<T>({
      ...request,
      params
    })
  }

  /**
   * Check if a network is supported by the blockchain API
   * @param networkId - The CAIP network ID to check
   * @returns Promise resolving to a boolean indicating if the network is supported
   */
  public async isNetworkSupported(networkId?: CaipNetworkId): Promise<boolean> {
    if (!networkId) {
      return false
    }

    try {
      if (!this.supportedChains.http.length) {
        await this.getSupportedNetworks()
      }
    } catch (e) {
      return false
    }

    return this.supportedChains.http.includes(networkId)
  }

  /**
   * Get the list of supported networks
   * @returns Promise resolving to the list of supported networks
   */
  public async getSupportedNetworks(): Promise<{ http: CaipNetworkId[]; ws: CaipNetworkId[] }> {
    const supportedChains = await this.get<{ http: CaipNetworkId[]; ws: CaipNetworkId[] }>({
      path: 'v1/supported-chains'
    })

    this.supportedChains = supportedChains

    return supportedChains
  }

  /**
   * Fetch identity information for an address
   * @param params - Request parameters including address and network ID
   * @returns Promise resolving to identity information
   */
  public async fetchIdentity(
    params: BlockchainApiIdentityRequest & { caipNetworkId: CaipNetworkId }
  ): Promise<BlockchainApiIdentityResponse> {
    const { address, caipNetworkId } = params

    const isSupported = await this.isNetworkSupported(caipNetworkId)
    if (!isSupported) {
      return { avatar: '', name: '' }
    }

    const identityCache = StorageUtil.getIdentityFromCacheForAddress(address)
    if (identityCache) {
      return identityCache
    }

    const result = await this.get<BlockchainApiIdentityResponse>({
      path: `/v1/identity/${address}`
    })

    StorageUtil.updateIdentityCache({
      address,
      identity: result,
      timestamp: Date.now()
    })

    return result
  }

  /**
   * Fetch transaction history for an account
   * @param params - Request parameters
   * @returns Promise resolving to transaction data
   */
  public async fetchTransactions(
    params: BlockchainApiTransactionsRequest
  ): Promise<BlockchainApiTransactionsResponse> {
    const { account, cursor, onramp, signal, cache, chainId } = params

    return this.get<BlockchainApiTransactionsResponse>({
      path: `/v1/account/${account}/history`,
      params: {
        cursor,
        onramp,
        chainId
      },
      signal,
      cache
    })
  }

  /**
   * Fetch swap quotes for token exchange
   * @param params - Swap quote request parameters
   * @returns Promise resolving to swap quotes
   */
  public async fetchSwapQuote(
    params: BlockchainApiSwapQuoteRequest
  ): Promise<BlockchainApiSwapQuoteResponse> {
    const { amount, userAddress, from, to, gasPrice } = params

    return this.get<BlockchainApiSwapQuoteResponse>({
      path: `/v1/convert/quotes`,
      headers: {
        'Content-Type': 'application/json'
      },
      params: {
        amount,
        userAddress,
        from,
        to,
        gasPrice
      }
    })
  }

  /**
   * Fetch available tokens for swapping
   * @param params - Request parameters with chain ID
   * @returns Promise resolving to available tokens
   */
  public async fetchSwapTokens(
    params: BlockchainApiSwapTokensRequest
  ): Promise<BlockchainApiSwapTokensResponse> {
    const { chainId } = params

    return this.get<BlockchainApiSwapTokensResponse>({
      path: `/v1/convert/tokens`,
      params: { chainId }
    })
  }

  /**
   * Fetch token prices
   * @param params - Token price request parameters
   * @returns Promise resolving to token prices
   */
  public async fetchTokenPrice(
    params: BlockchainApiTokenPriceRequest
  ): Promise<BlockchainApiTokenPriceResponse> {
    const { addresses } = params

    return this.api.post<BlockchainApiTokenPriceResponse>({
      path: '/v1/fungible/price',
      body: {
        currency: 'usd',
        addresses,
        projectId: this.api.projectId
      },
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  /**
   * Fetch swap allowance for a token
   * @param params - Swap allowance request parameters
   * @returns Promise resolving to allowance information
   */
  public async fetchSwapAllowance(
    params: BlockchainApiSwapAllowanceRequest
  ): Promise<BlockchainApiSwapAllowanceResponse> {
    const { tokenAddress, userAddress } = params

    return this.get<BlockchainApiSwapAllowanceResponse>({
      path: `/v1/convert/allowance`,
      params: {
        tokenAddress,
        userAddress
      },
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  /**
   * Fetch gas price for a chain
   * @param params - Gas price request parameters
   * @returns Promise resolving to gas price information
   */
  public async fetchGasPrice(
    params: BlockchainApiGasPriceRequest
  ): Promise<BlockchainApiGasPriceResponse> {
    const { chainId } = params

    return this.get<BlockchainApiGasPriceResponse>({
      path: `/v1/convert/gas-price`,
      headers: {
        'Content-Type': 'application/json'
      },
      params: {
        chainId
      }
    })
  }

  /**
   * Generate calldata for swap transaction
   * @param params - Swap calldata request parameters
   * @returns Promise resolving to calldata
   */
  public async generateSwapCalldata(
    params: BlockchainApiGenerateSwapCalldataRequest
  ): Promise<BlockchainApiGenerateSwapCalldataResponse> {
    const { amount, from, to, userAddress } = params

    return this.api.post<BlockchainApiGenerateSwapCalldataResponse>({
      path: '/v1/convert/build-transaction',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        amount,
        eip155: {
          slippage: CONVERT_SLIPPAGE_TOLERANCE
        },
        projectId: this.api.projectId,
        from,
        to,
        userAddress
      }
    })
  }

  /**
   * Generate calldata for token approval
   * @param params - Approve calldata request parameters
   * @returns Promise resolving to calldata
   */
  public async generateApproveCalldata(
    params: BlockchainApiGenerateApproveCalldataRequest
  ): Promise<BlockchainApiGenerateApproveCalldataResponse> {
    const { from, to, userAddress } = params

    return this.get<BlockchainApiGenerateApproveCalldataResponse>({
      path: `/v1/convert/build-approve`,
      headers: {
        'Content-Type': 'application/json'
      },
      params: {
        userAddress,
        from,
        to
      }
    })
  }

  /**
   * Get account balance
   * @param address - The account address
   * @param chainId - Optional chain ID
   * @param forceUpdate - Optional flag to force update
   * @returns Promise resolving to balance information
   */
  public async getBalance(
    address: string,
    chainId?: string,
    forceUpdate?: string
  ): Promise<BlockchainApiBalanceResponse> {
    const caipAddress = chainId ? `${chainId}:${address}` : address
    const cachedBalance = StorageUtil.getBalanceCacheForCaipAddress(caipAddress)

    if (cachedBalance) {
      return cachedBalance
    }

    const balance = await this.get<BlockchainApiBalanceResponse>({
      path: `/v1/account/${address}/balance`,
      params: {
        currency: 'usd',
        chainId,
        forceUpdate
      }
    })

    StorageUtil.updateBalanceCache({
      caipAddress,
      balance,
      timestamp: Date.now()
    })

    return balance
  }

  /**
   * Lookup ENS name
   * @param name - The ENS name to lookup
   * @returns Promise resolving to ENS lookup information
   */
  public async lookupEnsName(name: string): Promise<BlockchainApiLookupEnsName> {
    return this.get<BlockchainApiLookupEnsName>({
      path: `/v1/profile/account/${name}`,
      params: { apiVersion: '2' }
    })
  }

  /**
   * Reverse lookup ENS name
   * @param params - Parameters containing the address to lookup
   * @returns Promise resolving to ENS names
   */
  public async reverseLookupEnsName(params: {
    address: string
    sender?: string
  }): Promise<BlockchainApiLookupEnsName[]> {
    const { address, sender } = params

    return this.get<BlockchainApiLookupEnsName[]>({
      path: `/v1/profile/reverse/${address}`,
      params: {
        sender,
        apiVersion: '2'
      }
    })
  }

  /**
   * Get ENS name suggestions
   * @param name - The name to get suggestions for
   * @returns Promise resolving to suggestions
   */
  public async getEnsNameSuggestions(name: string): Promise<BlockchainApiSuggestionResponse> {
    return this.get<BlockchainApiSuggestionResponse>({
      path: `/v1/profile/suggestions/${name}`,
      params: { zone: 'reown.id' }
    })
  }

  /**
   * Register ENS name
   * @param params - Registration parameters
   * @returns Promise resolving to registration result
   */
  public async registerEnsName(
    params: BlockchainApiRegisterNameParams
  ): Promise<{ success: boolean }> {
    const { coinType, address, message, signature } = params

    return this.api.post<{ success: boolean }>({
      path: `/v1/profile/account`,
      body: { coin_type: coinType, address, message, signature },
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  /**
   * Generate on-ramp URL
   * @param params - On-ramp URL parameters
   * @returns Promise resolving to on-ramp URL
   */
  public async generateOnRampURL(params: GenerateOnRampUrlArgs): Promise<string> {
    const { destinationWallets, partnerUserId, defaultNetwork, purchaseAmount, paymentAmount } =
      params

    const response = await this.api.post<{ url: string }>({
      path: `/v1/generators/onrampurl`,
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
  }

  /**
   * Get on-ramp options
   * @returns Promise resolving to on-ramp options
   */
  public async getOnrampOptions(): Promise<{
    paymentCurrencies: PaymentCurrency[]
    purchaseCurrencies: PurchaseCurrency[]
  }> {
    try {
      const response = await this.get<{
        paymentCurrencies: PaymentCurrency[]
        purchaseCurrencies: PurchaseCurrency[]
      }>({
        path: `/v1/onramp/options`
      })

      return response
    } catch (e) {
      return DEFAULT_ONRAMP_OPTIONS
    }
  }

  /**
   * Get on-ramp quote
   * @param params - Quote parameters
   * @returns Promise resolving to quote
   */
  public async getOnrampQuote(params: GetQuoteArgs): Promise<OnrampQuote | null> {
    try {
      const { purchaseCurrency, paymentCurrency, amount, network } = params

      const response = await this.api.post<OnrampQuote>({
        path: `/v1/onramp/quote`,
        params: {
          projectId: this.api.projectId
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
      return null
    }
  }

  /**
   * Get smart sessions for an address
   * @param caipAddress - The CAIP address
   * @returns Promise resolving to smart sessions
   */
  public async getSmartSessions(caipAddress: CaipAddress): Promise<SmartSessionResponse> {
    try {
      const response = await this.get<SmartSessionResponse>({
        path: `/v1/sessions/${caipAddress}`
      })

      return response
    } catch (error) {
      return { pcis: [] } as SmartSessionResponse
    }
  }

  /**
   * Revoke a smart session
   * @param address - The address
   * @param pci - The PCI
   * @param signature - The signature
   * @returns Promise resolving to revocation result
   */
  public async revokeSmartSession(
    address: `0x${string}`,
    pci: string,
    signature: string
  ): Promise<{ success: boolean }> {
    return this.api.post<{ success: boolean }>({
      path: `/v1/sessions/${address}/revoke`,
      params: {
        projectId: this.api.projectId
      },
      body: {
        pci,
        signature
      }
    })
  }
}
