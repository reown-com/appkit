import * as viemChains from 'viem/chains'

// Create an object to hold modified chain data
const modifiedChains: Record<
  string,
  viemChains.Chain & { chainNamespace: string; caipNetworkId: string }
> = {}

// Iterate through the chains and add the modified chain data
Object.keys(viemChains).forEach(chainName => {
  const chain = viemChains[chainName as keyof typeof viemChains] as viemChains.Chain

  modifiedChains[chainName] = {
    ...chain,
    chainNamespace: 'eip155',
    caipNetworkId: `eip155:${chain.id}`
  }
})

// Export all modified chains using the spread operator
export const { mainnet, ropsten, rinkeby, kovan, goerli, polygon, optimism, arbitrum } =
  modifiedChains
