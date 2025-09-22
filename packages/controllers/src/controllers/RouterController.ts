import { proxy, snapshot } from 'valtio/vanilla'
import { subscribeKey as subKey } from 'valtio/vanilla/utils'

import type { CaipNetwork, ChainNamespace } from '@reown/appkit-common'

import type { Connector, Metadata, WcWallet } from '../utils/TypeUtil.js'
import { withErrorBoundary } from '../utils/withErrorBoundary.js'
import { ChainController } from './ChainController.js'
import { ConnectorController } from './ConnectorController.js'
import { ModalController } from './ModalController.js'
import { OptionsController } from './OptionsController.js'
import type { SendInputArguments } from './SendController.js'
import type { SwapInputArguments, SwapInputTarget } from './SwapController.js'

// -- Types --------------------------------------------- //
type TransactionAction = {
  /**
   * Function to be called when the transaction is complete.
   */
  onSuccess?: () => void
  /**
   * Function to be called when the transaction is cancelled.
   */
  onCancel?: () => void
  /**
   * Function to be called when the transaction is failed.
   */
  onError?: () => void
}
export interface RouterControllerState {
  view:
    | 'Account'
    | 'AccountSettings'
    | 'AllWallets'
    | 'ApproveTransaction'
    | 'BuyInProgress'
    | 'WalletCompatibleNetworks'
    | 'ChooseAccountName'
    | 'Connect'
    | 'Create'
    | 'ConnectingExternal'
    | 'ConnectingFarcaster'
    | 'ConnectingWalletConnect'
    | 'ConnectingWalletConnectBasic'
    | 'ConnectingSiwe'
    | 'ConnectingSocial'
    | 'ConnectSocials'
    | 'ConnectWallets'
    | 'DataCapture'
    | 'DataCaptureOtpConfirm'
    | 'Downloads'
    | 'EmailLogin'
    | 'EmailVerifyOtp'
    | 'EmailVerifyDevice'
    | 'GetWallet'
    | 'Networks'
    | 'OnRampFiatSelect'
    | 'OnRampProviders'
    | 'OnRampTokenSelect'
    | 'ProfileWallets'
    | 'RegisterAccountName'
    | 'RegisterAccountNameSuccess'
    | 'SwitchNetwork'
    | 'Transactions'
    | 'UnsupportedChain'
    | 'UpdateEmailWallet'
    | 'UpdateEmailPrimaryOtp'
    | 'UpdateEmailSecondaryOtp'
    | 'UpgradeEmailWallet'
    | 'WalletReceive'
    | 'WalletSend'
    | 'WalletSendPreview'
    | 'WalletSendSelectToken'
    | 'WalletSendConfirmed'
    | 'WhatIsANetwork'
    | 'WhatIsAWallet'
    | 'WhatIsABuy'
    | 'Swap'
    | 'SwapSelectToken'
    | 'SwapPreview'
    | 'ConnectingMultiChain'
    | 'SwitchActiveChain'
    | 'SmartSessionCreated'
    | 'SmartSessionList'
    | 'SIWXSignMessage'
    | 'Pay'
    | 'PayLoading'
    | 'FundWallet'
    | 'PayWithExchange'
    | 'PayWithExchangeSelectAsset'
  history: RouterControllerState['view'][]
  data?: {
    connector?: Connector
    wallet?: WcWallet
    network?: CaipNetwork
    email?: string
    redirectView?: RouterControllerState['view']
    newEmail?: string
    target?: SwapInputTarget
    swapUnsupportedChain?: boolean
    connectors?: Connector[]
    switchToChain?: ChainNamespace
    navigateTo?: RouterControllerState['view']
    navigateWithReplace?: boolean
    swap?: SwapInputArguments
    addWalletForNamespace?: ChainNamespace
    send?: SendInputArguments
  }
  transactionStack: TransactionAction[]
}

// -- State --------------------------------------------- //
const state = proxy<RouterControllerState>({
  view: 'Connect',
  history: ['Connect'],
  transactionStack: []
})

type StateKey = keyof RouterControllerState

// -- Controller ---------------------------------------- //
const controller = {
  state,

  subscribeKey<K extends StateKey>(key: K, callback: (value: RouterControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  pushTransactionStack(action: TransactionAction) {
    state.transactionStack.push(action)
  },

  popTransactionStack(status: 'success' | 'error' | 'cancel') {
    const action = state.transactionStack.pop()
    if (!action) {
      return
    }
    const { onSuccess, onError, onCancel } = action

    switch (status) {
      case 'success':
        onSuccess?.()
        break
      case 'error':
        onError?.()
        RouterController.goBack()
        break
      case 'cancel':
        onCancel?.()
        RouterController.goBack()
        break
      default:
    }
  },

  push(view: RouterControllerState['view'], data?: RouterControllerState['data']) {
    if (view !== state.view) {
      state.view = view
      state.history.push(view)
      state.data = data
    }
  },

  reset(view: RouterControllerState['view'], data?: RouterControllerState['data']) {
    state.view = view
    state.history = [view]
    state.data = data
  },

  replace(view: RouterControllerState['view'], data?: RouterControllerState['data']) {
    const lastView = state.history.at(-1)
    const isSameView = lastView === view

    if (!isSameView) {
      state.view = view
      state.history[state.history.length - 1] = view
      state.data = data
    }
  },

  goBack() {
    const isConnected = ChainController.state.activeCaipAddress
    const isFarcasterView = RouterController.state.view === 'ConnectingFarcaster'

    const shouldReload = !isConnected && isFarcasterView

    if (state.history.length > 1) {
      state.history.pop()
      const [last] = state.history.slice(-1)
      if (last) {
        const isConnectView = last === 'Connect'
        if (isConnected && isConnectView) {
          state.view = 'Account'
        } else {
          state.view = last
        }
      }
    } else {
      ModalController.close()
    }

    if (state.data?.wallet) {
      state.data.wallet = undefined
    }

    if (state.data?.redirectView) {
      state.data.redirectView = undefined
    }

    // Reloading the iframe contentwindow and doing the view animation in the modal causes a small freeze in the transition. Doing these separately fixes that.
    setTimeout(() => {
      if (shouldReload) {
        ChainController.setAccountProp('farcasterUrl', undefined, ChainController.state.activeChain)
        const authConnector = ConnectorController.getAuthConnector()
        authConnector?.provider?.reload()

        const optionsState = snapshot(OptionsController.state)
        authConnector?.provider?.syncDappData?.({
          metadata: optionsState.metadata as Metadata,
          sdkVersion: optionsState.sdkVersion,
          projectId: optionsState.projectId,
          sdkType: optionsState.sdkType
        })
      }
    }, 100)
  },

  goBackToIndex(historyIndex: number) {
    if (state.history.length > 1) {
      state.history = state.history.slice(0, historyIndex + 1)
      const [last] = state.history.slice(-1)
      if (last) {
        state.view = last
      }
    }
  },

  goBackOrCloseModal() {
    if (RouterController.state.history.length > 1) {
      RouterController.goBack()
    } else {
      ModalController.close()
    }
  }
}

// Export the controller wrapped with our error boundary
export const RouterController = withErrorBoundary(controller)
