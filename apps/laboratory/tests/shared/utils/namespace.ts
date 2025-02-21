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
      return 'solana'
    case 'Bitcoin':
      return 'bip122'
    default:
      return 'eip155'
  }
}
