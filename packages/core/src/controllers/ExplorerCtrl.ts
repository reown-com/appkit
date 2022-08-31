import { proxy, subscribe as valtioSub } from 'valtio/vanilla'
import type { GenericParams, ListingResponse, PageParams } from '../../types/explorerTypes'
import { ConfigCtrl } from './ConfigCtrl'

interface State {
  loading: boolean
  search: Record<string, string>
  page: Record<string, number>
  wallets: ListingResponse
}

const state = proxy<State>({
  loading: false,
  search: {},
  page: {},
  wallets: { listings: {}, count: 0 }
})

const BASE_URL = 'https://registry-staging.walletconnect.com/v3'

function formatParams(params: GenericParams) {
  const stringStringRecord: Record<string, string> = Object.fromEntries(
    Object.entries(params).map(([k, v]) => [k, v.toString()])
  )

  return new URLSearchParams(stringStringRecord).toString()
}

function formatUrl(endpoint: string, params: GenericParams) {
  return `${BASE_URL}/${endpoint}?${formatParams(params)}`
}

async function fetchEndpoint<TReturn = ListingResponse>(
  endpoint: string,
  params: PageParams
): Promise<TReturn> {
  state.page[endpoint] = params.page ?? 0
  state.search[endpoint] = params.search ?? ''

  const fetched = await fetch(
    formatUrl(endpoint, { ...params, projectId: ConfigCtrl.state.projectId })
  )

  return fetched.json()
}

export const ExplorerCtrl = {
  state,

  subscribe(callback: (newState: State) => void) {
    return valtioSub(state, () => callback(state))
  },

  async getWallets(params: PageParams) {
    const fetched = await fetchEndpoint('wallets', params)
    state.wallets = fetched

    return fetched
  }
}
