import type { ListingResponse, PageParams } from '../types/controllerTypes'

const EXPLORER_API = 'https://explorer-api.walletconnect.com'
const APP_TAG = 'app=2'

function formatParams(params: PageParams) {
  const stringParams = Object.fromEntries(
    Object.entries(params)
      .filter(([_, value]) => typeof value !== 'undefined' && value !== null && value !== '')
      .map(([key, value]) => [key, value.toString()])
  )

  return new URLSearchParams(stringParams).toString()
}

export const ExplorerUtil = {
  async fetchWallets(projectId: string, params: PageParams): Promise<ListingResponse> {
    const urlParams = formatParams(params)
    const fetcUrl = `${EXPLORER_API}/v3/wallets?projectId=${projectId}&${APP_TAG}&${urlParams}`
    const fetched = await fetch(fetcUrl)

    return fetched.json()
  },

  formatImageUrl(projectId: string, imageId: string) {
    return `${EXPLORER_API}/v2/logo/lg/${imageId}?projectId=${projectId}&${APP_TAG}`
  }
}
