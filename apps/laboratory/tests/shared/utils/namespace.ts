export function getNamespaceByLibrary(library: string) {
  switch (library) {
    case 'solana':
      return 'solana'
    case 'bitcoin':
      return 'bip122'
    case 'ton':
      return 'ton'
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
    case 'TON':
      return 'ton'
    default:
      return 'eip155'
  }
}

export function getTestnetByLibrary(library: string) {
  switch (library) {
    case 'solana':
      return 'Solana Devnet'
    case 'bitcoin':
      return 'Bitcoin Testnet'
    case 'ton':
      return 'TON Testnet'
    case 'wagmi':
    case 'ethers':
    case 'ethers5':
      return 'Polygon'
    default:
      return 'Polygon'
  }
}

export function getTestnet2ByLibrary(library: string) {
  switch (library) {
    case 'solana':
      return 'Solana Testnet'
    case 'bitcoin':
      return 'Bitcoin Testnet'
    case 'wagmi':
    case 'ethers':
    case 'ethers5':
      return 'OP Mainnet'
    default:
      return 'OP Mainnet'
  }
}

export function getMainnetByLibrary(library: string) {
  switch (library) {
    case 'solana':
      return 'Solana'
    case 'bitcoin':
      return 'Bitcoin'
    case 'ton':
      return 'TON'
    case 'wagmi':
    case 'ethers':
    case 'ethers5':
      return 'Ethereum'
    default:
      return 'Ethereum'
  }
}
