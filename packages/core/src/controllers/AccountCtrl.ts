import { proxy, subscribe as valtioSub } from 'valtio/vanilla'
import type { AccountCtrlState } from '../types/controllerTypes'
import { ClientCtrl } from './ClientCtrl'

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
      const address = profileAddress ?? state.address
      const { id } = ClientCtrl.client().getDefaultChain()
      if (address && id === 1) {
        const [name, avatar] = await Promise.all([
          ClientCtrl.client().fetchEnsName({ address, chainId: 1 }),
          ClientCtrl.client().fetchEnsAvatar({ address, chainId: 1 })
        ])
        if (avatar) {
          await preloadAvatarFn(avatar)
        }
        state.profileName = name
        state.profileAvatar = avatar
      }
    } finally {
      state.profileLoading = false
    }
  },

  async fetchBalance(balanceAddress?: `0x${string}`) {
    try {
      state.balanceLoading = true
      const address = balanceAddress ?? state.address
      if (address) {
        const balance = await ClientCtrl.client().fetchBalance({ address })
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
