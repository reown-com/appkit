import { subscribeKey as subKey } from 'valtio/vanilla/utils'
import { proxy, ref, subscribe as sub } from 'valtio/vanilla'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import type { CaipAddress, ConnectedWalletInfo, SocialProvider } from '../utils/TypeUtil.js'
import type { Balance } from '@web3modal/common'
import { BlockchainApiController } from './BlockchainApiController.js'
import { SnackController } from './SnackController.js'
import { SwapController } from './SwapController.js'
import { SwapApiUtil } from '../utils/SwapApiUtil.js'
import type { W3mFrameTypes } from '@web3modal/wallet'
import { NetworkController } from './NetworkController.js'
import { ChainController, type Chain } from './ChainController.js'

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
  socialProvider?: SocialProvider
  tokenBalance?: Balance[]
  connectedWalletInfo?: ConnectedWalletInfo
  preferredAccountType?: W3mFrameTypes.AccountType
  socialWindow?: Window
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

  getProperty<K extends StateKey>(key: K): AccountControllerState[K] {
    if (ChainController.state.multiChainEnabled) {
      // @ts-ignore
      return ChainController.getAccountProp(key)
    }

    return state[key]
  },

  setIsConnected(isConnected: AccountControllerState['isConnected'], chain?: Chain) {
    if (ChainController.state.multiChainEnabled && chain) {
      ChainController.setAccountProp('isConnected', isConnected, chain)
    }

    state.isConnected = isConnected
  },

  setCaipAddress(caipAddress: AccountControllerState['caipAddress'], chain?: Chain) {
    const newCaipAddress = caipAddress ? CoreHelperUtil.getPlainAddress(caipAddress) : undefined

    state.caipAddress = caipAddress
    state.address = newCaipAddress

    if (ChainController.state.multiChainEnabled) {
      ChainController.setAccountProp('caipAddress', caipAddress, chain)
      ChainController.setAccountProp('address', newCaipAddress, chain)
    }
  },

  setBalance(
    balance: AccountControllerState['balance'],
    balanceSymbol: AccountControllerState['balanceSymbol'],
    chain?: Chain
  ) {
    state.balance = balance
    state.balanceSymbol = balanceSymbol

    if (ChainController.state.multiChainEnabled && chain) {
      ChainController.setAccountProp('balance', balance, chain)
      ChainController.setAccountProp('balanceSymbol', balanceSymbol, chain)
    }
  },

  setProfileName(profileName: AccountControllerState['profileName'], chain?: Chain) {
    state.profileName = profileName

    if (ChainController.state.multiChainEnabled && chain) {
      ChainController.setAccountProp('profileName', profileName, chain)
    }
  },

  setProfileImage(profileImage: AccountControllerState['profileImage'], chain?: Chain) {
    state.profileImage = profileImage

    if (ChainController.state.multiChainEnabled && chain) {
      ChainController.setAccountProp('profileImage', profileImage, chain)
    }
  },

  setAddressExplorerUrl(explorerUrl: AccountControllerState['addressExplorerUrl'], chain?: Chain) {
    state.addressExplorerUrl = explorerUrl

    if (ChainController.state.multiChainEnabled && chain) {
      ChainController.setAccountProp('addressExplorerUrl', explorerUrl, chain)
    }
  },

  setSmartAccountDeployed(isDeployed: boolean, chain?: Chain) {
    state.smartAccountDeployed = isDeployed

    if (ChainController.state.multiChainEnabled && chain) {
      ChainController.setAccountProp('smartAccountDeployed', isDeployed, chain)
    }
  },

  setCurrentTab(currentTab: AccountControllerState['currentTab'], chain?: Chain) {
    state.currentTab = currentTab

    if (ChainController.state.multiChainEnabled && chain) {
      ChainController.setAccountProp('currentTab', currentTab, chain)
    }
  },

  setTokenBalance(tokenBalance: AccountControllerState['tokenBalance'], chain?: Chain) {
    if (tokenBalance) {
      state.tokenBalance = ref(tokenBalance)
    }

    if (ChainController.state.multiChainEnabled && chain) {
      if (tokenBalance) {
        ChainController.setAccountProp('tokenBalance', ref(tokenBalance), chain)
      }
    }
  },

  setConnectedWalletInfo(
    connectedWalletInfo: AccountControllerState['connectedWalletInfo'],
    chain?: Chain
  ) {
    state.connectedWalletInfo = connectedWalletInfo

    if (ChainController.state.multiChainEnabled && chain) {
      ChainController.setAccountProp('connectedWalletInfo', connectedWalletInfo, chain)
    }
  },

  setPreferredAccountType(
    preferredAccountType: AccountControllerState['preferredAccountType'],
    chain?: Chain
  ) {
    state.preferredAccountType = preferredAccountType

    if (ChainController.state.multiChainEnabled && chain) {
      ChainController.setAccountProp('preferredAccountType', preferredAccountType, chain)
    }
  },

  setSocialProvider(socialProvider: AccountControllerState['socialProvider'], chain?: Chain) {
    if (socialProvider) {
      state.socialProvider = socialProvider
    }

    if (ChainController.state.multiChainEnabled && chain) {
      if (socialProvider) {
        ChainController.setAccountProp('socialProvider', socialProvider, chain)
      }
    }
  },

  setSocialWindow(socialWindow: AccountControllerState['socialWindow'], chain?: Chain) {
    if (socialWindow) {
      state.socialWindow = ref(socialWindow)
    }

    if (ChainController.state.multiChainEnabled && chain) {
      if (socialWindow) {
        ChainController.setAccountProp('socialWindow', ref(socialWindow), chain)
      }
    }
  },

  async fetchTokenBalance() {
    const chainId = NetworkController.activeNetwork()?.id

    try {
      if (state.address && chainId) {
        const response = await BlockchainApiController.getBalance(state.address, chainId)

        const filteredBalances = response.balances.filter(
          balance => balance.quantity.decimals !== '0'
        )

        this.setTokenBalance(filteredBalances)
        SwapController.setBalances(SwapApiUtil.mapBalancesToSwapTokens(response.balances))
      }
    } catch (error) {
      SnackController.showError('Failed to fetch token balance')
    }
  },

  resetAccount(chain?: Chain) {
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
    state.socialProvider = undefined
    state.socialWindow = undefined

    if (ChainController.state.multiChainEnabled && chain) {
      ChainController.resetAccount(chain)
    }
  }
}
