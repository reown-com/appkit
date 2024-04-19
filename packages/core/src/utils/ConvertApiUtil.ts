import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { NetworkController } from '../controllers/NetworkController.js'
import { FetchUtil } from '../utils/FetchUtil.js'
import { AccountController } from '../controllers/AccountController.js'
import { ConnectionController } from '../controllers/ConnectionController.js'
import { ConstantsUtil } from '../utils/ConstantsUtil.js'
import { BlockchainApiController } from '../controllers/BlockchainApiController.js'
import type { ConvertTokenWithBalance } from './TypeUtil.js'
import { OptionsController } from '../controllers/OptionsController.js'
import type { BlockchainApiConvertAllowanceRequest } from '../utils/TypeUtil.js'

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

export type TransactionData = {
  from: string
  to: `0x${string}`
  data: `0x${string}`
  value: string
  gas: bigint
  gasPrice: string
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
    const response = await BlockchainApiController.fetchConvertTokens({
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

  async fetchGasPrice() {
    return await BlockchainApiController.fetchGasPrice({
      projectId: OptionsController.state.projectId,
      chainId: NetworkController.state.caipNetwork?.id
    })
  },

  async fetchConvertAllowance({
    tokenAddress,
    userAddress,
    sourceTokenAmount,
    sourceTokenDecimals
  }: Pick<BlockchainApiConvertAllowanceRequest, 'tokenAddress' | 'userAddress'> & {
    sourceTokenAmount: string
    sourceTokenDecimals: number
  }) {
    const response = await BlockchainApiController.fetchConvertAllowance({
      projectId: OptionsController.state.projectId,
      tokenAddress: tokenAddress,
      userAddress: userAddress
    })

    if (response?.allowance && sourceTokenAmount && sourceTokenDecimals) {
      const parsedValue = ConnectionController.parseUnits(sourceTokenAmount, sourceTokenDecimals)
      const hasAllowance = BigInt(response.allowance) >= parsedValue

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
        address: !!token?.address
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
  }
}
