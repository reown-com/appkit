import { PublicKey, SystemProgram, type Connection, Transaction } from '@solana/web3.js'
import type { Provider } from '@web3modal/scaffold-utils/solana'

type SendTransactionArgs = {
  provider: Provider
  connection: Connection
  to: string
  value: number
}

export async function createSendTransaction({
  provider,
  to,
  value,
  connection
}: SendTransactionArgs): Promise<Transaction> {
  if (!provider.publicKey) {
    throw Error('No public key found')
  }

  const toPubkey = new PublicKey(to)
  const lamports = value

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()

  const instructions = [
    SystemProgram.transfer({
      fromPubkey: provider.publicKey,
      toPubkey,
      lamports
    })
  ]

  return new Transaction({ feePayer: provider.publicKey, blockhash, lastValidBlockHeight }).add(
    ...instructions
  )
}
