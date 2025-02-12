import { getAddress } from 'viem'

import chainShortNames from '../data/chains_shortname.json'

type ChainShortNames = Record<string, string>

const shortNames: ChainShortNames = chainShortNames

export function convertCaipToErc3770(caipAddress: string): string {
  const parts = caipAddress.split(':')

  const [namespace, chainId, address] = parts
  if (
    parts.length !== 3 ||
    namespace === undefined ||
    chainId === undefined ||
    address === undefined
  ) {
    throw new Error('Invalid CAIP address format')
  }

  if (namespace && namespace.toLowerCase() !== 'eip155') {
    throw new Error('Only EIP-155 namespace is supported')
  }

  const shortName = shortNames[chainId]
  if (!shortName) {
    throw new Error(`Chain ID ${chainId} not found in shortname list`)
  }

  try {
    const normalizedAddress = getAddress(address)

    return `${shortName}:${normalizedAddress}`
  } catch (e) {
    throw new Error('Invalid ERC-55 address format')
  }
}
