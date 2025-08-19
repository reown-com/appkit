import { fromPromise } from 'xstate'

import type { Balance } from '@reown/appkit-common'

import { SnackController } from '../../../controllers/SnackController.js'
import { BalanceUtil } from '../../../utils/BalanceUtil.js'
import { getActiveNetworkTokenAddress } from '../../../utils/ChainControllerUtil.js'
import { SwapApiUtil } from '../../../utils/SwapApiUtil.js'
import type { BalanceFetchInput } from '../types/sendTypes.js'

export const balanceFetchService = fromPromise(
  async ({ input }: { input: BalanceFetchInput }): Promise<Balance[]> => {
    const { address, chainId, chainNamespace } = input

    if (!address || !chainId || !chainNamespace) {
      throw new Error('Address, chainId, and chainNamespace are required for balance fetching')
    }

    try {
      const balances = await BalanceUtil.getMyTokensWithBalance()

      return balances || []
    } catch (error) {
      SnackController.showError('Token Balance Unavailable')
      throw error
    }
  }
)

export const networkPriceFetchService = fromPromise(
  ({ input }: { input: { tokenBalances: Balance[] } }): Promise<string | undefined> => {
    const { tokenBalances } = input

    if (!tokenBalances || tokenBalances.length === 0) {
      return Promise.resolve(undefined)
    }

    try {
      const networkTokenBalances = SwapApiUtil.mapBalancesToSwapTokens(tokenBalances)

      if (!networkTokenBalances) {
        return Promise.resolve(undefined)
      }

      const networkToken = networkTokenBalances.find(
        (token: { address: string; quantity: { numeric: string }; price: number }) =>
          token.address === getActiveNetworkTokenAddress()
      )

      if (!networkToken) {
        return Promise.resolve(undefined)
      }

      const networkBalanceInUSD = networkToken
        ? (Number(networkToken.quantity.numeric) * networkToken.price).toString()
        : '0'

      return Promise.resolve(networkBalanceInUSD)
    } catch (error) {
      // Network price fetch failures are not critical, return undefined

      return Promise.resolve(undefined)
    }
  }
)

export const retryDelayService = fromPromise(
  async ({ input }: { input: { delayMs: number } }): Promise<void> => {
    const { delayMs } = input

    return new Promise(resolve => {
      setTimeout(resolve, delayMs)
    })
  }
)
