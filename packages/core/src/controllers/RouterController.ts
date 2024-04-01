import { subscribeKey as subKey } from 'valtio/utils'
import { proxy } from 'valtio/vanilla'
import type { CaipNetwork, Connector, WcWallet } from '../utils/TypeUtil.js'

// -- Types --------------------------------------------- //
type TransactionSuccessAction = {
  goBack: boolean
  view: RouterControllerState['view'] | null
  callback?: () => void
}
export interface RouterControllerState {
  view:
    | 'Account'
    | 'AccountSettings'
    | 'AllWallets'
    | 'ApproveTransaction'
    | 'BuyInProgress'
    | 'WalletCompatibleNetworks'
    | 'Connect'
    | 'ConnectingExternal'
    | 'ConnectingWalletConnect'
    | 'ConnectingSiwe'
    | 'Downloads'
    | 'EmailVerifyOtp'
    | 'EmailVerifyDevice'
    | 'GetWallet'
    | 'Networks'
    | 'OnRampActivity'
    | 'OnRampFiatSelect'
    | 'OnRampProviders'
    | 'OnRampTokenSelect'
    | 'SwitchNetwork'
    | 'Transactions'
    | 'UnsupportedChain'
    | 'UpdateEmailWallet'
    | 'UpdateEmailPrimaryOtp'
    | 'UpdateEmailSecondaryOtp'
    | 'UpgradeEmailWallet'
    | 'UpgradeToSmartAccount'
    | 'WalletReceive'
    | 'WalletSend'
    | 'WalletSendPreview'
    | 'WalletSendSelectToken'
    | 'WhatIsANetwork'
    | 'WhatIsAWallet'
    | 'WhatIsABuy'
    | 'Convert'
    | 'ConvertSelectToken'
    | 'ConvertSelectNetwork'
    | 'ConvertPreview'
  history: RouterControllerState['view'][]
  data?: {
    connector?: Connector
    wallet?: WcWallet
    network?: CaipNetwork
    email?: string
    newEmail?: string
    target?: 'sourceToken' | 'toToken'
  }
  transactionSuccessStack: TransactionSuccessAction[]
}

// -- State --------------------------------------------- //
const state = proxy<RouterControllerState>({
  view: 'Connect',
  history: ['Connect'],
  transactionSuccessStack: []
})

type StateKey = keyof RouterControllerState

// -- Controller ---------------------------------------- //
export const RouterController = {
  state,

  subscribeKey<K extends StateKey>(key: K, callback: (value: RouterControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  pushTransactionSuccessView(action: TransactionSuccessAction) {
    state.transactionSuccessStack.push(action)
  },

  popTransactionSuccessAction() {
    const action = state.transactionSuccessStack.pop()

    if (!action) {
      return
    }

    if (action.goBack) {
      this.goBack()
    } else if (action.view) {
      this.reset(action.view)
    }
    action.callback?.()
  },

  push(view: RouterControllerState['view'], data?: RouterControllerState['data']) {
    if (view !== state.view) {
      state.view = view
      state.history.push(view)
      state.data = data
    }
  },

  reset(view: RouterControllerState['view']) {
    state.view = view
    state.history = [view]
  },

  replace(view: RouterControllerState['view'], data?: RouterControllerState['data']) {
    if (state.history.length > 1 && state.history.at(-1) !== view) {
      state.view = view
      state.history[state.history.length - 1] = view
      state.data = data
    }
  },

  goBack() {
    if (state.history.length > 1) {
      state.history.pop()
      const [last] = state.history.slice(-1)
      if (last) {
        state.view = last
      }
    }
  },

  goBackToIndex(historyIndex: number) {
    if (state.history.length > 1) {
      state.history = state.history.slice(0, historyIndex + 1)
      const [last] = state.history.slice(-1)
      if (last) {
        state.view = last
      }
    }
  }
}
