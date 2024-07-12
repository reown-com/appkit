import { isValidEip191Signature, isValidEip1271Signature } from '@walletconnect/utils'

const SOL_ADDRESS_PATTERN = /0x[a-fA-F0-9]{40}/u
const SOL_CHAIN_ID_IN_SIWS_PATTERN = /Chain ID: (?<temp2>\d+)/u

export function getAddressFromMessage(message: string) {
  return message.match(SOL_ADDRESS_PATTERN)?.[0] || ''
}

export function getChainIdFromMessage(message: string) {
  return `solana:${message.match(SOL_CHAIN_ID_IN_SIWS_PATTERN)?.[2] || 1}`
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
