import { PublicKey } from '@solana/web3.js'
import { beforeEach, describe, expect, it } from 'vitest'

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
})
