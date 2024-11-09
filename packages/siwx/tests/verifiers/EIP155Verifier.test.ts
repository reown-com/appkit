import { describe, test, expect } from 'vitest'
import { type SIWXSession } from '@reown/appkit-core'
import { EIP155Verifier } from '../../src/index.js'
import { mockSession } from '../mocks/mockSession.js'

type Case = {
  reason: string
  session: SIWXSession
  expected: boolean
}

const cases: Case[] = [
  {
    reason: 'valid session',
    session: mockSession(),
    expected: true
  },
  {
    reason: 'invalid session with an invalid signature',
    session: mockSession({
      signature: '0x1234567890abcdef'
    }),
    expected: false
  },
  {
    reason: 'invalid session with an invalid account address',
    session: mockSession({
      data: {
        accountAddress: '0x1234567890abcdef1234567890abcdef12345678'
      }
    }),
    expected: false
  }
]

describe('EIP155Verifier', () => {
  const verifier = new EIP155Verifier()

  test('should have eip155 as the chain namespace', () => {
    expect(verifier.chainNamespace).toBe('eip155')
  })

  test('should verify only eip155 chain id', () => {
    expect(
      verifier.shouldVerify(
        mockSession({
          data: {
            chainId: 'eip155:1'
          }
        })
      )
    ).toBe(true)

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
