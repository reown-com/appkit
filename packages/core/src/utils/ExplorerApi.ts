import type { ListingResponse, PageParams } from '../../types/explorerTypes'
import { ConfigCtrl } from '../controllers/ConfigCtrl'

// -- helpers ------------------------------------------------------ //
const WALLETS_URL = 'https://explorer-api.walletconnect.com/v1/wallets'

function formatParams(params: PageParams) {
  const stringParams = Object.fromEntries(Object.entries(params).map(([k, v]) => [k, v.toString()]))

  return new URLSearchParams(stringParams).toString()
}

function formatUrl(params: PageParams) {
  const { projectId } = ConfigCtrl.state

  return `${WALLETS_URL}?projectId=${projectId}&${formatParams(params)}`
}

// -- utilities ---------------------------------------------------- //
export async function fetchWallets(params: PageParams): Promise<ListingResponse> {
  const fetched = await fetch(formatUrl(params))

  return fetched.json()
}
