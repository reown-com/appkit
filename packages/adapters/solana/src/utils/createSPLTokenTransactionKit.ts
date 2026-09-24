import {
  TOKEN_PROGRAM_ADDRESS,
  fetchMaybeMint,
  fetchMaybeToken,
  findAssociatedTokenPda,
  getCreateAssociatedTokenIdempotentInstruction,
  getTransferCheckedInstruction
} from '@solana-program/token'
import {
  estimateComputeUnitLimitFactory,
  getSetComputeUnitLimitInstruction,
  getSetComputeUnitPriceInstruction
} from '@solana-program/compute-budget'
import {
  type Blockhash,
  appendTransactionMessageInstructions,
  compileTransaction,
  createNoopSigner,
  createSolanaRpc,
  createTransactionMessage,
  prependTransactionMessageInstruction,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash
} from '@solana/kit'

import { SPL_COMPUTE_BUDGET_CONSTANTS } from '@reown/appkit-utils/solana'
import type { AnySolanaKitTransaction, SPLTokenTransactionKitArgs } from '@reown/appkit-utils/solana'

/**
 * Mirrors the values the sibling spl-send-priority-fee fix settled on for the legacy path
 * (SPL_COMPUTE_BUDGET_CONSTANTS.SIMULATION_MARGIN_MULTIPLIER / FALLBACK_UNIT_LIMIT_WITH_ATA_CREATION
 * / SIMULATION_UNIT_LIMIT on fix/spl-send-priority-fee). Duplicated locally rather than imported
 * since that fix is on a different, not-yet-merged branch base; worth deduplicating once both land.
 */
const COMPUTE_UNIT_MARGIN_MULTIPLIER = 1.3
const MAX_COMPUTE_UNIT_LIMIT = 1_400_000
const FALLBACK_COMPUTE_UNIT_LIMIT = 50_000

export async function createSPLTokenTransactionKit({
  provider,
  to,
  amount,
  tokenMint,
  connection
}: SPLTokenTransactionKitArgs): Promise<AnySolanaKitTransaction> {
  if (!provider.address) {
    throw new Error('No address found')
  }
  if (amount <= 0) {
    throw new Error('Amount must be greater than 0')
  }

  try {
    const feePayer = provider.address
    const rpc = createSolanaRpc(connection.rpcEndpoint)

    const mint = await fetchMaybeMint(rpc, tokenMint)
    if (!mint.exists) {
      throw new Error('Mint account not found')
    }
    if (mint.programAddress !== TOKEN_PROGRAM_ADDRESS) {
      throw new Error('Token-2022 mints are not yet supported')
    }
    const decimals = mint.data.decimals
    const tokenAmount = BigInt(Math.floor(amount * 10 ** decimals))

    const [fromTokenAccount] = await findAssociatedTokenPda({
      owner: feePayer,
      mint: tokenMint,
      tokenProgram: TOKEN_PROGRAM_ADDRESS
    })
    const [toTokenAccount] = await findAssociatedTokenPda({
      owner: to,
      mint: tokenMint,
      tokenProgram: TOKEN_PROGRAM_ADDRESS
    })

    const fromAccount = await fetchMaybeToken(rpc, fromTokenAccount)
    if (!fromAccount.exists) {
      throw new Error('Sender does not have a token account for this mint')
    }
    if (fromAccount.data.amount < tokenAmount) {
      throw new Error('Insufficient token balance')
    }

    const signer = createNoopSigner(feePayer)

    const instructions = [
      getSetComputeUnitPriceInstruction({
        microLamports: SPL_COMPUTE_BUDGET_CONSTANTS.UNIT_PRICE_MICRO_LAMPORTS
      }),
      getCreateAssociatedTokenIdempotentInstruction({
        payer: signer,
        ata: toTokenAccount,
        owner: to,
        mint: tokenMint
      }),
      getTransferCheckedInstruction({
        source: fromTokenAccount,
        mint: tokenMint,
        destination: toTokenAccount,
        authority: signer,
        amount: tokenAmount,
        decimals
      })
    ]

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()

    const message = appendTransactionMessageInstructions(
      instructions,
      setTransactionMessageLifetimeUsingBlockhash(
        { blockhash: blockhash as Blockhash, lastValidBlockHeight: BigInt(lastValidBlockHeight) },
        setTransactionMessageFeePayer(feePayer, createTransactionMessage({ version: 0 }))
      )
    )

    const estimateComputeUnitLimit = estimateComputeUnitLimitFactory({ rpc })
    const estimatedUnits = await estimateComputeUnitLimit(message).catch(() => null)

    const unitLimit =
      estimatedUnits && estimatedUnits > 0
        ? Math.min(
            Math.ceil(estimatedUnits * COMPUTE_UNIT_MARGIN_MULTIPLIER),
            MAX_COMPUTE_UNIT_LIMIT
          )
        : FALLBACK_COMPUTE_UNIT_LIMIT

    const messageWithComputeLimit = prependTransactionMessageInstruction(
      getSetComputeUnitLimitInstruction({ units: unitLimit }),
      message
    )

    return compileTransaction(messageWithComputeLimit)
  } catch (error) {
    throw new Error(
      `Failed to create SPL token transaction: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}
