import { subscribeKey as subKey } from 'valtio/utils'
import { proxy } from 'valtio/vanilla'
import { FetchUtil } from '../utils/FetchUtil'
import { ExplorerListing } from '../utils/TypeUtils'

// -- Helpers ------------------------------------------- //
const api = new FetchUtil({ baseUrl: 'https://explorer-api.walletconnect.com' })

// -- Types --------------------------------------------- //
export interface ExplorerApiControllerState {
  wallets: { listings: ExplorerListing[]; page: number; total: number }
  search: { listings: ExplorerListing[]; page: number; total: number }
}

type StateKey = keyof ExplorerApiControllerState

// -- State --------------------------------------------- //
const state = proxy<ExplorerApiControllerState>({
  wallets: { listings: [], total: 0, page: 1 },
  search: { listings: [], total: 0, page: 1 }
})

// -- Controller ---------------------------------------- //
export const ExplorerApiController = {
  state,

  subscribeKey<K extends StateKey>(
    key: K,
    callback: (value: ExplorerApiControllerState[K]) => void
  ) {
    return subKey(state, key, callback)
  }
}
