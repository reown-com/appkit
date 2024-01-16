import { proxy, subscribe as sub } from 'valtio/vanilla'
import { OptionsController } from './OptionsController.js'
import { SnackController } from './SnackController.js'
import type { BlockchainApiToken } from '../utils/TypeUtil.js'
import { BlockchainApiController } from './BlockchainApiController.js'

// -- Types --------------------------------------------- //
export type Token = { id: string; name: string; symbol: string }

export interface PortfolioTokenControllerState {
  tokens: BlockchainApiToken[]
  loading: boolean
  empty: boolean
  next: string | undefined
}

// -- State --------------------------------------------- //
const state = proxy<PortfolioTokenControllerState>({
  tokens: [],
  loading: false,
  empty: false,
  next: undefined
})

// -- Controller ---------------------------------------- //
export const PortfolioTokenController = {
  state,

  subscribe(callback: (newState: PortfolioTokenControllerState) => void) {
    return sub(state, () => callback(state))
  },

  async fetchTokens(accountAddress?: string) {
    const { projectId } = OptionsController.state

    if (!projectId || !accountAddress) {
      throw new Error("Tokens can't be fetched without a projectId and an accountAddress")
    }

    state.loading = true

    try {
      const response = await BlockchainApiController.fetchTokens({
        account: accountAddress,
        projectId,
        cursor: state.next
      })

      state.loading = false
      state.tokens = response.data
      state.empty = response.data.length === 0
    } catch (error) {
      SnackController.showError('Failed to fetch tokens')
      state.loading = false
      state.empty = true
    }
  },

  resetTokens() {
    state.tokens = []
    state.loading = false
    state.empty = false
    state.next = undefined
  }
}
