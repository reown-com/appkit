import { createPublicClient, http } from 'viem'

import type { Address, Hex } from '@reown/appkit-common'

function getTransport({ chainId }: { chainId: number }) {
  return http(
    `https://rpc.walletconnect.org/v1/?chainId=eip155:${chainId}&projectId=${process.env['NEXT_PUBLIC_PROJECT_ID']}`
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
    address: address as Address,
    signature: signature as Hex
  })
}
