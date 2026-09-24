import type { Address } from '@solana/kit'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Provider } from '@reown/appkit-utils/solana'

import {
  createSPLTokenTransactionKit,
  toTokenBaseUnits
} from '../utils/createSPLTokenTransactionKit'
import { mockConnection } from './mocks/Connection'
import { TestConstants } from './util/TestConstants'

const mockTokenMint = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' as Address
const mockFromAta = '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1' as Address
const mockToAta = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM' as Address
const mockToken2022ProgramAddress = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb' as Address

vi.mock('@solana-program/token', async importOriginal => {
  const actual = await importOriginal<typeof import('@solana-program/token')>()
  return {
    ...actual,
    fetchMaybeMint: vi.fn(),
    fetchMaybeToken: vi.fn(),
    findAssociatedTokenPda: vi.fn()
  }
})

vi.mock('@solana-program/compute-budget', async importOriginal => {
  const actual = await importOriginal<typeof import('@solana-program/compute-budget')>()
  return {
    ...actual,
    getSetComputeUnitLimitInstruction: vi.fn(actual.getSetComputeUnitLimitInstruction),
    estimateComputeUnitLimitFactory: vi.fn()
  }
})

vi.mock('@solana/kit', async importOriginal => {
  const actual = await importOriginal<typeof import('@solana/kit')>()
  return {
    ...actual,
    createSolanaRpc: vi.fn().mockReturnValue({})
  }
})

const mockProvider = (address?: Address) => {
  return { address } as unknown as Provider
}

let provider = mockProvider(TestConstants.accounts[0].address as Address)
let connection = mockConnection()

describe('toTokenBaseUnits', () => {
  it('does not underpay due to floating-point multiplication error', () => {
    // 0.29 * 100 === 28.999999999999996 in IEEE 754, which Math.floor would wrongly truncate to 28
    expect(toTokenBaseUnits(0.29, 2)).toBe(29n)
    // 1.15 * 100 === 114.99999999999999 in IEEE 754
    expect(toTokenBaseUnits(1.15, 2)).toBe(115n)
  })

  it('truncates precision beyond the mint decimals, matching the legacy path', () => {
    expect(toTokenBaseUnits(0.297, 2)).toBe(29n)
  })

  it('converts a whole-number amount correctly', () => {
    expect(toTokenBaseUnits(1, 6)).toBe(1_000_000n)
  })
})

describe('createSPLTokenTransactionKit', () => {
  beforeEach(async () => {
    provider = mockProvider(TestConstants.accounts[0].address as Address)
    connection = mockConnection()
    vi.clearAllMocks()

    const { fetchMaybeMint, fetchMaybeToken, findAssociatedTokenPda, TOKEN_PROGRAM_ADDRESS } =
      await import('@solana-program/token')
    const { estimateComputeUnitLimitFactory } = await import('@solana-program/compute-budget')

    vi.mocked(fetchMaybeMint).mockResolvedValue({
      exists: true,
      programAddress: TOKEN_PROGRAM_ADDRESS,
      data: { decimals: 6 }
    } as unknown as Awaited<ReturnType<typeof fetchMaybeMint>>)

    vi.mocked(fetchMaybeToken).mockResolvedValue({
      exists: true,
      data: { amount: 2_000_000n }
    } as unknown as Awaited<ReturnType<typeof fetchMaybeToken>>)

    vi.mocked(findAssociatedTokenPda).mockImplementation(({ owner }) =>
      Promise.resolve([
        owner === TestConstants.accounts[0].address ? mockFromAta : mockToAta,
        255
      ] as unknown as Awaited<ReturnType<typeof findAssociatedTokenPda>>)
    )

    vi.mocked(estimateComputeUnitLimitFactory).mockReturnValue(
      vi.fn().mockResolvedValue(40_000)
    )
  })

  it('should throw error when provider has no address', async () => {
    await expect(
      createSPLTokenTransactionKit({
        provider: mockProvider(undefined),
        connection,
        to: TestConstants.accounts[1].address as Address,
        amount: 1,
        tokenMint: mockTokenMint
      })
    ).rejects.toThrow('No address found')
  })

  it('should throw error when amount is zero or negative', async () => {
    await expect(
      createSPLTokenTransactionKit({
        provider,
        connection,
        to: TestConstants.accounts[1].address as Address,
        amount: 0,
        tokenMint: mockTokenMint
      })
    ).rejects.toThrow('Amount must be greater than 0')

    await expect(
      createSPLTokenTransactionKit({
        provider,
        connection,
        to: TestConstants.accounts[1].address as Address,
        amount: -5,
        tokenMint: mockTokenMint
      })
    ).rejects.toThrow('Amount must be greater than 0')
  })

  it('should throw error when mint account is not found', async () => {
    const { fetchMaybeMint } = await import('@solana-program/token')
    vi.mocked(fetchMaybeMint).mockResolvedValue({
      exists: false
    } as unknown as Awaited<ReturnType<typeof fetchMaybeMint>>)

    await expect(
      createSPLTokenTransactionKit({
        provider,
        connection,
        to: TestConstants.accounts[1].address as Address,
        amount: 1,
        tokenMint: mockTokenMint
      })
    ).rejects.toThrow('Failed to create SPL token transaction: Mint account not found')
  })

  it('should throw a distinguishable error for Token-2022 mints', async () => {
    const { fetchMaybeMint } = await import('@solana-program/token')
    vi.mocked(fetchMaybeMint).mockResolvedValue({
      exists: true,
      programAddress: mockToken2022ProgramAddress,
      data: { decimals: 6 }
    } as unknown as Awaited<ReturnType<typeof fetchMaybeMint>>)

    await expect(
      createSPLTokenTransactionKit({
        provider,
        connection,
        to: TestConstants.accounts[1].address as Address,
        amount: 1,
        tokenMint: mockTokenMint
      })
    ).rejects.toThrow('Token-2022 mints are not yet supported')
  })

  it('should throw error when sender has no token account', async () => {
    const { fetchMaybeToken } = await import('@solana-program/token')
    vi.mocked(fetchMaybeToken).mockResolvedValue({
      exists: false
    } as unknown as Awaited<ReturnType<typeof fetchMaybeToken>>)

    await expect(
      createSPLTokenTransactionKit({
        provider,
        connection,
        to: TestConstants.accounts[1].address as Address,
        amount: 1,
        tokenMint: mockTokenMint
      })
    ).rejects.toThrow('Sender does not have a token account for this mint')
  })

  it('should throw error when sender balance is insufficient', async () => {
    const { fetchMaybeToken } = await import('@solana-program/token')
    vi.mocked(fetchMaybeToken).mockResolvedValue({
      exists: true,
      data: { amount: 500_000n }
    } as unknown as Awaited<ReturnType<typeof fetchMaybeToken>>)

    await expect(
      createSPLTokenTransactionKit({
        provider,
        connection,
        to: TestConstants.accounts[1].address as Address,
        amount: 1,
        tokenMint: mockTokenMint
      })
    ).rejects.toThrow('Insufficient token balance')
  })

  it('should build a valid solana-kit transaction for a successful transfer', async () => {
    const { getSetComputeUnitLimitInstruction } = await import('@solana-program/compute-budget')

    const result = await createSPLTokenTransactionKit({
      provider,
      connection,
      to: TestConstants.accounts[1].address as Address,
      amount: 1,
      tokenMint: mockTokenMint
    })

    expect('messageBytes' in result && 'signatures' in result).toBe(true)
    expect(getSetComputeUnitLimitInstruction).toHaveBeenCalledWith({ units: 52_000 })
  })

  it('should fall back to a static compute-unit limit when simulation fails', async () => {
    const { estimateComputeUnitLimitFactory, getSetComputeUnitLimitInstruction } = await import(
      '@solana-program/compute-budget'
    )
    vi.mocked(estimateComputeUnitLimitFactory).mockReturnValue(
      vi.fn().mockRejectedValue(new Error('RPC simulation failed'))
    )

    const result = await createSPLTokenTransactionKit({
      provider,
      connection,
      to: TestConstants.accounts[1].address as Address,
      amount: 1,
      tokenMint: mockTokenMint
    })

    expect('messageBytes' in result && 'signatures' in result).toBe(true)
    expect(getSetComputeUnitLimitInstruction).toHaveBeenCalledWith({ units: 50_000 })
  })
})
