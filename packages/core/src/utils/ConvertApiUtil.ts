import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { NetworkController } from '../controllers/NetworkController.js'
import { FetchUtil } from '../utils/FetchUtil.js'
import { AccountController } from '../controllers/AccountController.js'
import { ConnectionController } from '../controllers/ConnectionController.js'
import { ConstantsUtil } from '../utils/ConstantsUtil.js'
import { BlockchainApiController } from '../controllers/BlockchainApiController.js'
import { OptionsController } from '../controllers/OptionsController.js'

const ONEINCH_API_BASE_URL = 'https://1inch-swap-proxy.walletconnect-v1-bridge.workers.dev'

function get1InchEndpoints(chainId: number, address: string | undefined) {
  return {
    approveTransaction: `/swap/v5.2/${chainId}/approve/transaction`,
    approveAllowance: `/swap/v5.2/${chainId}/approve/allowance`,
    gas: `/gas-price/v1.5/${chainId}`,
    gasPrice: `/gas-price/v1.5/${chainId}`,
    swap: `/swap/v5.2/${chainId}/swap`,
    tokens: `/swap/v5.2/${chainId}/tokens`,
    tokensCustom: `/token/v1.2/${chainId}/custom`,
    tokensPrices: `/price/v1.1/${chainId}`,
    search: `/token/v1.2/${chainId}/search`,
    balance: `/balance/v1.2/${chainId}/balances/${address}`,
    quote: `/swap/v6.0/${chainId}/quote`
  }
}

// -- Types --------------------------------------------- //
export type TokenInfo = {
  address: `0x${string}`
  symbol: string
  name: string
  decimals: number
  logoURI: string
  domainVersion?: string
  eip2612?: boolean
  isFoT?: boolean
  tags?: string[]
}

export interface TokenInfoWithPrice extends TokenInfo {
  price: string
}

export interface TokenInfoWithBalance extends TokenInfo {
  balance: string
  price: string
}

export type SwapApprovalData = {
  data: `0x${string}`
  to: `0x${string}`
  gasPrice: string
  value: string
}

export type TokenList = {
  tokens: Record<string, TokenInfo>
}

export type GetAllowanceParams = {
  fromAddress: string
  sourceTokenAddress: string
  sourceTokenAmount: string
  sourceTokenDecimals: number
}

export type GetApprovalParams = {
  sourceTokenAddress: string
  sourceTokenAmount?: string
}

export type GetConvertDataParams = {
  sourceTokenAddress: string
  toTokenAddress: string
  sourceTokenAmount: string
  fromAddress: string
  decimals: number
}

export type TransactionData = {
  from: string
  to: `0x${string}`
  data: `0x${string}`
  value: string
  gas: bigint
  gasPrice: string
}

export type GetConvertDataResponse = {
  toAmount: string
  tx: TransactionData
}

export type GetGasPricesResponse = {
  baseFree: string
  low: {
    maxPriorityFeePerGas: string
    maxFeePerGas: string
  }
  medium: {
    maxPriorityFeePerGas: string
    maxFeePerGas: string
  }
  high: {
    maxPriorityFeePerGas: string
    maxFeePerGas: string
  }
  instant: {
    maxPriorityFeePerGas: string
    maxFeePerGas: string
  }
}

// -- Controller ---------------------------------------- //
export const ConvertApiUtil = {
  get1InchAPI() {
    const api = new FetchUtil({ baseUrl: ONEINCH_API_BASE_URL })
    const chainId = CoreHelperUtil.getEvmChainId(NetworkController.state.caipNetwork?.id)
    const { address } = AccountController.state

    const endpoints = get1InchEndpoints(chainId, address)

    return {
      api,
      paths: {
        approveTransaction: endpoints.approveTransaction,
        approveAllowance: endpoints.approveAllowance,
        gas: endpoints.gasPrice,
        gasPrice: endpoints.gasPrice,
        swap: endpoints.swap,
        tokens: endpoints.tokens,
        tokensCustom: endpoints.tokensCustom,
        tokenPrices: endpoints.tokensPrices,
        search: endpoints.search,
        balance: endpoints.balance,
        quote: endpoints.quote
      }
    }
  },

  async getGasPrice() {
    const { api, paths } = this.get1InchAPI()

    const gasPrices = await api.get<GetGasPricesResponse>({
      path: paths.gasPrice,
      headers: { 'content-type': 'application/json' }
    })

    return gasPrices
  },

  async checkConvertAllowance({
    fromAddress,
    sourceTokenAddress,
    sourceTokenAmount,
    sourceTokenDecimals
  }: GetAllowanceParams) {
    const { api, paths } = this.get1InchAPI()

    const res = await api.get<{ allowance: string }>({
      path: paths.approveAllowance,
      params: { tokenAddress: sourceTokenAddress, walletAddress: fromAddress }
    })

    if (res?.allowance && sourceTokenAmount && sourceTokenDecimals) {
      const parsedValue = ConnectionController.parseUnits(sourceTokenAmount, sourceTokenDecimals)
      const hasAllowance = BigInt(res.allowance) >= parsedValue

      return hasAllowance
    }

    return false
  },

  async getTokenList() {
    const response = await BlockchainApiController.fetchConvertTokens({
      chainId: NetworkController.state.caipNetwork?.id,
      projectId: OptionsController.state.projectId
    })

    return response
  },

  async searchTokens(searchTerm: string) {
    const { api, paths } = this.get1InchAPI()

    return await api.get<TokenInfo[]>({
      path: paths.search,
      params: { query: searchTerm }
    })
  },

  async getMyTokensWithBalance() {
    const response = await BlockchainApiController.getBalance(
      // @ts-ignore
      AccountController.state.address,
      NetworkController.state.caipNetwork?.id
    )
    const balances = response.balances
    //     name - Token name.
    // symbol - Token symbol.
    // address - Contract address of the token in CAIP-10 format.
    // decimals - Number of decimals for amount supported by a given token.
    // logoUri - URL of the token icon.
    // eip2612 - (Optional for ERC-20 tokens) value is true if the token supports eip-2612

    const tokens = balances.map(balance => {
      return {
        address: balance.address,
        symbol: balance.symbol,
        name: balance.name,
        decimals: parseInt(balance.quantity.decimals),
        logoUri: balance.iconUrl,
        eip2612: false,
        // balance fields
        quantity: {
          numeric: balance.quantity.numeric,
          decimals: balance.quantity.decimals
        },
        price: balance.price,
        value: balance.value
      }
    })

    // const nonEmptyBalances = balances.filter(balance => {
    //   if (balance.quantity.numeric !== '0') {
    //     return true
    //   }

    //   return false
    // })

    return tokens
  },

  async getBalances() {},

  async getTokenInfoWithAddresses(addresses: string[]) {
    const { api, paths } = this.get1InchAPI()

    return api.get<Record<string, TokenInfo>>({
      path: paths.tokensCustom,
      params: { addresses: addresses.join(',') }
    })
  },

  async getTokenPriceWithAddresses(addresses: string[]) {
    const { api, paths } = this.get1InchAPI()

    return await api.post<Record<string, string>>({
      path: paths.tokenPrices,
      body: { tokens: addresses, currency: 'USD' },
      headers: {
        'content-type': 'application/json'
      }
    })
  },

  mergeTokensWithBalanceAndPrice(
    tokens: Record<string, TokenInfo>,
    balances: Record<string, string>,
    tokensPrice: Record<string, string>
  ) {
    const mergedTokens = Object.entries(tokens).reduce<Record<string, TokenInfoWithBalance>>(
      (_mergedTokens, [tokenAddress, tokenInfo]) => {
        _mergedTokens[tokenAddress] = {
          ...tokenInfo,
          balance: ConnectionController.formatUnits(
            BigInt(balances[tokenAddress] ?? '0'),
            tokenInfo.decimals
          ),
          price: tokensPrice[tokenAddress] ?? '0'
        }

        return _mergedTokens
      },
      {}
    )

    return mergedTokens
  },

  async getConvertData({
    sourceTokenAddress,
    toTokenAddress,
    sourceTokenAmount,
    fromAddress,
    decimals = 9
  }: GetConvertDataParams): Promise<GetConvertDataResponse> {
    const { api, paths } = this.get1InchAPI()

    return await api.get({
      path: paths.swap,
      params: {
        src: sourceTokenAddress,
        dst: toTokenAddress,
        slippage: ConstantsUtil.CONVERT_SLIPPAGE_TOLERANCE,
        from: fromAddress,
        amount: ConnectionController.parseUnits(sourceTokenAmount, decimals).toString()
      }
    })
  },

  async getConvertApprovalData({ sourceTokenAddress }: GetApprovalParams) {
    const { api, paths } = this.get1InchAPI()

    return await api.get<SwapApprovalData>({
      path: paths.approveTransaction,
      params: {
        tokenAddress: sourceTokenAddress
      }
    })
  },

  async getQuoteApprovalData({
    sourceTokenAddress,
    toTokenAddress,
    sourceTokenAmount,
    fromAddress,
    decimals = 9
  }: GetConvertDataParams): Promise<GetConvertDataResponse> {
    const { api, paths } = this.get1InchAPI()

    return await api.get({
      path: paths.quote,
      params: {
        src: sourceTokenAddress,
        dst: toTokenAddress,
        slippage: ConstantsUtil.CONVERT_SLIPPAGE_TOLERANCE,
        from: fromAddress,
        amount: ConnectionController.parseUnits(sourceTokenAmount, decimals).toString()
      }
    })
  }
}
