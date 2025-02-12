import { getAddress } from 'viem'

/* eslint-disable func-style */
import { ConstantsUtil } from '../utils/ConstantsUtil.js'

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

  try {
    const checksumAddress = getAddress(address)

    return `${shortName}:${checksumAddress}`
  } catch (error) {
    throw new Error('Invalid ERC-55 address format')
  }
}

const createErc3770Address = (address: string, chainId: string): string => {
  const shortName = ConstantsUtil.CHAIN_NAMES[chainId]
  if (!shortName) {
    throw new Error(`Chain ID ${chainId} not found in shortname list`)
  }

  try {
    const checksumAddress = getAddress(address)

    return `${shortName}:${checksumAddress}`
  } catch (error) {
    throw new Error('Invalid ERC-55 address format')
  }
}

export const ConverterUtil = {
  convertCaip10ToErc3770,
  createErc3770Address
}
