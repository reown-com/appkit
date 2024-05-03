import { subscribeKey as subKey } from 'valtio/vanilla/utils'
import { proxy, ref, subscribe as sub } from 'valtio/vanilla'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import type { CaipAddress, ConnectedWalletInfo } from '../utils/TypeUtil.js'
import type { Balance } from '@web3modal/common'
import { BlockchainApiController } from './BlockchainApiController.js'
import { SnackController } from './SnackController.js'
import { SwapController } from './SwapController.js'
import { SwapApiUtil } from '../utils/SwapApiUtil.js'
import type { W3mFrameTypes } from '@web3modal/wallet'

// -- Types --------------------------------------------- //
export interface AccountControllerState {
  isConnected: boolean
  currentTab: number
  caipAddress?: CaipAddress
  address?: string
  balance?: string
  balanceSymbol?: string
  profileName?: string | null
  profileImage?: string | null
  addressExplorerUrl?: string
  smartAccountDeployed?: boolean
  tokenBalance?: Balance[]
  connectedWalletInfo?: ConnectedWalletInfo
  preferredAccountType?: W3mFrameTypes.AccountType
}

type StateKey = keyof AccountControllerState

// -- State --------------------------------------------- //
const state = proxy<AccountControllerState>({
  isConnected: false,
  currentTab: 0,
  tokenBalance: [],
  smartAccountDeployed: false
})

// -- Controller ---------------------------------------- //
export const AccountController = {
  state,

  subscribe(callback: (newState: AccountControllerState) => void) {
    return sub(state, () => callback(state))
  },

  subscribeKey<K extends StateKey>(key: K, callback: (value: AccountControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  setIsConnected(isConnected: AccountControllerState['isConnected']) {
    state.isConnected = isConnected
  },

  setCaipAddress(caipAddress: AccountControllerState['caipAddress']) {
    state.caipAddress = caipAddress
    state.address = caipAddress ? CoreHelperUtil.getPlainAddress(caipAddress) : undefined
  },

  setBalance(
    balance: AccountControllerState['balance'],
    balanceSymbol: AccountControllerState['balanceSymbol']
  ) {
    state.balance = balance
    state.balanceSymbol = balanceSymbol
  },

  setProfileName(profileName: AccountControllerState['profileName']) {
    state.profileName = profileName
  },

  setProfileImage(profileImage: AccountControllerState['profileImage']) {
    state.profileImage = profileImage
  },

  setAddressExplorerUrl(explorerUrl: AccountControllerState['addressExplorerUrl']) {
    state.addressExplorerUrl = explorerUrl
  },

  setSmartAccountDeployed(isDeployed: boolean) {
    state.smartAccountDeployed = isDeployed
  },

  setCurrentTab(currentTab: AccountControllerState['currentTab']) {
    state.currentTab = currentTab
  },

  setTokenBalance(tokenBalance: AccountControllerState['tokenBalance']) {
    if (tokenBalance) {
      state.tokenBalance = ref(tokenBalance)
    }
  },

  setConnectedWalletInfo(connectedWalletInfo: AccountControllerState['connectedWalletInfo']) {
    state.connectedWalletInfo = connectedWalletInfo
  },

  setPreferredAccountType(preferredAccountType: AccountControllerState['preferredAccountType']) {
    state.preferredAccountType = preferredAccountType
  },

  async fetchTokenBalance() {
    try {
      if (state.address) {
        const response = await BlockchainApiController.getBalance(state.address)

        this.setTokenBalance(response.balances)
        SwapController.setBalances(SwapApiUtil.mapBalancesToSwapTokens(response.balances))
      }
    } catch (error) {
      SnackController.showError('Failed to fetch token balance')
    }
  },

  resetAccount() {
    state.isConnected = false
    state.smartAccountDeployed = false
    state.currentTab = 0
    state.caipAddress = undefined
    state.address = undefined
    state.balance = undefined
    state.balanceSymbol = undefined
    state.profileName = undefined
    state.profileImage = undefined
    state.addressExplorerUrl = undefined
    state.tokenBalance = []
    state.connectedWalletInfo = undefined
    state.preferredAccountType = undefined
  }
}
