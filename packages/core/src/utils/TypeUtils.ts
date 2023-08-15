export type CaipAddress = `${string}:${string}:${string}`

export type CaipNetworkId = `${string}:${string}`

export interface CaipNetwork {
  id: CaipNetworkId
  name?: string
  imageSrc?: string
}

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

export interface ExplorerSearchRequest {
  search: string
}

export interface ExplorerListingsResponse {
  listings: ExplorerListing[]
  total: number
}

export interface LinkingRecord {
  redirect: string
  href: string
}

export type ProjectId = string

export type Platform = 'mobile' | 'desktop' | 'injected' | 'web' | 'qrcode' | 'unsupported'

export type ConnectorType = 'EXTERNAL' | 'WALLET_CONNECT' | 'INJECTED'

export interface Connector {
  id: string
  type: ConnectorType
  name?: string
  imageSrc?: string
}

export type CaipNamespaces = Record<
  string,
  {
    chains: CaipNetworkId[]
    methods: string[]
    events: string[]
  }
>

// --- new api types ----
export interface ApiWallet {
  id: string
  name: string
  homepage: string
  image_id: string
  order: number
  mobile_link: string | null
  desktop_link: string | null
  webapp_link: string | null
  app_store: string | null
  play_store: string | null
  injected:
    | {
        namespace: string
        injected_id: string
      }[]
    | null
}

export interface ApiGetWalletsRequest {
  page: number
  entries: number
  search?: string
  include?: string[]
  exclude?: string[]
}

export interface ApiGetWalletsResponse {
  data: ApiWallet[]
  count: number
}
