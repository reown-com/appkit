import type { CaipNetwork } from '@reown/appkit-common'
import * as viemChains from 'viem/chains'

// Modify and collect the chains
const modifiedChains: Record<string, CaipNetwork> = {}

Object.keys(viemChains).forEach(chainName => {
  const chain = viemChains[chainName as keyof typeof viemChains] as viemChains.Chain

  modifiedChains[chainName] = {
    ...chain,
    chainNamespace: 'eip155',
    caipNetworkId: `eip155:${chain.id}`
  } as CaipNetwork
})

export default modifiedChains
