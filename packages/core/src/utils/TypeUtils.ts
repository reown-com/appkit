export type CaipAddress = `${string}:${string}:${string}`

export type CaipNetworkId = `${string}:${string}`

export interface CaipNetwork {
  id: CaipNetworkId
  name?: string
  imageId?: string
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
  imageId?: string
  explorerId?: string
}

export type CaipNamespaces = Record<
  string,
  {
    chains: CaipNetworkId[]
    methods: string[]
    events: string[]
  }
>

export type SdkVersion = `${'html' | 'react' | 'vue'}-wagmi-${string}`

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

export type ThemeMode = 'dark' | 'light'

export type ThemeVariables = Record<string, string>
