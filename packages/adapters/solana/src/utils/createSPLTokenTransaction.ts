import {
  TOKEN_PROGRAM_ID,
  TokenAccountNotFoundError,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
  getMint
} from '@solana/spl-token'
import {
  ComputeBudgetProgram,
  PublicKey,
  Transaction,
  type TransactionInstruction
} from '@solana/web3.js'

import { SPL_COMPUTE_BUDGET_CONSTANTS } from '@reown/appkit-utils/solana'
import type { SPLTokenTransactionArgs } from '@reown/appkit-utils/solana'

export async function createSPLTokenTransaction({
  provider,
  to,
  amount,
  tokenMint,
  connection
}: SPLTokenTransactionArgs): Promise<Transaction> {
  if (!provider.publicKey) {
    throw new Error('No public key found')
  }

  if (amount <= 0) {
    throw new Error('Amount must be greater than 0')
  }

  try {
    const fromPubkey = provider.publicKey
    const toPubkey = new PublicKey(to)
    const mintPubkey = new PublicKey(tokenMint)

    const mintInfo = await getMint(connection, mintPubkey)
    const decimals = mintInfo.decimals

    if (decimals < 0) {
      throw new Error('Invalid token decimals')
    }

    const tokenAmount = Math.floor(amount * 10 ** decimals)

    const fromTokenAccount = getAssociatedTokenAddressSync(mintPubkey, fromPubkey)
    const toTokenAccount = getAssociatedTokenAddressSync(mintPubkey, toPubkey)

    try {
      const fromAccount = await getAccount(connection, fromTokenAccount)
      if (fromAccount.amount < BigInt(tokenAmount)) {
        throw new Error('Insufficient token balance')
      }
    } catch (error) {
      if (error instanceof TokenAccountNotFoundError) {
        throw new Error('Sender does not have a token account for this mint')
      }
      throw error
    }

    let shouldCreateATA = false
    try {
      await getAccount(connection, toTokenAccount)
    } catch (error) {
      if (error instanceof TokenAccountNotFoundError) {
        shouldCreateATA = true
      } else {
        throw error
      }
    }

    const instructions: TransactionInstruction[] = []

    const computeUnitLimit = shouldCreateATA
      ? SPL_COMPUTE_BUDGET_CONSTANTS.UNIT_LIMIT_WITH_ATA_CREATION
      : SPL_COMPUTE_BUDGET_CONSTANTS.UNIT_LIMIT_TRANSFER_ONLY

    instructions.push(
      ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: SPL_COMPUTE_BUDGET_CONSTANTS.UNIT_PRICE_MICRO_LAMPORTS
      }),
      ComputeBudgetProgram.setComputeUnitLimit({ units: computeUnitLimit })
    )

    if (shouldCreateATA) {
      instructions.push(
        createAssociatedTokenAccountInstruction(fromPubkey, toTokenAccount, toPubkey, mintPubkey)
      )
    }

    instructions.push(
      createTransferInstruction(
        fromTokenAccount,
        toTokenAccount,
        fromPubkey,
        tokenAmount,
        [],
        TOKEN_PROGRAM_ID
      )
    )

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()

    return new Transaction({
      feePayer: fromPubkey,
      blockhash,
      lastValidBlockHeight
    }).add(...instructions)
  } catch (error) {
    throw new Error(
      `Failed to create SPL token transaction: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}
