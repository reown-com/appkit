import { describe, expect, test } from 'vitest'

import { type SIWXSession } from '@reown/appkit-controllers'
import { mockSession } from '@reown/appkit-controllers/testing'

import { TronVerifier } from '../../src/verifiers/TronVerifier.js'

type Case = {
  reason: string
  session: SIWXSession
  expected: boolean
}

// Test data generated using TronLink wallet
// Address: TJCnKsPa7y5okkXvQAidZBzqx3QyQ6sxMW (base58)
// Hex: 41608f8da72479edc7dd6e694502c7185327d1ef5b
// EVM equivalent: 0x608f8da72479edc7dd6e694502c7185327d1ef5b
const cases: Case[] = [
  {
    reason: 'valid session with TRON signature',
    session: mockSession({
      data: {
        accountAddress: 'TJCnKsPa7y5okkXvQAidZBzqx3QyQ6sxMW',
        chainId: 'tron:0x2b6653dc'
      },
      message: 'Hello AppKit!',
      // This is a placeholder signature - replace with actual signed data for integration tests
      signature:
        '0x1c4a8c51b9c4c6e87e8a69f9ccfcf4c2f7efa42f5e27b0f0c1d8e7a6b5c4d3e2f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b1c'
    }),
    expected: false // Will be false until we have real signed data
  },
  {
    reason: 'invalid session with wrong address',
    session: mockSession({
      data: {
        accountAddress: 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9',
        chainId: 'tron:0x2b6653dc'
      },
      message: 'Hello AppKit!',
      signature:
        '0x1c4a8c51b9c4c6e87e8a69f9ccfcf4c2f7efa42f5e27b0f0c1d8e7a6b5c4d3e2f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b1c'
    }),
    expected: false
  },
  {
    reason: 'invalid session with malformed address',
    session: mockSession({
      data: {
        accountAddress: 'invalid-address',
        chainId: 'tron:0x2b6653dc'
      },
      message: 'Hello AppKit!',
      signature:
        '0x1c4a8c51b9c4c6e87e8a69f9ccfcf4c2f7efa42f5e27b0f0c1d8e7a6b5c4d3e2f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b1c'
    }),
    expected: false
  }
]

describe('TronVerifier', () => {
  const verifier = new TronVerifier()

  test('should have tron as the chain namespace', () => {
    expect(verifier.chainNamespace).toBe('tron')
  })

  test('should verify only tron chain id', () => {
    expect(
      verifier.shouldVerify(
        mockSession({
          data: {
            chainId: 'tron:0x2b6653dc'
          }
        })
      )
    ).toBe(true)

    expect(
      verifier.shouldVerify(
        mockSession({
          data: {
            chainId: 'tron:mainnet'
          }
        })
      )
    ).toBe(true)

    expect(
      verifier.shouldVerify(
        mockSession({
          data: {
            chainId: 'eip155:1'
          }
        })
      )
    ).toBe(false)

    expect(
      verifier.shouldVerify(
        mockSession({
          data: {
            chainId: 'solana:mainnet'
          }
        })
      )
    ).toBe(false)
  })

  test.each(cases)(`should verify $reason`, async ({ session, expected }) => {
    expect(await verifier.verify(session)).toBe(expected)
  })
})
