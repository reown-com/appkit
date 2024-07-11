import type { W3mFrameTypes } from '@web3modal/wallet'
import { subscribeKey as subKey } from 'valtio/utils'
import { proxy, subscribe as sub } from 'valtio/vanilla'
import { ConnectorController } from './ConnectorController.js'
import { NetworkController } from './NetworkController.js'

type PaymasterToken = W3mFrameTypes.Responses['FrameGetPaymasterTokensResponse']

export interface PaymasterControllerState {
  selectedToken: PaymasterToken[number] | null
  tokens: PaymasterToken
  suggestedTokens: PaymasterToken
  fetchError: boolean
}

type StateKey = keyof PaymasterControllerState

// -- State --------------------------------------------- //

const state = proxy<PaymasterControllerState>({
  selectedToken: null,
  tokens: [],
  suggestedTokens: [],
  fetchError: false
})

// -- Controller ---------------------------------------- //

export const PaymasterController = {
  state,

  subscribe(callback: (value: PaymasterControllerState) => void) {
    return sub(state, () => callback(state))
  },

  subscribeKey<K extends StateKey>(key: K, callback: (value: PaymasterControllerState[K]) => void) {
    return subKey(state, key, callback)
  },

  setInitialToken() {
    const caipNetwork = NetworkController.state.caipNetwork
    if (!caipNetwork) {
      return
    }

    const token = state.tokens?.find(item => item.name === caipNetwork.name)
    if (!token) {
      return
    }

    state.selectedToken = token
  },

  async getTokenList() {
    const auth = ConnectorController.getAuthConnector()
    const tokens = await auth?.provider?.getPaymasterTokens()

    if (tokens) {
      state.tokens = tokens
    }

    if (!state.selectedToken) {
      PaymasterController.setInitialToken()
    }
  },

  selectToken(token: PaymasterToken[number] | undefined) {
    state.selectedToken = token || null
  },

  searchTokens(query: string) {
    state.suggestedTokens = state.tokens.filter(token => {
      const valueText = `${token.name} ${token.symbol}`

      return valueText.toLowerCase().includes(query.toLowerCase())
    })
  }
}
