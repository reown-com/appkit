import { proxy, ref } from 'valtio/vanilla'

import type { CaipAddress, ChainNamespace } from '@reown/appkit-common'
import type { Balance } from '@reown/appkit-common'
import type { W3mFrameTypes } from '@reown/appkit-wallet'

import { ConstantsUtil } from '../utils/ConstantsUtil.js'
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js'
import { StorageUtil } from '../utils/StorageUtil.js'
import { SwapApiUtil } from '../utils/SwapApiUtil.js'
import type {
  AccountType,
  AccountTypeMap,
  ConnectedWalletInfo,
  ConnectionStatus,
  SocialProvider,
  User
} from '../utils/TypeUtil.js'
import { BlockchainApiController } from './BlockchainApiController.js'
import { ChainController } from './ChainController.js'
import { SnackController } from './SnackController.js'
import { SwapController } from './SwapController.js'

// -- Types --------------------------------------------- //
export interface AccountControllerState {
  currentTab: number
  caipAddress?: CaipAddress
  user?: User
  address?: string
  addressLabels: Map<string, string>
  allAccounts: AccountType[]
  balance?: string
  balanceSymbol?: string
  balanceLoading?: boolean
  profileName?: string | null
  profileImage?: string | null
  addressExplorerUrl?: string
  smartAccountDeployed?: boolean
  socialProvider?: SocialProvider
  tokenBalance?: Balance[]
  shouldUpdateToAddress?: string
  connectedWalletInfo?: ConnectedWalletInfo
  preferredAccountType?: W3mFrameTypes.AccountType
  socialWindow?: Window
  farcasterUrl?: string
  status?: 'reconnecting' | 'connected' | 'disconnected' | 'connecting'
  lastRetry?: number
}

// -- State --------------------------------------------- //
export const accountState = proxy<AccountControllerState>({
  currentTab: 0,
  tokenBalance: [],
  smartAccountDeployed: false,
  addressLabels: new Map(),
  allAccounts: []
})

// -- Handlers --------------------------------------------- //
export function replaceAccountState(newState?: AccountControllerState) {
  if (!newState) {
    return
  }

  Object.assign(accountState, ref(newState))
}

export function subscribeAccount(callback: (val: AccountControllerState) => void) {
  return ChainController.subscribeChainProp('accountState', state => {
    if (state) {
      return callback(state)
    }

    return undefined
  })
}

export function subscribeAccountKey<K extends keyof AccountControllerState>(
  property: K,
  callback: (val: AccountControllerState[K]) => void,
  chain?: ChainNamespace
) {
  let prev: AccountControllerState[K] | undefined = undefined

  return ChainController.subscribeChainProp(
    'accountState',
    state => {
      if (state) {
        const nextValue = state[property as keyof typeof state] as AccountControllerState[K]
        if (prev !== nextValue) {
          prev = nextValue
          callback(nextValue)
        }
      }
    },
    chain
  )
}

export function setStatus(
  status: AccountControllerState['status'],
  chain: ChainNamespace | undefined
) {
  StorageUtil.setConnectionStatus(status as ConnectionStatus)
  ChainController.setAccountProp('status', status, chain)
}

export function getCaipAddress(chain: ChainNamespace | undefined) {
  return ChainController.getAccountProp('caipAddress', chain)
}

export function setCaipAddress(
  caipAddress: AccountControllerState['caipAddress'],
  chain: ChainNamespace | undefined
) {
  const newAddress = caipAddress ? CoreHelperUtil.getPlainAddress(caipAddress) : undefined

  if (chain === ChainController.state.activeChain) {
    ChainController.state.activeCaipAddress = caipAddress
  }

  ChainController.setAccountProp('caipAddress', caipAddress, chain)
  ChainController.setAccountProp('address', newAddress, chain)
}

export function setBalance(
  balance: AccountControllerState['balance'],
  balanceSymbol: AccountControllerState['balanceSymbol'],
  chain: ChainNamespace
) {
  ChainController.setAccountProp('balance', balance, chain)
  ChainController.setAccountProp('balanceSymbol', balanceSymbol, chain)
}

export function setProfileName(
  profileName: AccountControllerState['profileName'],
  chain: ChainNamespace
) {
  ChainController.setAccountProp('profileName', profileName, chain)
}

export function setProfileImage(
  profileImage: AccountControllerState['profileImage'],
  chain?: ChainNamespace
) {
  ChainController.setAccountProp('profileImage', profileImage, chain)
}

export function setUser(user: AccountControllerState['user'], chain: ChainNamespace | undefined) {
  ChainController.setAccountProp('user', user, chain)
}

export function setAddressExplorerUrl(
  explorerUrl: AccountControllerState['addressExplorerUrl'],
  chain: ChainNamespace | undefined
) {
  ChainController.setAccountProp('addressExplorerUrl', explorerUrl, chain)
}

export function setSmartAccountDeployed(isDeployed: boolean, chain: ChainNamespace | undefined) {
  ChainController.setAccountProp('smartAccountDeployed', isDeployed, chain)
}

export function setCurrentAccountTab(currentTab: AccountControllerState['currentTab']) {
  ChainController.setAccountProp('currentTab', currentTab, ChainController.state.activeChain)
}

export function setTokenBalance(
  tokenBalance: AccountControllerState['tokenBalance'],
  chain: ChainNamespace | undefined
) {
  if (tokenBalance) {
    ChainController.setAccountProp('tokenBalance', tokenBalance, chain)
  }
}

export function setShouldUpdateToAddress(address: string, chain: ChainNamespace | undefined) {
  ChainController.setAccountProp('shouldUpdateToAddress', address, chain)
}

export function setAllAccounts<N extends ChainNamespace>(
  accounts: AccountTypeMap[N][],
  namespace: N
) {
  ChainController.setAccountProp('allAccounts', accounts, namespace)
}

export function addAddressLabel(address: string, label: string, chain: ChainNamespace | undefined) {
  const map = ChainController.getAccountProp('addressLabels', chain) || new Map()
  map.set(address, label)
  ChainController.setAccountProp('addressLabels', map, chain)
}

export function removeAddressLabel(address: string, chain: ChainNamespace | undefined) {
  const map = ChainController.getAccountProp('addressLabels', chain) || new Map()
  map.delete(address)
  ChainController.setAccountProp('addressLabels', map, chain)
}

export function setConnectedWalletInfo(
  connectedWalletInfo: AccountControllerState['connectedWalletInfo'],
  chain: ChainNamespace
) {
  ChainController.setAccountProp('connectedWalletInfo', connectedWalletInfo, chain, false)
}

export function setPreferredAccountType(
  preferredAccountType: AccountControllerState['preferredAccountType'],
  chain: ChainNamespace
) {
  ChainController.setAccountProp('preferredAccountType', preferredAccountType, chain)
}

export function setSocialProvider(
  socialProvider: AccountControllerState['socialProvider'],
  chain: ChainNamespace | undefined
) {
  if (socialProvider) {
    ChainController.setAccountProp('socialProvider', socialProvider, chain)
  }
}

export function setSocialWindow(
  socialWindow: AccountControllerState['socialWindow'],
  chain: ChainNamespace | undefined
) {
  ChainController.setAccountProp(
    'socialWindow',
    socialWindow ? ref(socialWindow) : undefined,
    chain
  )
}

export function setFarcasterUrl(
  farcasterUrl: AccountControllerState['farcasterUrl'],
  chain: ChainNamespace | undefined
) {
  ChainController.setAccountProp('farcasterUrl', farcasterUrl, chain)
}

export function resetAccount(chain: ChainNamespace) {
  ChainController.resetAccount(chain)
}

export async function fetchTokenBalance(onError?: (error: unknown) => void): Promise<Balance[]> {
  accountState.balanceLoading = true
  const chainId = ChainController.state.activeCaipNetwork?.caipNetworkId
  const chain = ChainController.state.activeCaipNetwork?.chainNamespace
  const caipAddress = ChainController.state.activeCaipAddress
  const address = caipAddress ? CoreHelperUtil.getPlainAddress(caipAddress) : undefined
  if (
    accountState.lastRetry &&
    !CoreHelperUtil.isAllowedRetry(accountState.lastRetry, 30 * ConstantsUtil.ONE_SEC_MS)
  ) {
    accountState.balanceLoading = false

    return []
  }

  try {
    if (address && chainId && chain) {
      const response = await BlockchainApiController.getBalance(address, chainId)

      const filteredBalances = response.balances.filter(
        balance => balance.quantity.decimals !== '0'
      )

      setTokenBalance(filteredBalances, chain)
      SwapController.setBalances(SwapApiUtil.mapBalancesToSwapTokens(response.balances))
      accountState.lastRetry = undefined
      accountState.balanceLoading = false

      return filteredBalances
    }
  } catch (error) {
    accountState.lastRetry = Date.now()

    onError?.(error)
    SnackController.showError('Token Balance Unavailable')
  } finally {
    accountState.balanceLoading = false
  }

  return []
}
