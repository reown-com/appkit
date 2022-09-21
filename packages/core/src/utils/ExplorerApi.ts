import type { ListingResponse, PageParams } from '../../types/explorerTypes'
import { ConfigCtrl } from '../controllers/ConfigCtrl'

// -- helpers ------------------------------------------------------ //
export function getExplorerApi() {
  return {
    url: 'https://explorer-api.walletconnect.com',
    projectId: ConfigCtrl.state.projectId
  }
}

function formatParams(params: PageParams) {
  const stringParams = Object.fromEntries(
    Object.entries(params)
      .filter(([_, v]) => typeof v !== 'undefined' && v !== null && v !== '')
      .map(([k, v]) => [k, v.toString()])
  )

  return new URLSearchParams(stringParams).toString()
}

function formatUrl(params: PageParams) {
  const { url, projectId } = getExplorerApi()

  return `${url}/v3/wallets?projectId=${projectId}&${formatParams(params)}`
}

// -- utilities ---------------------------------------------------- //
export async function fetchWallets(params: PageParams): Promise<ListingResponse> {
  const fetched = await fetch(formatUrl(params))

  return fetched.json()
}
