import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  AccountLayout,
  MintLayout,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync
} from '@solana/spl-token'
import { ComputeBudgetProgram, Keypair, PublicKey, type AccountInfo } from '@solana/web3.js'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Provider } from '@reown/appkit-utils/solana'

import { createSPLTokenTransaction } from '../utils/createSPLTokenTransaction'
import { mockConnection } from './mocks/Connection'
import { TestConstants } from './util/TestConstants'

const mockProvider = () => {
  return {
    publicKey: new PublicKey(TestConstants.accounts[0].address)
  } as unknown as Provider
}

const mockTokenMint = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' // USDC mint

function buildMintAccountInfo(decimals: number): AccountInfo<Buffer> {
  const data = Buffer.alloc(MintLayout.span)

  MintLayout.encode(
    {
      mintAuthorityOption: 0,
      mintAuthority: PublicKey.default,
      supply: BigInt(1_000_000_000),
      decimals,
      isInitialized: true,
      freezeAuthorityOption: 0,
      freezeAuthority: PublicKey.default
    },
    data
  )

  return { data, owner: TOKEN_PROGRAM_ID, lamports: 1, executable: false, rentEpoch: 0 }
}

function buildTokenAccountInfo(mint: PublicKey, owner: PublicKey, amount: number): AccountInfo<Buffer> {
  const data = Buffer.alloc(AccountLayout.span)

  AccountLayout.encode(
    {
      mint,
      owner,
      amount: BigInt(amount),
      delegateOption: 0,
      delegate: PublicKey.default,
      state: 1,
      isNativeOption: 0,
      isNative: BigInt(0),
      delegatedAmount: BigInt(0),
      closeAuthorityOption: 0,
      closeAuthority: PublicKey.default
    },
    data
  )

  return { data, owner: TOKEN_PROGRAM_ID, lamports: 1, executable: false, rentEpoch: 0 }
}

let provider = mockProvider()
let connection = mockConnection()

describe('createSPLTokenTransaction', () => {
  beforeEach(() => {
    provider = mockProvider()
    connection = mockConnection()
  })

  it('should throw error when provider has no public key', async () => {
    const providerWithoutKey = { publicKey: null } as unknown as Provider

    await expect(
      createSPLTokenTransaction({
        provider: providerWithoutKey,
        connection,
        to: TestConstants.accounts[1].address,
        amount: 10,
        tokenMint: mockTokenMint
      })
    ).rejects.toThrow('No public key found')
  })

  it('should throw error when amount is zero or negative', async () => {
    await expect(
      createSPLTokenTransaction({
        provider,
        connection,
        to: TestConstants.accounts[1].address,
        amount: 0,
        tokenMint: mockTokenMint
      })
    ).rejects.toThrow('Amount must be greater than 0')

    await expect(
      createSPLTokenTransaction({
        provider,
        connection,
        to: TestConstants.accounts[1].address,
        amount: -5,
        tokenMint: mockTokenMint
      })
    ).rejects.toThrow('Amount must be greater than 0')
  })

  it('should throw error for invalid recipient address format', async () => {
    await expect(
      createSPLTokenTransaction({
        provider,
        connection,
        to: 'invalid-address',
        amount: 10,
        tokenMint: mockTokenMint
      })
    ).rejects.toThrow('Failed to create SPL token transaction')
  })

  it('should throw error for invalid token mint format', async () => {
    await expect(
      createSPLTokenTransaction({
        provider,
        connection,
        to: TestConstants.accounts[1].address,
        amount: 10,
        tokenMint: 'invalid-mint'
      })
    ).rejects.toThrow('Failed to create SPL token transaction')
  })

  it('should throw error for empty recipient address', async () => {
    await expect(
      createSPLTokenTransaction({
        provider,
        connection,
        to: '',
        amount: 10,
        tokenMint: mockTokenMint
      })
    ).rejects.toThrow('Invalid public key input')
  })

  it('should throw error for null recipient address', async () => {
    await expect(
      createSPLTokenTransaction({
        provider,
        connection,
        to: null as any,
        amount: 10,
        tokenMint: mockTokenMint
      })
    ).rejects.toThrow('Failed to create SPL token transaction')
  })

  it('should throw error for empty token mint', async () => {
    await expect(
      createSPLTokenTransaction({
        provider,
        connection,
        to: TestConstants.accounts[1].address,
        amount: 10,
        tokenMint: ''
      })
    ).rejects.toThrow('Invalid public key input')
  })

  it('should throw error for null token mint', async () => {
    await expect(
      createSPLTokenTransaction({
        provider,
        connection,
        to: TestConstants.accounts[1].address,
        amount: 10,
        tokenMint: null as any
      })
    ).rejects.toThrow('Failed to create SPL token transaction')
  })

  it('should build a compute-budget-first transaction sized from simulation when the recipient already has a token account', async () => {
    const mintPubkey = new PublicKey(mockTokenMint)
    const fromPubkey = Keypair.generate().publicKey
    const toPubkey = Keypair.generate().publicKey
    const fromTokenAccount = getAssociatedTokenAddressSync(mintPubkey, fromPubkey, false)
    const toTokenAccount = getAssociatedTokenAddressSync(mintPubkey, toPubkey, false)

    connection.getAccountInfo = vi.fn().mockImplementation(async (pubkey: PublicKey) => {
      if (pubkey.equals(mintPubkey)) {
        return buildMintAccountInfo(6)
      }
      if (pubkey.equals(fromTokenAccount)) {
        return buildTokenAccountInfo(mintPubkey, fromPubkey, 1_000_000)
      }
      if (pubkey.equals(toTokenAccount)) {
        return buildTokenAccountInfo(mintPubkey, toPubkey, 0)
      }

      return null
    })
    connection.simulateTransaction = vi.fn().mockResolvedValue({
      value: { err: null, unitsConsumed: 405 }
    })

    const transaction = await createSPLTokenTransaction({
      provider: { publicKey: fromPubkey } as unknown as Provider,
      connection,
      to: toPubkey.toBase58(),
      amount: 0.05,
      tokenMint: mockTokenMint
    })

    expect(connection.simulateTransaction).toHaveBeenCalledTimes(1)
    expect(transaction.instructions).toHaveLength(3)
    expect(transaction.instructions[0]?.programId.equals(ComputeBudgetProgram.programId)).toBe(true)
    expect(transaction.instructions[1]?.programId.equals(ComputeBudgetProgram.programId)).toBe(true)
    expect(transaction.instructions[2]?.programId.equals(TOKEN_PROGRAM_ID)).toBe(true)

    const limitInstruction = ComputeBudgetProgram.setComputeUnitLimit({ units: Math.ceil(405 * 1.3) })
    expect(transaction.instructions[1]?.data.equals(limitInstruction.data)).toBe(true)
  })

  it('should include an ATA-creation instruction and size from simulation when the recipient has no token account yet', async () => {
    const mintPubkey = new PublicKey(mockTokenMint)
    const fromPubkey = Keypair.generate().publicKey
    const toPubkey = Keypair.generate().publicKey
    const fromTokenAccount = getAssociatedTokenAddressSync(mintPubkey, fromPubkey, false)

    connection.getAccountInfo = vi.fn().mockImplementation(async (pubkey: PublicKey) => {
      if (pubkey.equals(mintPubkey)) {
        return buildMintAccountInfo(6)
      }
      if (pubkey.equals(fromTokenAccount)) {
        return buildTokenAccountInfo(mintPubkey, fromPubkey, 1_000_000)
      }

      // toTokenAccount does not exist yet
      return null
    })
    connection.simulateTransaction = vi.fn().mockResolvedValue({
      value: { err: null, unitsConsumed: 18000 }
    })

    const transaction = await createSPLTokenTransaction({
      provider: { publicKey: fromPubkey } as unknown as Provider,
      connection,
      to: toPubkey.toBase58(),
      amount: 0.05,
      tokenMint: mockTokenMint
    })

    expect(connection.simulateTransaction).toHaveBeenCalledTimes(1)
    expect(transaction.instructions).toHaveLength(4)
    expect(transaction.instructions[0]?.programId.equals(ComputeBudgetProgram.programId)).toBe(true)
    expect(transaction.instructions[1]?.programId.equals(ComputeBudgetProgram.programId)).toBe(true)
    // ATA creation via the Associated Token Account program, then the transfer via the Token program
    expect(transaction.instructions[2]?.programId.equals(ASSOCIATED_TOKEN_PROGRAM_ID)).toBe(true)
    expect(transaction.instructions[3]?.programId.equals(TOKEN_PROGRAM_ID)).toBe(true)

    const limitInstruction = ComputeBudgetProgram.setComputeUnitLimit({ units: Math.ceil(18000 * 1.3) })
    expect(transaction.instructions[1]?.data.equals(limitInstruction.data)).toBe(true)
  })
})
