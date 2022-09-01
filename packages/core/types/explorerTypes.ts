export interface PageParams {
  page?: number
  search?: string
  entries?: number
  version?: number
}

export interface ImageUrl {
  sm: string
  md: string
  lg: string
}

export interface Colors {
  primary: string
  secondary: string
}

export interface AppInfo {
  browser: string
  ios: string
  android: string
  mac: string
  window: string
  linux: string
}

export interface PlatformInfo {
  native: string
  universal: string
}

export interface Metadata {
  shortName: string
  colors: Colors
}

export interface Listing {
  id: string
  name: string
  description: string
  homepage: string
  chains: string[]
  versions: string[]
  app_type: string
  image_id: string
  image_url: ImageUrl
  app: AppInfo
  mobile: PlatformInfo
  desktop: PlatformInfo
  metadata: Metadata
}

export type ListingRecords = Record<string, Listing>

export interface ListingResponse {
  listings: ListingRecords
  count: number
}
