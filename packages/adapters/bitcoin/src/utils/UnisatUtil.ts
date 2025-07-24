import type { UnisatConnector } from '../connectors/UnisatConnector/types.js'

export const UNISAT_CONNECTORS: Omit<
  UnisatConnector.GetWalletParams,
  'requestedChains' | 'getActiveNetwork'
>[] = [
  {
    id: 'unisat',
    name: 'Unisat Wallet',
    imageUrl:
      // Cloudflare Image URL
      'https://imagedelivery.net/_aTEfDRm7z3tKgu9JhfeKA/530e8a71-f014-46e5-1302-26d1eff60200/sm'
  },
  {
    id: 'bitget',
    name: 'Bitget Wallet',
    imageUrl:
      // Bitget Sui has an appropiate icon
      (window as UnisatConnector.UnisatWindow)?.bitkeep?.suiWallet?.icon ?? ''
  },
  {
    id: 'binancew3w',
    name: 'Binance Web3 Wallet',
    imageUrl: ''
  }
]
