export interface Account {
  connected: boolean
  chainSupported: boolean
  address: string
  chainId: string
  connector: string
  balance: string
  ensAvatar: string
}
