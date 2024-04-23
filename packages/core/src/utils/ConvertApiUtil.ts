import { NetworkController } from '../controllers/NetworkController.js'
import { AccountController } from '../controllers/AccountController.js'
import { ConnectionController } from '../controllers/ConnectionController.js'
import { ConstantsUtil } from '../utils/ConstantsUtil.js'
import { BlockchainApiController } from '../controllers/BlockchainApiController.js'
import type { ConvertTokenWithBalance } from './TypeUtil.js'
import { OptionsController } from '../controllers/OptionsController.js'
import type {
  BlockchainApiConvertAllowanceRequest,
  BlockchainApiBalanceResponse
} from '../utils/TypeUtil.js'

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

// -- Controller ---------------------------------------- //
export const ConvertApiUtil = {
  async getTokenList() {
    const response = await BlockchainApiController.fetchConvertTokens({
      chainId: NetworkController.state.caipNetwork?.id,
      projectId: OptionsController.state.projectId
    })

    const tokens = response.tokens.map(
      token =>
        ({
          ...token,
          eip2612: false,
          quantity: {
            decimals: '0',
            numeric: '0'
          },
          price: 0,
          value: 0
        }) as ConvertTokenWithBalance
    )

    return tokens
  },

  async fetchGasPrice() {
    const projectId = OptionsController.state.projectId
    const caipNetwork = NetworkController.state.caipNetwork

    if (!caipNetwork) {
      return null
    }

    return await BlockchainApiController.fetchGasPrice({
      projectId,
      chainId: caipNetwork.id
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
    const projectId = OptionsController.state.projectId

    const response = await BlockchainApiController.fetchConvertAllowance({
      projectId,
      tokenAddress,
      userAddress
    })

    if (response?.allowance && sourceTokenAmount && sourceTokenDecimals) {
      const parsedValue = ConnectionController.parseUnits(sourceTokenAmount, sourceTokenDecimals)
      const hasAllowance = BigInt(response.allowance) >= parsedValue

      return hasAllowance
    }

    return false
  },

  async getMyTokensWithBalance() {
    const address = AccountController.state.address
    const caipNetwork = NetworkController.state.caipNetwork

    if (!address || !caipNetwork) {
      return []
    }

    const response = await BlockchainApiController.getBalance(address, caipNetwork.id)
    const balances = response.balances

    return this.mapBalancesToConvertTokens(balances)
  },

  mapBalancesToConvertTokens(balances: BlockchainApiBalanceResponse['balances']) {
    return balances.map(
      token =>
        ({
          symbol: token.symbol,
          name: token.name,
          address: token?.address
            ? token.address
            : `${NetworkController.state.caipNetwork?.id}:${ConstantsUtil.NATIVE_TOKEN_ADDRESS}`,
          decimals: parseInt(token.quantity.decimals, 10),
          logoUri: token.iconUrl,
          eip2612: false,
          quantity: token.quantity,
          price: token.price,
          value: token.value
        }) as ConvertTokenWithBalance
    )
  }
}
