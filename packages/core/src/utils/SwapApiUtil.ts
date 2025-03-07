import { AccountController } from '../controllers/AccountController.js'
import { BlockchainApiController } from '../controllers/BlockchainApiController.js'
import { ChainController } from '../controllers/ChainController.js'
import { ConnectionController } from '../controllers/ConnectionController.js'
import type { SwapTokenWithBalance } from './TypeUtil.js'
import type { BlockchainApiBalanceResponse, BlockchainApiSwapAllowanceRequest } from './TypeUtil.js'

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
export const SwapApiUtil = {
  async getTokenList() {
    const caipNetwork = ChainController.state.activeCaipNetwork
    const response = await BlockchainApiController.fetchSwapTokens({
      chainId: caipNetwork?.caipNetworkId
    })
    const tokens =
      response?.tokens?.map(
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
          }) as SwapTokenWithBalance
      ) || []

    return tokens
  },

  async fetchGasPrice() {
    const caipNetwork = ChainController.state.activeCaipNetwork

    if (!caipNetwork) {
      return null
    }

    try {
      switch (caipNetwork.chainNamespace) {
        case 'solana':
          // eslint-disable-next-line no-case-declarations
          const lamportsPerSignature = (
            await ConnectionController?.estimateGas({ chainNamespace: 'solana' })
          )?.toString()

          return {
            standard: lamportsPerSignature,
            fast: lamportsPerSignature,
            instant: lamportsPerSignature
          }

        case 'eip155':
        default:
          return await BlockchainApiController.fetchGasPrice({
            chainId: caipNetwork.caipNetworkId
          })
      }
    } catch {
      return null
    }
  },

  async fetchSwapAllowance({
    tokenAddress,
    userAddress,
    sourceTokenAmount,
    sourceTokenDecimals
  }: Pick<BlockchainApiSwapAllowanceRequest, 'tokenAddress' | 'userAddress'> & {
    sourceTokenAmount: string
    sourceTokenDecimals: number
  }) {
    const response = await BlockchainApiController.fetchSwapAllowance({
      tokenAddress,
      userAddress
    })

    if (response?.allowance && sourceTokenAmount && sourceTokenDecimals) {
      const parsedValue =
        ConnectionController.parseUnits(sourceTokenAmount, sourceTokenDecimals) || 0
      const hasAllowance = BigInt(response.allowance) >= parsedValue

      return hasAllowance
    }

    return false
  },

  async getMyTokensWithBalance(forceUpdate?: string) {
    const address = AccountController.state.address
    const caipNetwork = ChainController.state.activeCaipNetwork

    if (!address || !caipNetwork) {
      return []
    }

    const response = await BlockchainApiController.getBalance(
      address,
      caipNetwork.caipNetworkId,
      forceUpdate
    )
    /*
     * The 1Inch API includes many low-quality tokens in the balance response,
     * which appear inconsistently. This filter prevents them from being displayed.
     */
    const balances = response.balances.filter(balance => balance.quantity.decimals !== '0')

    AccountController.setTokenBalance(balances, ChainController.state.activeChain)

    return this.mapBalancesToSwapTokens(balances)
  },

  mapBalancesToSwapTokens(balances: BlockchainApiBalanceResponse['balances']) {
    return (
      balances?.map(
        token =>
          ({
            ...token,
            address: token?.address
              ? token.address
              : ChainController.getActiveNetworkTokenAddress(),
            decimals: parseInt(token.quantity.decimals, 10),
            logoUri: token.iconUrl,
            eip2612: false
          }) as SwapTokenWithBalance
      ) || []
    )
  }
}
