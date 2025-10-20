import { CoreHelperUtil } from '@reown/appkit-controllers'

import type { UnisatConnector } from '../connectors/UnisatConnector/types.js'

export const UNISAT_CONNECTORS: Omit<
  UnisatConnector.GetWalletParams,
  'requestedChains' | 'getActiveNetwork'
>[] = [
  {
    id: 'unisat',
    name: 'Unisat Wallet',
    imageUrl:
      // Cloudflare Image URL for Unisat Wallet
      'https://imagedelivery.net/_aTEfDRm7z3tKgu9JhfeKA/530e8a71-f014-46e5-1302-26d1eff60200/sm'
  },
  {
    id: 'bitget',
    name: 'Bitget Wallet',
    imageUrl:
      // Bitget Sui has an appropiate icon, so we use the window object to get it
      CoreHelperUtil.isClient()
        ? ((window as UnisatConnector.UnisatWindow)?.bitkeep?.suiWallet?.icon ?? '')
        : ''
  },
  {
    id: 'binancew3w',
    name: 'Binance Web3 Wallet',
    imageUrl:
      // Cloudflare Image URL for Binance Web3 Wallet
      'https://imagedelivery.net/_aTEfDRm7z3tKgu9JhfeKA/7c1961a6-9c4c-4632-8710-d02a43df1300/sm'
  }
]
