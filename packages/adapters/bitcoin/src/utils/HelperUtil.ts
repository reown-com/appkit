import { BitcoinNetworkType } from 'sats-connect'

export function mapCaipNetworkToXverseName(caipNetworkId: string): BitcoinNetworkType {
  switch (caipNetworkId) {
    case 'bip122:000000000019d6689c085ae165831e93':
      return BitcoinNetworkType.Mainnet
    case 'bip122:000000000933ea01ad0ee984209779ba':
      return BitcoinNetworkType.Signet
    default:
      throw new Error(`Network ${caipNetworkId} not supported by Xverse wallet`)
  }
}

export function mapXverseNameToCaipNetwork(network: BitcoinNetworkType): string {
  switch (network) {
    case BitcoinNetworkType.Mainnet:
      return 'bip122:000000000019d6689c085ae165831e93'
    case BitcoinNetworkType.Signet:
      return 'bip122:000000000933ea01ad0ee984209779ba'
    default:
      throw new Error(`Network ${network} not supported by Xverse wallet`)
  }
}
