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
    if (ChainController.state.multiChainEnabled) {
      ChainController.setAccountProp('isConnected', true, chain)
    }

    state.isConnected = isConnected
  },

  setCaipAddress(caipAddress: AccountControllerState['caipAddress'], chain?: Chain) {
    if (ChainController.state.multiChainEnabled) {
      ChainController.setAccountProp('isConnected', true, chain)
      ChainController.setAccountProp('caipAddress', caipAddress, chain)
      ChainController.setAccountProp(
        'address',
        caipAddress ? CoreHelperUtil.getPlainAddress(caipAddress) : undefined,
        chain
      )
    }

    state.caipAddress = caipAddress
    state.address = caipAddress ? CoreHelperUtil.getPlainAddress(caipAddress) : undefined
  },

  setBalance(
    balance: AccountControllerState['balance'],
    balanceSymbol: AccountControllerState['balanceSymbol'],
    chain?: Chain
  ) {
    if (ChainController.state.multiChainEnabled) {
      ChainController.setAccountProp('balance', balance, chain)
      ChainController.setAccountProp('balanceSymbol', balanceSymbol, chain)
    }

    state.balance = balance
    state.balanceSymbol = balanceSymbol
  },

  setProfileName(profileName: AccountControllerState['profileName'], chain?: Chain) {
    if (ChainController.state.multiChainEnabled) {
      ChainController.setAccountProp('profileName', profileName, chain)
    }

    state.profileName = profileName
  },

  setProfileImage(profileImage: AccountControllerState['profileImage'], chain?: Chain) {
    if (ChainController.state.multiChainEnabled) {
      ChainController.setAccountProp('profileImage', profileImage, chain)
    }

    state.profileImage = profileImage
  },

  setAddressExplorerUrl(explorerUrl: AccountControllerState['addressExplorerUrl'], chain?: Chain) {
    if (ChainController.state.multiChainEnabled) {
      ChainController.setAccountProp('addressExplorerUrl', explorerUrl, chain)
    }

    state.addressExplorerUrl = explorerUrl
  },

  setSmartAccountDeployed(isDeployed: boolean, chain?: Chain) {
    if (ChainController.state.multiChainEnabled) {
      ChainController.setAccountProp('smartAccountDeployed', isDeployed, chain)
    }

    state.smartAccountDeployed = isDeployed
  },

  setCurrentTab(currentTab: AccountControllerState['currentTab'], chain?: Chain) {
    if (ChainController.state.multiChainEnabled) {
      ChainController.setAccountProp('currentTab', currentTab, chain)
    }

    state.currentTab = currentTab
  },

  setTokenBalance(tokenBalance: AccountControllerState['tokenBalance'], chain?: Chain) {
    if (ChainController.state.multiChainEnabled) {
      if (tokenBalance) {
        ChainController.setAccountProp('tokenBalance', ref(tokenBalance), chain)
      }
    }

    if (tokenBalance) {
      state.tokenBalance = ref(tokenBalance)
    }
  },

  setConnectedWalletInfo(
    connectedWalletInfo: AccountControllerState['connectedWalletInfo'],
    chain?: Chain
  ) {
    if (ChainController.state.multiChainEnabled) {
      ChainController.setAccountProp('connectedWalletInfo', connectedWalletInfo, chain)
    }

    state.connectedWalletInfo = connectedWalletInfo
  },

  setPreferredAccountType(
    preferredAccountType: AccountControllerState['preferredAccountType'],
    chain?: Chain
  ) {
    if (ChainController.state.multiChainEnabled) {
      ChainController.setAccountProp('preferredAccountType', preferredAccountType, chain)
    }

    state.preferredAccountType = preferredAccountType
  },

  setSocialProvider(socialProvider: AccountControllerState['socialProvider'], chain?: Chain) {
    if (ChainController.state.multiChainEnabled) {
      if (socialProvider) {
        ChainController.setAccountProp('socialProvider', socialProvider, chain)
      }
    }

    if (socialProvider) {
      state.socialProvider = socialProvider
    }
  },

  setSocialWindow(socialWindow: AccountControllerState['socialWindow'], chain?: Chain) {
    if (ChainController.state.multiChainEnabled) {
      if (socialWindow) {
        ChainController.setAccountProp('socialWindow', ref(socialWindow), chain)
      }
    }

    if (socialWindow) {
      state.socialWindow = ref(socialWindow)
    }
  },

  async fetchTokenBalance() {
    // if (ChainController.state.multiChainEnabled) {
    //   ChainController.setAccountProp('isConnected', true, chain)
    // }
    // TODO(enes): handle

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
    if (ChainController.state.multiChainEnabled) {
      ChainController.resetAccount(chain)
      return
    }

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
  }
}
