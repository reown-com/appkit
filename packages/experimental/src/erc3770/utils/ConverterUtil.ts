import { ConstantsUtil } from '../utils/ConstantsUtil.js'

// eslint-disable-next-line func-style
const convertCaip10ToErc3770 = (caipAddress: string): string => {
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

  const shortName = ConstantsUtil.CHAIN_NAMES[chainId]
  if (!shortName) {
    throw new Error(`Chain ID ${chainId} not found in shortname list`)
  }

  return `${shortName}:${address}`
}

export const ConverterUtil = { convertCaip10ToErc3770 }
