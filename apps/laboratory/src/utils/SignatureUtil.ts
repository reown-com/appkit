import { createPublicClient, http } from 'viem'
import { PublicKey } from '@solana/web3.js'
import nacl from 'tweetnacl'
import base58 from 'bs58'

function getTransport({ chainId }: { chainId: string | number }) {
  return http(
    `https://rpc.walletconnect.org/v1/?chainId=eip155:${chainId}&projectId=${process.env['NEXT_PUBLIC_PROJECT_ID']}`
  )
}

async function verifyEthSignature({
  address,
  message,
  signature,
  chainId
}: {
  address: string
  message: string
  signature: string
  chainId: string | number
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

// eslint-disable-next-line @typescript-eslint/require-await
async function verifySolSignature({
  address,
  message,
  signature
}: {
  address: string
  message: string
  signature: string
}) {
  try {
    const publicKeyBytes = base58.decode(address)
    const publicKey = new PublicKey(publicKeyBytes)

    const isValid = nacl.sign.detached.verify(
      Buffer.from(message),
      base58.decode(signature),
      publicKey.toBuffer()
    )

    return isValid
  } catch (error) {
    return false
  }
}

export async function verifySignature({
  address,
  message,
  signature,
  chainId,
  typeChain = 'eip155'
}: {
  address: string
  message: string
  signature: string
  chainId: string | number
  typeChain?: string
}) {
  if (typeChain === 'solana') {
    return verifySolSignature({ address, message, signature })
  }

  return verifyEthSignature({ address, message, signature, chainId })
}
