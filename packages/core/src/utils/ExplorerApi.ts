import type { ListingResponse, PageParams } from '../../types/explorerTypes'
import { ConfigCtrl } from '../controllers/ConfigCtrl'

// -- helpers ------------------------------------------------------ //
export const EXPLORER_URL = 'https://explorer-api.walletconnect.com/v3'

function formatParams(params: PageParams) {
  const stringParams = Object.fromEntries(Object.entries(params).map(([k, v]) => [k, v.toString()]))

  return new URLSearchParams(stringParams).toString()
}

function formatUrl(params: PageParams) {
  const { projectId } = ConfigCtrl.state

  return `${EXPLORER_URL}/wallets?projectId=${projectId}&${formatParams(params)}`
}

// -- utilities ---------------------------------------------------- //
export async function fetchWallets(params: PageParams): Promise<ListingResponse> {
  const fetched = await fetch(formatUrl(params))

  return fetched.json()
}
