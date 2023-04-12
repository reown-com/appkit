import { ConfigCtrl } from '../controllers/ConfigCtrl'
import type { ListingParams, ListingResponse } from '../types/controllerTypes'

// -- Helpers -------------------------------------------------------
const W3M_API = 'https://explorer-api.walletconnect.com'

async function fetchListings(endpoint: string, params: ListingParams) {
  const url = new URL(endpoint, W3M_API)
  url.searchParams.append('projectId', ConfigCtrl.state.projectId)
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.append(key, String(value))
    }
  })
  const request = await fetch(url)

  return request.json() as Promise<ListingResponse>
}

// -- Utility -------------------------------------------------------
export const ExplorerUtil = {
  async getDesktopListings(params: ListingParams) {
    return fetchListings('/w3m/v1/getDesktopListings', params)
  },

  async getMobileListings(params: ListingParams) {
    return fetchListings('/w3m/v1/getMobileListings', params)
  },

  async getInjectedListings(params: ListingParams) {
    return fetchListings('/w3m/v1/getInjectedListings', params)
  },

  async getAllListings(params: ListingParams) {
    return fetchListings('/w3m/v1/getAllListings', params)
  },

  getWalletImageUrl(imageId: string) {
    return `${W3M_API}/w3m/v1/getWalletImage/${imageId}?projectId=${ConfigCtrl.state.projectId}`
  },

  getAssetImageUrl(imageId: string) {
    return `${W3M_API}/w3m/v1/getAssetImage/${imageId}?projectId=${ConfigCtrl.state.projectId}`
  }
}
