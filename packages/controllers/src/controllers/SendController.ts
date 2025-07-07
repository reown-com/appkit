import { proxy, ref, subscribe as sub } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

import {
  type Address,
  type Balance,
  type CaipAddress,
  ConstantsUtil as CommonConstantsUtil,
  NumberUtil
} from '@reown/appkit-common'
import { ContractUtil } from '@reown/appkit-common'
import { W3mFrameRpcConstants } from '@reown/appkit-wallet/utils'

import { BalanceUtil } from '../utils/BalanceUtil.js'
import {
  getActiveNetworkTokenAddress,
  getPreferredAccountType
} from '../utils/ChainControllerUtil.js'
import { ConstantsUtil } from '../utils/ConstantsUtil.js'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { SwapApiUtil } from '../utils/SwapApiUtil.js'
import { withErrorBoundary } from '../utils/withErrorBoundary.js'
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
const controller = {
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

  setNetworkBalanceInUsd(networkBalanceInUSD: SendControllerState['networkBalanceInUSD']) {
    state.networkBalanceInUSD = networkBalanceInUSD
  },

  setLoading(loading: SendControllerState['loading']) {
    state.loading = loading
  },

  async sendToken() {
    try {
      SendController.setLoading(true)
      switch (ChainController.state.activeCaipNetwork?.chainNamespace) {
        case 'eip155':
          await SendController.sendEvmToken()

          return
        case 'solana':
          await SendController.sendSolanaToken()

          return
        default:
          throw new Error('Unsupported chain')
      }
    } finally {
      SendController.setLoading(false)
    }
  },

  async sendEvmToken() {
    const activeChainNamespace = ChainController.state.activeChain

    if (!activeChainNamespace) {
      throw new Error('SendController:sendEvmToken - activeChainNamespace is required')
    }

    const activeAccountType = getPreferredAccountType(activeChainNamespace)

    if (!SendController.state.sendTokenAmount || !SendController.state.receiverAddress) {
      throw new Error('An amount and receiver address are required')
    }

    if (!SendController.state.token) {
      throw new Error('A token is required')
    }

    if (SendController.state.token?.address) {
      EventsController.sendEvent({
        type: 'track',
        event: 'SEND_INITIATED',
        properties: {
          isSmartAccount: activeAccountType === W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT,
          token: SendController.state.token.address,
          amount: SendController.state.sendTokenAmount,
          network: ChainController.state.activeCaipNetwork?.caipNetworkId || ''
        }
      })
      await SendController.sendERC20Token({
        receiverAddress: SendController.state.receiverAddress,
        tokenAddress: SendController.state.token.address,
        sendTokenAmount: SendController.state.sendTokenAmount,
        decimals: SendController.state.token.quantity.decimals
      })
    } else {
      EventsController.sendEvent({
        type: 'track',
        event: 'SEND_INITIATED',
        properties: {
          isSmartAccount: activeAccountType === W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT,
          token: SendController.state.token.symbol || '',
          amount: SendController.state.sendTokenAmount,
          network: ChainController.state.activeCaipNetwork?.caipNetworkId || ''
        }
      })
      await SendController.sendNativeToken({
        receiverAddress: SendController.state.receiverAddress,
        sendTokenAmount: SendController.state.sendTokenAmount,
        decimals: SendController.state.token.quantity.decimals
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
        const balances = await BalanceUtil.getMyTokensWithBalance()
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

    const networkTokenBalances = SwapApiUtil.mapBalancesToSwapTokens(state.tokenBalances)

    if (!networkTokenBalances) {
      return
    }

    const networkToken = networkTokenBalances.find(
      token => token.address === getActiveNetworkTokenAddress()
    )

    if (!networkToken) {
      return
    }

    state.networkBalanceInUSD = networkToken
      ? NumberUtil.multiply(networkToken.quantity.numeric, networkToken.price).toString()
      : '0'
  },

  async sendNativeToken(params: TxParams) {
    RouterController.pushTransactionStack({})

    const to = params.receiverAddress as Address
    const address = AccountController.state.address as Address
    const value = ConnectionController.parseUnits(
      params.sendTokenAmount.toString(),
      Number(params.decimals)
    )
    const data = '0x'

    await ConnectionController.sendTransaction({
      chainNamespace: CommonConstantsUtil.CHAIN.EVM,
      to,
      address,
      data,
      value: value ?? BigInt(0)
    })

    EventsController.sendEvent({
      type: 'track',
      event: 'SEND_SUCCESS',
      properties: {
        isSmartAccount:
          getPreferredAccountType('eip155') === W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT,
        token: SendController.state.token?.symbol || '',
        amount: params.sendTokenAmount,
        network: ChainController.state.activeCaipNetwork?.caipNetworkId || ''
      }
    })

    ConnectionController._getClient()?.updateBalance('eip155')
    SendController.resetSend()
  },

  async sendERC20Token(params: ContractWriteParams) {
    RouterController.pushTransactionStack({
      onSuccess() {
        RouterController.replace('Account')
      }
    })

    const amount = ConnectionController.parseUnits(
      params.sendTokenAmount.toString(),
      Number(params.decimals)
    )

    if (
      AccountController.state.address &&
      params.sendTokenAmount &&
      params.receiverAddress &&
      params.tokenAddress
    ) {
      const tokenAddress = CoreHelperUtil.getPlainAddress(params.tokenAddress as CaipAddress)

      if (!tokenAddress) {
        throw new Error('SendController:sendERC20Token - tokenAddress is required')
      }

      await ConnectionController.writeContract({
        fromAddress: AccountController.state.address as Address,
        tokenAddress,
        args: [params.receiverAddress as Address, amount ?? BigInt(0)],
        method: 'transfer',
        abi: ContractUtil.getERC20Abi(tokenAddress),
        chainNamespace: CommonConstantsUtil.CHAIN.EVM
      })

      SendController.resetSend()
    }
  },

  async sendSolanaToken() {
    if (!SendController.state.sendTokenAmount || !SendController.state.receiverAddress) {
      throw new Error('An amount and receiver address are required')
    }

    RouterController.pushTransactionStack({
      onSuccess() {
        RouterController.replace('Account')
      }
    })

    await ConnectionController.sendTransaction({
      chainNamespace: 'solana',
      to: SendController.state.receiverAddress,
      value: SendController.state.sendTokenAmount
    })

    ConnectionController._getClient()?.updateBalance('solana')
    SendController.resetSend()
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

// Export the controller wrapped with our error boundary
export const SendController = withErrorBoundary(controller)
