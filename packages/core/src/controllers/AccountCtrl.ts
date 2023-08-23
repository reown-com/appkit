import { proxy, subscribe as valtioSub } from 'valtio/vanilla'
import type { AccountCtrlState } from '../types/controllerTypes'
import { BlockchainApiUtil } from '../utils/BlockchainApiUtil'
import { ClientCtrl } from './ClientCtrl'
import { ConfigCtrl } from './ConfigCtrl'
import { OptionsCtrl } from './OptionsCtrl'

// -- initial state ------------------------------------------------ //
const state = proxy<AccountCtrlState>({
  address: undefined,
  profileName: undefined,
  profileAvatar: undefined,
  profileLoading: false,
  balanceLoading: false,
  balance: undefined,
  isConnected: false
})

// -- controller --------------------------------------------------- //
export const AccountCtrl = {
  state,

  subscribe(callback: (newState: AccountCtrlState) => void) {
    return valtioSub(state, () => callback(state))
  },

  getAccount() {
    const account = ClientCtrl.client().getAccount()
    state.address = account.address
    state.isConnected = account.isConnected
  },

  async fetchProfile(
    preloadAvatarFn: (avatar: string) => Promise<unknown>,
    profileAddress?: `0x${string}`
  ) {
    try {
      state.profileLoading = true
      state.profileName = null
      state.profileAvatar = null
      const address = profileAddress ?? state.address
      const mainnetId = 1
      const isMainnetConfigured = OptionsCtrl.state.chains?.find(chain => chain.id === mainnetId)
      if (address && isMainnetConfigured) {
        try {
          const profile = await BlockchainApiUtil.getIdentity(address, mainnetId)
          state.profileName = profile.name
          state.profileAvatar = profile.avatar
        } catch {
          // If problem resolving the identity using our own Identity API, fallback to RPC resolution
          const name = await ClientCtrl.client().fetchEnsName({ address, chainId: mainnetId })
          state.profileName = name
          if (name) {
            const avatar = await ClientCtrl.client().fetchEnsAvatar({ name, chainId: mainnetId })
            state.profileAvatar = avatar
          }
        }
        if (state.profileAvatar) {
          await preloadAvatarFn(state.profileAvatar)
        }
      }
    } finally {
      state.profileLoading = false
    }
  },

  async fetchBalance(balanceAddress?: `0x${string}`) {
    try {
      const { chain } = ClientCtrl.client().getNetwork()
      const { tokenContracts } = ConfigCtrl.state
      let token: `0x${string}` | undefined = undefined
      if (chain && tokenContracts) {
        token = tokenContracts[chain.id] as `0x${string}`
      }
      state.balanceLoading = true
      const address = balanceAddress ?? state.address
      if (address) {
        const balance = await ClientCtrl.client().fetchBalance({ address, token })
        state.balance = { amount: balance.formatted, symbol: balance.symbol }
      }
    } finally {
      state.balanceLoading = false
    }
  },

  setAddress(address: AccountCtrlState['address']) {
    state.address = address
  },

  setIsConnected(isConnected: AccountCtrlState['isConnected']) {
    state.isConnected = isConnected
  },

  resetBalance() {
    state.balance = undefined
  },

  resetAccount() {
    state.address = undefined
    state.isConnected = false
    state.profileName = undefined
    state.profileAvatar = undefined
    state.balance = undefined
  }
}
