import {
  PublicKey,
  SystemProgram,
  type Connection,
  Transaction,
  LAMPORTS_PER_SOL,
  ComputeBudgetProgram
} from '@solana/web3.js'
import type { Provider } from '@reown/appkit-utils/solana'

type SendTransactionArgs = {
  provider: Provider
  connection: Connection
  to: string
  value: number
}

/**
 * These constants defines the cost of running the program, allowing to calculate the maximum
 * amount of SOL that can be sent in case of cleaning the account and remove the rent exemption error.
 */
const COMPUTE_BUDGET_CONSTANTS = {
  UNIT_PRICE_MICRO_LAMPORTS: 20000000,
  UNIT_LIMIT: 500
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
  const lamports = Math.floor(value * LAMPORTS_PER_SOL)

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()

  const instructions = [
    ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: COMPUTE_BUDGET_CONSTANTS.UNIT_PRICE_MICRO_LAMPORTS
    }),
    ComputeBudgetProgram.setComputeUnitLimit({ units: COMPUTE_BUDGET_CONSTANTS.UNIT_LIMIT }),
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
