import * as viemChains from 'viem/chains'

if (!process.env['NEXT_PUBLIC_PROJECT_ID']) {
  throw new Error('NEXT_PUBLIC_PROJECT_ID is required')
}

export function getChain(id: number) {
  const chains = Object.values(viemChains) as viemChains.Chain[]

  return chains.find(x => x.id === id)
}
