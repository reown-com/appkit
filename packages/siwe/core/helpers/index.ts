import { createPublicClient, http } from 'viem'

import type { CaipNetworkId } from '@reown/appkit-common'
import { getBlockchainApiRpcUrl } from '@reown/appkit-utils'

const ETH_ADDRESS_PATTERN = /0x[a-fA-F0-9]{40}/u
const ETH_CHAIN_ID_IN_SIWE_PATTERN = /Chain ID: (?<temp1>\d+)/u

export function getAddressFromMessage(message: string) {
  return message.match(ETH_ADDRESS_PATTERN)?.[0] || ''
}

export function getChainIdFromMessage(message: string) {
  return `eip155:${message.match(ETH_CHAIN_ID_IN_SIWE_PATTERN)?.[1] || 1}`
}

export async function verifySignature({
  address,
  message,
  signature,
  chainId,
  projectId
}: {
  address: string
  message: string
  signature: string
  chainId: string
  projectId: string
}) {
  try {
    const client = createPublicClient({
      transport: http(getBlockchainApiRpcUrl(chainId as CaipNetworkId, projectId))
    })

    return await client.verifyMessage({
      message: message.toString(),
      signature: signature as `0x${string}`,
      address: address as `0x${string}`
    })
  } catch (error) {
    return false
  }
}
