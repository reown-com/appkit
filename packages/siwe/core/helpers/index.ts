import { isValidEip191Signature, isValidEip1271Signature } from '@walletconnect/utils'

const ETH_ADDRESS_PATTERN = /0x[a-fA-F0-9]{40}/u
const SOL_ADDRESS_PATTERN = /[1-9A-HJ-NP-Za-km-z]{32,44}/u

const ETH_CHAIN_ID_IN_SIWE_PATTERN = /Chain ID: (?<temp1>\d+)/u
const SOL_CHAIN_ID_PATTERN = /Chain ID: solana:(?<temp2>[a-zA-Z0-9]+)/u

export function getAddressFromMessage(message: string) {
  return message.match(ETH_ADDRESS_PATTERN)?.[0] || message.match(SOL_ADDRESS_PATTERN)?.[0] || ''
}

export function getChainIdFromMessage(message: string) {
  const ethChainIdMatch = message.match(ETH_CHAIN_ID_IN_SIWE_PATTERN)?.[1]
  if (ethChainIdMatch) {
    return `eip155:${ethChainIdMatch}`
  }

  const solChainIdMatch = message.match(SOL_CHAIN_ID_PATTERN)?.groups?.['temp2']
  if (solChainIdMatch) {
    return `solana:${solChainIdMatch}`
  }

  return 'eip155:1'
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
  let isValid = isValidEip191Signature(address, message, signature)
  if (!isValid) {
    isValid = await isValidEip1271Signature(address, message, signature, chainId, projectId)
  }

  return isValid
}
