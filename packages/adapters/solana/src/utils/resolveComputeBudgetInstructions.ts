import {
  ComputeBudgetProgram,
  type Connection,
  PublicKey,
  Transaction,
  type TransactionInstruction,
  VersionedTransaction
} from '@solana/web3.js'

import { SPL_COMPUTE_BUDGET_CONSTANTS } from '@reown/appkit-utils/solana'

async function simulateUnitsConsumed({
  connection,
  instructions,
  feePayer
}: {
  connection: Connection
  instructions: TransactionInstruction[]
  feePayer: PublicKey
}): Promise<number | null> {
  /*
   * The blockhash here only needs to satisfy Transaction's constructor, replaceRecentBlockhash
   * below has the RPC substitute a real one before the simulation executes.
   */
  const simulationTransaction = new Transaction({
    feePayer,
    blockhash: PublicKey.default.toBase58(),
    lastValidBlockHeight: 0
  }).add(
    ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: SPL_COMPUTE_BUDGET_CONSTANTS.UNIT_PRICE_MICRO_LAMPORTS
    }),
    ComputeBudgetProgram.setComputeUnitLimit({
      units: SPL_COMPUTE_BUDGET_CONSTANTS.SIMULATION_UNIT_LIMIT
    }),
    ...instructions
  )

  /*
   * Connection.simulateTransaction only accepts a config object (sigVerify, replaceRecentBlockhash)
   * for a VersionedTransaction, the legacy Transaction overload requires real signers instead,
   * which isn't available here (the wallet, not this code, holds the signing key).
   */
  const versionedTransaction = new VersionedTransaction(simulationTransaction.compileMessage())

  const result = await connection.simulateTransaction(versionedTransaction, {
    sigVerify: false,
    replaceRecentBlockhash: true
  })

  if (result.value.err || typeof result.value.unitsConsumed !== 'number') {
    return null
  }

  return result.value.unitsConsumed
}

/*
 * Solana charges the priority fee on the requested compute unit limit, not on CU actually
 * consumed, so the limit is sized from a real simulation instead of a flat static ceiling.
 */
export async function resolveComputeBudgetInstructions({
  connection,
  instructions,
  feePayer,
  fallbackUnitLimit
}: {
  connection: Connection
  instructions: TransactionInstruction[]
  feePayer: PublicKey
  fallbackUnitLimit: number
}): Promise<TransactionInstruction[]> {
  const unitsConsumed = await simulateUnitsConsumed({ connection, instructions, feePayer }).catch(
    () => null
  )

  const unitLimit =
    unitsConsumed && unitsConsumed > 0
      ? Math.min(
          Math.ceil(unitsConsumed * SPL_COMPUTE_BUDGET_CONSTANTS.SIMULATION_MARGIN_MULTIPLIER),
          SPL_COMPUTE_BUDGET_CONSTANTS.SIMULATION_UNIT_LIMIT
        )
      : fallbackUnitLimit

  return [
    ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: SPL_COMPUTE_BUDGET_CONSTANTS.UNIT_PRICE_MICRO_LAMPORTS
    }),
    ComputeBudgetProgram.setComputeUnitLimit({ units: unitLimit })
  ]
}
