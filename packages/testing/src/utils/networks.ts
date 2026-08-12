import {
  bitcoin,
  bitcoinTestnet,
  mainnet,
  polygon,
  solana,
  solanaTestnet,
  stellar,
  stellarTestnet,
  ton,
  tonTestnet,
  tronMainnet,
  tronShastaTestnet
} from '@reown/appkit/networks'

export function getBalanceSymbolByLibrary(library: string) {
  switch (library) {
    case 'bitcoin':
      return 'BTC'
    case 'solana':
      return 'SOL'
    case 'stellar':
      return 'XLM'
    case 'ton':
      return 'TON'
    case 'tron':
      return 'TRX'
    default:
      return 'ETH'
  }
}

export function getNetworksByLibrary(library: string) {
  switch (library) {
    case 'bitcoin':
      return [bitcoin, bitcoinTestnet]
    case 'solana':
      return [solana, solanaTestnet]
    case 'stellar':
      return [stellar, stellarTestnet]
    case 'ton':
      return [ton, tonTestnet]
    case 'tron':
      return [tronMainnet, tronShastaTestnet]
    default:
      return [mainnet, polygon]
  }
}

export function getLastNetworkNameByLibrary(library: string) {
  switch (library) {
    case 'bitcoin':
      return bitcoinTestnet.name
    case 'solana':
      return solanaTestnet.name
    case 'stellar':
      return stellarTestnet.name
    case 'ton':
      return tonTestnet.name
    case 'tron':
      return tronShastaTestnet.name
    default:
      return polygon.name
  }
}
