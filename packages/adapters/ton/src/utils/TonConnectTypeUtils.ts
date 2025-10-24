export type TonWalletFeature =
  | { name: 'SendTransaction'; maxMessages?: number; extraCurrencySupported?: boolean }
  | { name: 'SignData'; types?: Array<'text' | 'binary' | 'cell'> }
  | string

export interface TonConnectEvent {
  event?: string
  payload?: {
    items?: Array<{ name?: string; address?: string }>
    message?: string
  }
}

export interface TonConnectResponse {
  event?: string
  payload?: {
    items?: Array<{ name?: string; address?: string }>
    message?: string
  }
  result?: unknown
  signature?: string
  boc?: string
  error?: {
    code?: number
    message?: string
  }
}

export interface InjectedWalletApi {
  deviceInfo?: unknown
  walletInfo?: {
    name?: string
    app_name?: string
    tondns?: string
    image?: string
    about_url?: string
    platforms?: string[]
    features?: TonWalletFeature[]
  }
  protocolVersion?: number
  isWalletBrowser?: boolean
  connect(
    protocolVersion: number,
    message: {
      manifestUrl: string
      items: Array<{ name: 'ton_addr' } | { name: 'ton_proof'; payload: string }>
    }
  ): Promise<TonConnectResponse>
  restoreConnection?(): Promise<TonConnectEvent>
  send(message: { method: string; params: string[]; id: string }): Promise<TonConnectResponse>
  listen(callback: (event: TonConnectEvent) => void): () => void
  disconnect(): Promise<void>
}
