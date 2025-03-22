// Export main client
export { BlockchainApiClient } from '../src/api/BlockchainApiClient.js'

// Export utils
export { StorageUtil } from '../src/utils/StorageUtil.js'
export {
  getPlainAddress,
  getChainIdFromCaipAddress,
  formatCaipAddress,
  isHttpUrl,
  formatAddress
} from '../src/utils/helpers.js'

// Export constants
export { BLOCKCHAIN_API_URL, CACHE_EXPIRY } from '../src/utils/constants.js'

// Export types
export type {
  // Client types
  BlockchainApiClientConfig,
  RequestArgs,
  PostRequestArgs,

  // API Request/Response types
  BlockchainApiIdentityRequest,
  BlockchainApiIdentityResponse,
  BlockchainApiTransactionsRequest,
  BlockchainApiTransactionsResponse,
  BlockchainApiSwapQuoteRequest,
  BlockchainApiSwapQuoteResponse,
  BlockchainApiSwapTokensRequest,
  BlockchainApiSwapTokensResponse,
  BlockchainApiTokenPriceRequest,
  BlockchainApiTokenPriceResponse,
  BlockchainApiSwapAllowanceRequest,
  BlockchainApiSwapAllowanceResponse,
  BlockchainApiGasPriceRequest,
  BlockchainApiGasPriceResponse,
  BlockchainApiGenerateSwapCalldataRequest,
  BlockchainApiGenerateSwapCalldataResponse,
  BlockchainApiGenerateApproveCalldataRequest,
  BlockchainApiGenerateApproveCalldataResponse,
  BlockchainApiBalanceResponse,
  BlockchainApiLookupEnsName,
  BlockchainApiRegisterNameParams,
  BlockchainApiSuggestionResponse,
  BaseError,
  BlockchainApiEnsError,
  GenerateOnRampUrlArgs,
  GetQuoteArgs,
  OnrampQuote,
  PaymentCurrency,
  PurchaseCurrency,
  ReownName,
  SmartSessionResponse,
  SwapToken,
  SwapTokenWithBalance
} from '../src/types/index.js'
