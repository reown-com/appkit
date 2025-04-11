import { proxy, ref, subscribe as sub } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

import {
  type Balance,
  type CaipAddress,
  type ChainNamespace,
  NumberUtil
} from '@reown/appkit-common'
import { ContractUtil } from '@reown/appkit-common'
import { W3mFrameRpcConstants } from '@reown/appkit-wallet/utils'

import { ConstantsUtil } from '../utils/ConstantsUtil.js'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { SendApiUtil } from '../utils/SendApiUtil.js'
import { AccountController } from './AccountController.js'
import { ChainController } from './ChainController.js'
import { ConnectionController } from './ConnectionController.js'
import { EventsController } from './EventsController.js'
import { RouterController } from './RouterController.js'
import { SnackController } from './SnackController.js'

// -- Types --------------------------------------------- //

export interface TxParams {
  receiverAddress: string
  sendTokenAmount: number
  gasPrice: bigint
  decimals: string
}

export interface ContractWriteParams {
  receiverAddress: string
  tokenAddress: string
  sendTokenAmount: number
  decimals: string
}
export interface SendControllerState {
  tokenBalances: Balance[]
  token?: Balance
  sendTokenAmount?: number
  receiverAddress?: string
  receiverProfileName?: string
  receiverProfileImageUrl?: string
  gasPrice?: bigint
  gasPriceInUSD?: number
  networkBalanceInUSD?: string
  loading: boolean
  lastRetry?: number
}

type StateKey = keyof SendControllerState

// -- State --------------------------------------------- //
const state = proxy<SendControllerState>({
  tokenBalances: [],
  loading: false
})

// -- Controller ---------------------------------------- //
export const SendController = {
  state,

  subscribe(callback: (newState: SendControllerState) => void) {
    return sub(state, () => callback(state))
  },

  subscribeKey<K extends StateKey>(key: K, callback: (value: SendControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  setToken(token: SendControllerState['token']) {
    if (token) {
      state.token = ref(token)
    }
  },

  setTokenAmount(sendTokenAmount: SendControllerState['sendTokenAmount']) {
    state.sendTokenAmount = sendTokenAmount
  },

  setReceiverAddress(receiverAddress: SendControllerState['receiverAddress']) {
    state.receiverAddress = receiverAddress
  },

  setReceiverProfileImageUrl(
    receiverProfileImageUrl: SendControllerState['receiverProfileImageUrl']
  ) {
    state.receiverProfileImageUrl = receiverProfileImageUrl
  },

  setReceiverProfileName(receiverProfileName: SendControllerState['receiverProfileName']) {
    state.receiverProfileName = receiverProfileName
  },

  setGasPrice(gasPrice: SendControllerState['gasPrice']) {
    state.gasPrice = gasPrice
  },

  setGasPriceInUsd(gasPriceInUSD: SendControllerState['gasPriceInUSD']) {
    state.gasPriceInUSD = gasPriceInUSD
  },

  setNetworkBalanceInUsd(networkBalanceInUSD: SendControllerState['networkBalanceInUSD']) {
    state.networkBalanceInUSD = networkBalanceInUSD
  },

  setLoading(loading: SendControllerState['loading']) {
    state.loading = loading
  },

  sendToken() {
    switch (ChainController.state.activeCaipNetwork?.chainNamespace) {
      case 'eip155':
        this.sendEvmToken()

        return
      case 'solana':
        this.sendSolanaToken()

        return
      default:
        throw new Error('Unsupported chain')
    }
  },

  sendEvmToken() {
    const activeChainNamespace = ChainController.state.activeChain as ChainNamespace
    const activeAccountType = AccountController.state.preferredAccountTypes?.[activeChainNamespace]
    if (this.state.token?.address && this.state.sendTokenAmount && this.state.receiverAddress) {
      EventsController.sendEvent({
        type: 'track',
        event: 'SEND_INITIATED',
        properties: {
          isSmartAccount: activeAccountType === W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT,
          token: this.state.token.address,
          amount: this.state.sendTokenAmount,
          network: ChainController.state.activeCaipNetwork?.caipNetworkId || ''
        }
      })
      this.sendERC20Token({
        receiverAddress: this.state.receiverAddress,
        tokenAddress: this.state.token.address,
        sendTokenAmount: this.state.sendTokenAmount,
        decimals: this.state.token.quantity.decimals
      })
    } else if (
      this.state.receiverAddress &&
      this.state.sendTokenAmount &&
      this.state.gasPrice &&
      this.state.token?.quantity.decimals
    ) {
      EventsController.sendEvent({
        type: 'track',
        event: 'SEND_INITIATED',
        properties: {
          isSmartAccount: activeAccountType === W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT,
          token: this.state.token?.symbol,
          amount: this.state.sendTokenAmount,
          network: ChainController.state.activeCaipNetwork?.caipNetworkId || ''
        }
      })
      this.sendNativeToken({
        receiverAddress: this.state.receiverAddress,
        sendTokenAmount: this.state.sendTokenAmount,
        gasPrice: this.state.gasPrice,
        decimals: this.state.token.quantity.decimals
      })
    }
  },

  async fetchTokenBalance(onError?: (error: unknown) => void): Promise<Balance[]> {
    state.loading = true
    const chainId = ChainController.state.activeCaipNetwork?.caipNetworkId
    const chain = ChainController.state.activeCaipNetwork?.chainNamespace
    const caipAddress = ChainController.state.activeCaipAddress
    const address = caipAddress ? CoreHelperUtil.getPlainAddress(caipAddress) : undefined
    if (
      state.lastRetry &&
      !CoreHelperUtil.isAllowedRetry(state.lastRetry, 30 * ConstantsUtil.ONE_SEC_MS)
    ) {
      state.loading = false

      return []
    }

    try {
      if (address && chainId && chain) {
        const balances = await SendApiUtil.getMyTokensWithBalance()
        state.tokenBalances = balances
        state.lastRetry = undefined

        return balances
      }
    } catch (error) {
      state.lastRetry = Date.now()

      onError?.(error)
      SnackController.showError('Token Balance Unavailable')
    } finally {
      state.loading = false
    }

    return []
  },

  fetchNetworkBalance() {
    if (state.tokenBalances.length === 0) {
      return
    }

    const networkTokenBalances = SendApiUtil.mapBalancesToSwapTokens(state.tokenBalances)
    if (!networkTokenBalances) {
      return
    }

    const networkToken = networkTokenBalances.find(
      token => token.address === ChainController.getActiveNetworkTokenAddress()
    )

    if (!networkToken) {
      return
    }

    state.networkBalanceInUSD = networkToken
      ? NumberUtil.multiply(networkToken.quantity.numeric, networkToken.price).toString()
      : '0'
  },

  isInsufficientNetworkTokenForGas(networkBalanceInUSD: string, gasPriceInUSD: number | undefined) {
    const gasPrice = gasPriceInUSD || '0'

    if (NumberUtil.bigNumber(networkBalanceInUSD).eq(0)) {
      return true
    }

    return NumberUtil.bigNumber(NumberUtil.bigNumber(gasPrice)).gt(networkBalanceInUSD)
  },

  hasInsufficientGasFunds() {
    const activeChainNamespace = ChainController.state.activeChain as ChainNamespace
    let isInsufficientNetworkTokenForGas = true
    if (
      AccountController.state.preferredAccountTypes?.[activeChainNamespace] ===
      W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
    ) {
      // Smart Accounts may pay gas in any ERC20 token
      isInsufficientNetworkTokenForGas = false
    } else if (state.networkBalanceInUSD) {
      isInsufficientNetworkTokenForGas = this.isInsufficientNetworkTokenForGas(
        state.networkBalanceInUSD,
        state.gasPriceInUSD
      )
    }

    return isInsufficientNetworkTokenForGas
  },

  async sendNativeToken(params: TxParams) {
    const activeChainNamespace = ChainController.state.activeChain as ChainNamespace
    RouterController.pushTransactionStack({
      view: 'Account',
      goBack: false
    })

    const to = params.receiverAddress as `0x${string}`
    const address = AccountController.state.address as `0x${string}`
    const value = ConnectionController.parseUnits(
      params.sendTokenAmount.toString(),
      Number(params.decimals)
    )
    const data = '0x'

    try {
      await ConnectionController.sendTransaction({
        chainNamespace: 'eip155',
        to,
        address,
        data,
        value: value ?? BigInt(0),
        gasPrice: params.gasPrice
      })

      SnackController.showSuccess('Transaction started')
      EventsController.sendEvent({
        type: 'track',
        event: 'SEND_SUCCESS',
        properties: {
          isSmartAccount:
            AccountController.state.preferredAccountTypes?.[activeChainNamespace] ===
            W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT,
          token: this.state.token?.symbol || '',
          amount: params.sendTokenAmount,
          network: ChainController.state.activeCaipNetwork?.caipNetworkId || ''
        }
      })
      this.resetSend()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('SendController:sendERC20Token - failed to send native token', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      EventsController.sendEvent({
        type: 'track',
        event: 'SEND_ERROR',
        properties: {
          message: errorMessage,
          isSmartAccount:
            AccountController.state.preferredAccountTypes?.[activeChainNamespace] ===
            W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT,
          token: this.state.token?.symbol || '',
          amount: params.sendTokenAmount,
          network: ChainController.state.activeCaipNetwork?.caipNetworkId || ''
        }
      })
      SnackController.showError('Something went wrong')
    }
  },

  async sendERC20Token(params: ContractWriteParams) {
    RouterController.pushTransactionStack({
      view: 'Account',
      goBack: false
    })

    const amount = ConnectionController.parseUnits(
      params.sendTokenAmount.toString(),
      Number(params.decimals)
    )

    try {
      if (
        AccountController.state.address &&
        params.sendTokenAmount &&
        params.receiverAddress &&
        params.tokenAddress
      ) {
        const tokenAddress = CoreHelperUtil.getPlainAddress(
          params.tokenAddress as CaipAddress
        ) as `0x${string}`

        await ConnectionController.writeContract({
          fromAddress: AccountController.state.address as `0x${string}`,
          tokenAddress,
          args: [params.receiverAddress as `0x${string}`, amount ?? BigInt(0)],
          method: 'transfer',
          abi: ContractUtil.getERC20Abi(tokenAddress),
          chainNamespace: 'eip155'
        })

        SnackController.showSuccess('Transaction started')
        this.resetSend()
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('SendController:sendERC20Token - failed to send erc20 token', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      EventsController.sendEvent({
        type: 'track',
        event: 'SEND_ERROR',
        properties: {
          message: errorMessage,
          isSmartAccount:
            AccountController.state.preferredAccountTypes?.eip155 ===
            W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT,
          token: this.state.token?.symbol || '',
          amount: params.sendTokenAmount,
          network: ChainController.state.activeCaipNetwork?.caipNetworkId || ''
        }
      })
      SnackController.showError('Something went wrong')
    }
  },

  sendSolanaToken() {
    if (!this.state.sendTokenAmount || !this.state.receiverAddress) {
      SnackController.showError('Please enter a valid amount and receiver address')

      return
    }

    RouterController.pushTransactionStack({
      view: 'Account',
      goBack: false
    })

    ConnectionController.sendTransaction({
      chainNamespace: 'solana',
      to: this.state.receiverAddress as `0x${string}`,
      value: this.state.sendTokenAmount
    })
      .then(() => {
        this.resetSend()
        AccountController.fetchTokenBalance()
      })
      .catch(error => {
        SnackController.showError('Failed to send transaction. Please try again.')
        // eslint-disable-next-line no-console
        console.error('SendController:sendToken - failed to send solana transaction', error)
      })
  },

  resetSend() {
    state.token = undefined
    state.sendTokenAmount = undefined
    state.receiverAddress = undefined
    state.receiverProfileImageUrl = undefined
    state.receiverProfileName = undefined
    state.loading = false
    state.tokenBalances = []
  }
}
