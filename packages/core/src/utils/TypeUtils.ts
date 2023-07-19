export type CaipAddress = `${string}:${string}:${string}`

export type CaipChainId = `${string}:${string}`

export interface ExplorerListing {
  id: string
  name: string
  homepage: string
  image_id: string
  app: {
    browser?: string
    ios?: string
    android?: string
    mac?: string
    windows?: string
    linux?: string
    chrome?: string
    firefox?: string
    safari?: string
    edge?: string
    opera?: string
  }
  injected: {
    injected_id: string
    namespace: string
  }[]
  mobile: {
    native: string
    universal: string
  }
  desktop: {
    native: string
    universal: string
  }
}

export interface ExplorerListingsRequest {
  page?: number
}

export interface ExplorerListingsResponse {
  listings: ExplorerListing[]
  total: number
}

export type ProjectId = string
