import {
  bitcoin,
  bitcoinTestnet,
  mainnet,
  polygon,
  solana,
  solanaTestnet
} from '@reown/appkit/networks'

export function getBalanceSymbolByLibrary(library: string) {
  switch (library) {
    case 'bitcoin':
      return 'BTC'
    case 'solana':
      return 'SOL'
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
    default:
      return polygon.name
  }
}
