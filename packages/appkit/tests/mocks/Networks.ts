import type { CaipNetwork } from '@reown/appkit'
import { CaipNetworksUtil } from '@reown/appkit-utils'

import {
  base as baseNetwork,
  bitcoin as bitcoinNetwork,
  mainnet as mainnetNetwork,
  polygon as polygonNetwork,
  sepolia as sepoliaNetwork,
  solana as solanaNetwork
} from '../../src/networks/index.js'

const [base, mainnet, polygon, sepolia, solana, bitcoin] = CaipNetworksUtil.extendCaipNetworks(
  [baseNetwork, mainnetNetwork, polygonNetwork, sepoliaNetwork, solanaNetwork, bitcoinNetwork],
  { customNetworkImageUrls: {}, projectId: 'test-project-id' }
) as [CaipNetwork, CaipNetwork, CaipNetwork, CaipNetwork, CaipNetwork, CaipNetwork]

export { base, mainnet, polygon, sepolia, solana, bitcoin }
