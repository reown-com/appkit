import { proxy } from 'valtio/vanilla'

import {
  BlockchainApiClient,
  type BlockchainApiGasPriceRequest,
  type BlockchainApiGenerateApproveCalldataRequest,
  type BlockchainApiGenerateSwapCalldataRequest,
  type BlockchainApiIdentityRequest,
  type BlockchainApiRegisterNameParams,
  type BlockchainApiSwapAllowanceRequest,
  type BlockchainApiSwapQuoteRequest,
  type BlockchainApiSwapTokensRequest,
  type BlockchainApiSwapTokensResponse,
  type BlockchainApiTokenPriceRequest,
  type BlockchainApiTransactionsRequest,
  type GenerateOnRampUrlArgs,
  type GetQuoteArgs,
  type OnrampQuote,
  type SmartSessionResponse
} from '@reown/appkit-blockchain-api'
import type { CaipAddress, CaipNetworkId } from '@reown/appkit-common'

import { StorageUtil } from '../utils/StorageUtil.js'
import { AccountController } from './AccountController.js'
import { ChainController } from './ChainController.js'
import { OptionsController } from './OptionsController.js'
import { SnackController } from './SnackController.js'

export interface BlockchainApiControllerState {
  clientId: string | null
  client: BlockchainApiClient
  supportedChains: { http: CaipNetworkId[]; ws: CaipNetworkId[] }
}

// -- State --------------------------------------------- //
const state = proxy<BlockchainApiControllerState>({
  clientId: null,
  client: new BlockchainApiClient({
    projectId: OptionsController.state.projectId,
    sdkType: OptionsController.state.sdkType,
    sdkVersion: OptionsController.state.sdkVersion
  }),
  supportedChains: { http: [], ws: [] }
})

// -- Controller ---------------------------------------- //
export const BlockchainApiController = {
  state,

  initializeClient() {
    state.client.setProjectId(OptionsController.state.projectId)
    state.client.setSdkType(OptionsController.state.sdkType)
    state.client.setSdkVersion(OptionsController.state.sdkVersion)
  },

  async isNetworkSupported(networkId?: CaipNetworkId) {
    if (!networkId) {
      return false
    }

    return state.client.isNetworkSupported(networkId)
  },

  async getSupportedNetworks() {
    const supportedChains = await state.client.getSupportedNetworks()

    state.supportedChains = supportedChains

    return supportedChains
  },

  async fetchIdentity({
    address,
    caipNetworkId
  }: BlockchainApiIdentityRequest & {
    caipNetworkId: CaipNetworkId
  }) {
    const isSupported = await BlockchainApiController.isNetworkSupported(caipNetworkId)

    if (!isSupported) {
      return { avatar: '', name: '' }
    }

    const identityCache = StorageUtil.getIdentityFromCacheForAddress(address)
    if (identityCache) {
      return identityCache
    }

    const result = await state.client.fetchIdentity({ address, caipNetworkId })

    StorageUtil.updateIdentityCache({
      address,
      identity: result,
      timestamp: Date.now()
    })

    return result
  },

  async fetchTransactions({
    account,
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

    return state.client.fetchTransactions({
      account,
      cursor,
      onramp,
      signal,
      cache,
      chainId
    })
  },

  async fetchSwapQuote({ amount, userAddress, from, to, gasPrice }: BlockchainApiSwapQuoteRequest) {
    const isSupported = await BlockchainApiController.isNetworkSupported(
      ChainController.state.activeCaipNetwork?.caipNetworkId
    )
    if (!isSupported) {
      return { quotes: [] }
    }

    return state.client.fetchSwapQuote({ amount, userAddress, from, to, gasPrice })
  },

  async fetchSwapTokens({
    chainId
  }: BlockchainApiSwapTokensRequest): Promise<BlockchainApiSwapTokensResponse> {
    const isSupported = await BlockchainApiController.isNetworkSupported(
      ChainController.state.activeCaipNetwork?.caipNetworkId
    )
    if (!isSupported) {
      return { tokens: [] }
    }

    return state.client.fetchSwapTokens({ chainId })
  },

  async fetchTokenPrice({ addresses }: BlockchainApiTokenPriceRequest) {
    const isSupported = await BlockchainApiController.isNetworkSupported(
      ChainController.state.activeCaipNetwork?.caipNetworkId
    )
    if (!isSupported) {
      return { fungibles: [] }
    }

    return state.client.fetchTokenPrice({ addresses })
  },

  async fetchSwapAllowance({ tokenAddress, userAddress }: BlockchainApiSwapAllowanceRequest) {
    const isSupported = await BlockchainApiController.isNetworkSupported(
      ChainController.state.activeCaipNetwork?.caipNetworkId
    )
    if (!isSupported) {
      return { allowance: '0' }
    }

    return state.client.fetchSwapAllowance({ tokenAddress, userAddress })
  },

  async fetchGasPrice({ chainId }: BlockchainApiGasPriceRequest) {
    const isSupported = await BlockchainApiController.isNetworkSupported(
      ChainController.state.activeCaipNetwork?.caipNetworkId
    )
    if (!isSupported) {
      throw new Error('Network not supported for Gas Price')
    }

    return state.client.fetchGasPrice({ chainId })
  },

  async generateSwapCalldata({
    amount,
    from,
    to,
    userAddress,
    disableEstimate
  }: BlockchainApiGenerateSwapCalldataRequest) {
    const isSupported = await BlockchainApiController.isNetworkSupported(
      ChainController.state.activeCaipNetwork?.caipNetworkId
    )
    if (!isSupported) {
      throw new Error('Network not supported for Swaps')
    }

    return state.client.generateSwapCalldata({ amount, from, to, userAddress, disableEstimate })
  },

  async generateApproveCalldata({
    from,
    to,
    userAddress
  }: BlockchainApiGenerateApproveCalldataRequest) {
    const isSupported = await BlockchainApiController.isNetworkSupported(
      ChainController.state.activeCaipNetwork?.caipNetworkId
    )
    if (!isSupported) {
      throw new Error('Network not supported for Swaps')
    }

    return state.client.generateApproveCalldata({ from, to, userAddress })
  },

  async getBalance(address: string, chainId?: string, forceUpdate?: string) {
    const isSupported = await BlockchainApiController.isNetworkSupported(
      ChainController.state.activeCaipNetwork?.caipNetworkId
    )
    if (!isSupported) {
      SnackController.showError('Token Balance Unavailable')
      return { balances: [] }
    }

    return state.client.getBalance(address, chainId, forceUpdate)
  },

  async lookupEnsName(name: string) {
    const isSupported = await BlockchainApiController.isNetworkSupported(
      ChainController.state.activeCaipNetwork?.caipNetworkId
    )
    if (!isSupported) {
      return { addresses: {}, attributes: [] }
    }

    return state.client.lookupEnsName(name)
  },

  async reverseLookupEnsName({ address }: { address: string }) {
    const isSupported = await BlockchainApiController.isNetworkSupported(
      ChainController.state.activeCaipNetwork?.caipNetworkId
    )
    if (!isSupported) {
      return []
    }

    const sender = AccountController.state.address

    return state.client.reverseLookupEnsName({ address, sender })
  },

  async getEnsNameSuggestions(name: string) {
    const isSupported = await BlockchainApiController.isNetworkSupported(
      ChainController.state.activeCaipNetwork?.caipNetworkId
    )
    if (!isSupported) {
      return { suggestions: [] }
    }

    return state.client.getEnsNameSuggestions(name)
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

    return state.client.registerEnsName({ coinType, address, message, signature })
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

    return state.client.generateOnRampURL({
      destinationWallets,
      partnerUserId,
      defaultNetwork,
      purchaseAmount,
      paymentAmount
    })
  },

  async getOnrampOptions() {
    const isSupported = await BlockchainApiController.isNetworkSupported(
      ChainController.state.activeCaipNetwork?.caipNetworkId
    )
    if (!isSupported) {
      return { paymentCurrencies: [], purchaseCurrencies: [] }
    }

    return state.client.getOnrampOptions()
  },

  async getOnrampQuote({
    purchaseCurrency,
    paymentCurrency,
    amount,
    network
  }: GetQuoteArgs): Promise<OnrampQuote | null> {
    const isSupported = await BlockchainApiController.isNetworkSupported(
      ChainController.state.activeCaipNetwork?.caipNetworkId
    )
    if (!isSupported) {
      return null
    }

    return state.client.getOnrampQuote({
      purchaseCurrency,
      paymentCurrency,
      amount,
      network
    })
  },

  async getSmartSessions(caipAddress: CaipAddress) {
    const isSupported = await BlockchainApiController.isNetworkSupported(
      ChainController.state.activeCaipNetwork?.caipNetworkId
    )

    if (!isSupported) {
      return {
        pcis: []
      } as SmartSessionResponse
    }

    return state.client.getSmartSessions(caipAddress)
  },

  async revokeSmartSession(address: `0x${string}`, pci: string, signature: string) {
    const isSupported = await BlockchainApiController.isNetworkSupported(
      ChainController.state.activeCaipNetwork?.caipNetworkId
    )
    if (!isSupported) {
      return { success: false }
    }

    return state.client.revokeSmartSession(address, pci, signature)
  },

  setClientId(clientId: string | undefined) {
    state.client.setClientId(clientId)
  }
}
