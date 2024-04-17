import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { NetworkController } from '../controllers/NetworkController.js'
import { FetchUtil } from '../utils/FetchUtil.js'
import { AccountController } from '../controllers/AccountController.js'
import { ConnectionController } from '../controllers/ConnectionController.js'
import { ConstantsUtil } from '../utils/ConstantsUtil.js'
import { BlockchainApiController } from '../controllers/BlockchainApiController.js'
import type { ConvertTokenWithBalance } from './TypeUtil.js'
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

  async getTokenList() {
    const response = await await BlockchainApiController.fetchConvertTokens({
      chainId: NetworkController.state.caipNetwork?.id,
      projectId: OptionsController.state.projectId
    })

    const tokens = response.tokens.map(token => {
      return {
        ...token,
        eip2612: false,
        quantity: {
          decimals: '0',
          numeric: '0'
        },
        price: 0,
        value: 0
      } as ConvertTokenWithBalance
    })

    return tokens
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

  async getMyTokensWithBalance() {
    const response = await BlockchainApiController.getBalance(
      // @ts-ignore
      AccountController.state.address,
      NetworkController.state.caipNetwork?.id
    )
    const balances = response.balances

    const tokens = balances.map(token => {
      return {
        symbol: token.symbol,
        name: token.name,
        address: !!token.address
          ? token.address
          : `${NetworkController.state.caipNetwork?.id}:${ConstantsUtil.NATIVE_TOKEN_ADDRESS}`,
        decimals: parseInt(token.quantity.decimals),
        logoUri: token.iconUrl,
        eip2612: false,
        quantity: token.quantity,
        price: token.price,
        value: token.value
      } as ConvertTokenWithBalance
    })

    return tokens
  },

  async getTokenPriceWithAddresses(addresses: string[]) {
    const { api, paths } = this.get1InchAPI()

    const values = await api.post<Record<string, string>>({
      path: paths.tokenPrices,
      body: { tokens: addresses, currency: 'USD' },
      headers: {
        'content-type': 'application/json'
      }
    })

    // return same values but update the keys with `eip155:137:` prefix to mimic blockchain api response
    return Object.entries(values).reduce<Record<string, string>>((_values, [key, value]) => {
      _values[`${NetworkController.state.caipNetwork?.id}:${key}`] = value

      return _values
    }, {})
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
  }
}
