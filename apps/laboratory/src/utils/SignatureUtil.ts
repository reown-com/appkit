import { createPublicClient, http } from 'viem'
import { ConstantsUtil as CommonConstants } from '@web3modal/common'

function getTransport({ chainId }: { chainId: number }) {
  return http(
    `${CommonConstants.BLOCKCHAIN_API_RPC_URL}/v1/?chainId=eip155:${chainId}&projectId=${process.env['NEXT_PUBLIC_PROJECT_ID']}`
  )
}

export async function verifySignature({
  address,
  message,
  signature,
  chainId
}: {
  address: string
  message: string
  signature: string
  chainId: number
}) {
  const publicClient = createPublicClient({
    transport: getTransport({ chainId })
  })

  return publicClient.verifyMessage({
    message,
    address: address as `0x${string}`,
    signature: signature as `0x${string}`
  })
}
