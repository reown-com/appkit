export function getNamespaceByLibrary(library: string) {
  switch (library) {
    case 'solana':
      return 'solana'
    case 'bitcoin':
      return 'bip122'
    default:
      return 'eip155'
  }
}

export function getNamespaceByNetworkName(networkName: string) {
  switch (networkName) {
    case 'Solana':
    case 'Solana Testnet':
    case 'Solana Devnet':
      return 'solana'
    case 'Bitcoin':
    case 'Bitcoin Testnet':
      return 'bip122'
    default:
      return 'eip155'
  }
}
