import { BitcoinNetworkType } from 'sats-connect'

import { bitcoin, bitcoinTestnet } from '@reown/appkit/networks'

export function mapCaipNetworkToXverseName(caipNetworkId: string | undefined): BitcoinNetworkType {
  if (!caipNetworkId) {
    throw new Error('mapCaipNetworkToXverseName: Invalid caipNetworkId provided')
  }

  switch (caipNetworkId) {
    case bitcoin.caipNetworkId:
      return BitcoinNetworkType.Mainnet
    case bitcoinTestnet.caipNetworkId:
      return BitcoinNetworkType.Testnet4
    default:
      throw new Error(`Network ${caipNetworkId} not supported by Xverse wallet`)
  }
}

export function mapXverseNameToCaipNetwork(network: BitcoinNetworkType): string {
  switch (network) {
    case BitcoinNetworkType.Mainnet:
      return bitcoin.caipNetworkId
    case BitcoinNetworkType.Testnet4:
      return bitcoinTestnet.caipNetworkId
    default:
      throw new Error(`Network ${network} not supported by Xverse wallet`)
  }
}
