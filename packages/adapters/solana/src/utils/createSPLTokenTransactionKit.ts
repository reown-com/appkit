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

const COMPUTE_UNIT_MARGIN_MULTIPLIER = 1.3
const MAX_COMPUTE_UNIT_LIMIT = 1_400_000
const FALLBACK_COMPUTE_UNIT_LIMIT = 50_000

/**
 * Converts a decimal amount into the mint's base units via string math, avoiding
 * IEEE-754 float multiplication error (e.g. 0.29 * 100 === 28.999999999999996, which
 * Math.floor(amount * 10 ** decimals) would wrongly truncate to 28 instead of 29).
 * Truncates precision beyond `decimals`, matching the legacy path's flooring behavior.
 */
export function toTokenBaseUnits(amount: number, decimals: number): bigint {
  const parts = amount.toString().split('.')
  const whole = parts[0] ?? '0'
  const fraction = parts[1] ?? ''
  const paddedFraction = fraction.slice(0, decimals).padEnd(decimals, '0')

  return BigInt(whole) * 10n ** BigInt(decimals) + BigInt(paddedFraction || '0')
}

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
    const tokenAmount = toTokenBaseUnits(amount, decimals)

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

    /*
     * No lifetime attached yet: estimateComputeUnitLimitFactory's simulation only needs a fee
     * payer (it substitutes its own fresh blockhash server-side for the simulation itself, see
     * its `replaceRecentBlockhash` behavior). The real blockhash is fetched further down, as the
     * last RPC call before compiling, to minimize the staleness window before the wallet signs;
     * fetching it here instead risks it expiring during the simulation round-trip plus however
     * long the wallet's approval UI takes, which can silently drop the transaction after signing.
     */
    const messageWithoutLifetime = appendTransactionMessageInstructions(
      instructions,
      setTransactionMessageFeePayer(feePayer, createTransactionMessage({ version: 0 }))
    )

    const estimateComputeUnitLimit = estimateComputeUnitLimitFactory({ rpc })
    const estimatedUnits = await estimateComputeUnitLimit(messageWithoutLifetime).catch(() => null)

    const unitLimit =
      estimatedUnits && estimatedUnits > 0
        ? Math.min(
            Math.ceil(estimatedUnits * COMPUTE_UNIT_MARGIN_MULTIPLIER),
            MAX_COMPUTE_UNIT_LIMIT
          )
        : FALLBACK_COMPUTE_UNIT_LIMIT

    const messageWithComputeLimit = prependTransactionMessageInstruction(
      getSetComputeUnitLimitInstruction({ units: unitLimit }),
      messageWithoutLifetime
    )

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()

    const finalMessage = setTransactionMessageLifetimeUsingBlockhash(
      { blockhash: blockhash as Blockhash, lastValidBlockHeight: BigInt(lastValidBlockHeight) },
      messageWithComputeLimit
    )

    return compileTransaction(finalMessage)
  } catch (error) {
    throw new Error(
      `Failed to create SPL token transaction: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}
