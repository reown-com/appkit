import { PublicKey } from '@solana/web3.js'
import { vi } from 'vitest'

import { TestConstants } from '../constants/TestConstants.js'

/**
 * Mock Solana wallet standard provider
 */
export function mockSolanaWalletStandardProvider(overrides = {}) {
  return {
    connect: vi.fn().mockResolvedValue({
      publicKey: new PublicKey(TestConstants.accounts.solana[0].address)
    }),
    disconnect: vi.fn().mockResolvedValue(undefined),
    signMessage: vi.fn().mockResolvedValue({
      signature: TestConstants.signatures.solana
    }),
    signTransaction: vi.fn().mockResolvedValue({
      signature: TestConstants.signatures.solana
    }),
    signAllTransactions: vi.fn().mockResolvedValue([
      {
        signature: TestConstants.signatures.solana
      }
    ]),
    sendTransaction: vi.fn().mockResolvedValue({
      signature: TestConstants.signatures.solana
    }),
    ...overrides
  }
}

/**
 * Mock Solana Connection for testing
 */
export function mockSolanaConnection(overrides = {}) {
  return {
    getBalance: vi.fn().mockResolvedValue(1000000000n), // 1 SOL in lamports
    getBlockHeight: vi.fn().mockResolvedValue(123456789),
    getMinimumBalanceForRentExemption: vi.fn().mockResolvedValue(1000000n),
    ...overrides
  }
}
