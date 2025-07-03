import { CaipNetworksUtil } from '@reown/appkit-utils'

import { bitcoin, bitcoinTestnet, mainnet, polygon, solana, solanaTestnet } from './networks.js'

export const mockProjectId = 'mockProjectId'

const extendProps = {
  projectId: mockProjectId,
  customNetworkImageUrls: {},
  customRpcUrls: {}
}

export const mainnetCaipNetwork = CaipNetworksUtil.extendCaipNetwork(mainnet, extendProps)

export const polygonCaipNetwork = CaipNetworksUtil.extendCaipNetwork(polygon, extendProps)

export const solanaCaipNetwork = CaipNetworksUtil.extendCaipNetwork(solana, extendProps)

export const solanaTestnetCaipNetwork = CaipNetworksUtil.extendCaipNetwork(
  solanaTestnet,
  extendProps
)

export const bitcoinCaipNetwork = CaipNetworksUtil.extendCaipNetwork(bitcoin, extendProps)

export const bitcoinTestnetCaipNetwork = CaipNetworksUtil.extendCaipNetwork(
  bitcoinTestnet,
  extendProps
)
