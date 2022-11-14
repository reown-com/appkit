import type { ListingResponse, PageParams } from '../../types/statefullCtrlTypes'
import { ConfigCtrl } from '../controllers/ConfigCtrl'

function formatParams(params: PageParams) {
  const stringParams = Object.fromEntries(
    Object.entries(params)
      .filter(([_, value]) => typeof value !== 'undefined' && value !== null && value !== '')
      .map(([key, value]) => [key, value.toString()])
  )

  return new URLSearchParams(stringParams).toString()
}

export function getExplorerApi() {
  return {
    url: 'https://explorer-api.walletconnect.com',
    projectId: ConfigCtrl.state.projectId
  }
}

export async function fetchWallets(params: PageParams): Promise<ListingResponse> {
  const { url, projectId } = getExplorerApi()
  const fetcUrl = `${url}/v3/wallets?projectId=${projectId}&${formatParams(params)}`
  const fetched = await fetch(fetcUrl)

  return fetched.json()
}
