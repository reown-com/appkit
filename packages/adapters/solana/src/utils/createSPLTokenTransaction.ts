import {
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  TokenAccountNotFoundError,
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
  getMint
} from '@solana/spl-token'
import {
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  Transaction,
  type TransactionInstruction
} from '@solana/web3.js'

import { SPL_COMPUTE_BUDGET_CONSTANTS } from '@reown/appkit-utils/solana'
import type { SPLTokenTransactionArgs } from '@reown/appkit-utils/solana'

async function getMintOwnerProgramId(connection: Connection, mint: PublicKey) {
  const info = await connection.getAccountInfo(mint)

  if (!info) {
    throw new Error('Mint account not found')
  }

  if (info.owner.equals(TOKEN_PROGRAM_ID)) {
    return TOKEN_PROGRAM_ID
  }

  if (info.owner.equals(TOKEN_2022_PROGRAM_ID)) {
    return TOKEN_2022_PROGRAM_ID
  }

  throw new Error('Unknown mint owner program')
}

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

    const programId = await getMintOwnerProgramId(connection, mintPubkey)

    const mintInfo = await getMint(connection, mintPubkey, undefined, programId)
    const decimals = mintInfo.decimals
    if (decimals < 0) {
      throw new Error('Invalid token decimals')
    }

    const tokenAmount = Math.floor(amount * 10 ** decimals)

    const fromTokenAccount = getAssociatedTokenAddressSync(mintPubkey, fromPubkey, false, programId)
    const toTokenAccount = getAssociatedTokenAddressSync(mintPubkey, toPubkey, false, programId)

    try {
      const fromAccount = await getAccount(connection, fromTokenAccount, undefined, programId)
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
      await getAccount(connection, toTokenAccount, undefined, programId)
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
        createAssociatedTokenAccountInstruction(
          fromPubkey,
          toTokenAccount,
          toPubkey,
          mintPubkey,
          programId
        )
      )
    }

    instructions.push(
      createTransferCheckedInstruction(
        fromTokenAccount,
        mintPubkey,
        toTokenAccount,
        fromPubkey,
        tokenAmount,
        decimals,
        [],
        programId
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
