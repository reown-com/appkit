import { describe, expect, test } from 'vitest'

import { type SIWXSession } from '@reown/appkit-controllers'

import { SolanaVerifier } from '../../src/verifiers/SolanaVerifier.js'
import { mockSession } from '../mocks/mockSession.js'

type Case = {
  reason: string
  session: SIWXSession
  expected: boolean
}

const cases: Case[] = [
  {
    reason: 'valid session',
    session: mockSession({
      data: {
        accountAddress: '2VqKhjZ766ZN3uBtBpb7Ls3cN4HrocP1rzxzekhVEgpU'
      },
      signature:
        '2ZpgpUKF6RtmbrE8uBmPwRiBqRnsCKiBKkjsPSpf6c64r4XdDoevjhjNX35X7GeuSwwRhmbB2Ro4NfHWAeXWNhDL'
    }),
    expected: true
  },
  {
    reason: 'invalid session with an invalid signature',
    session: mockSession({
      data: {
        accountAddress: '2VqKhjZ766ZN3uBtBpb7Ls3cN4HrocP1rzxzekhVEgpU'
      },
      signature:
        '3ErkFZkvhSJVR7E1uakGwj8icgfxvRSS6AwW5bq4CZsXPZ83XrT1H9xcCWLvhsYCLYzFc7WSMQEJxGgpZvtgqbdE'
    }),
    expected: false
  },
  {
    reason: 'invalid session with an invalid account address',
    session: mockSession({
      data: {
        accountAddress: 'C6ydkvKcRdXz3ZTEYy6uWAAyZgyUF49qP4XPdaDB2nqS'
      },
      signature:
        '2ZpgpUKF6RtmbrE8uBmPwRiBqRnsCKiBKkjsPSpf6c64r4XdDoevjhjNX35X7GeuSwwRhmbB2Ro4NfHWAeXWNhDL'
    }),
    expected: false
  }
]

describe('SolanaVerifier', () => {
  const verifier = new SolanaVerifier()

  test('should have solana as the chain namespace', () => {
    expect(verifier.chainNamespace).toBe('solana')
  })

  test('should verify only solana chain id', () => {
    expect(
      verifier.shouldVerify(
        mockSession({
          data: {
            chainId: 'solana:mainnet'
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
  })

  test.each(cases)(`should verify $reason`, async ({ session, expected }) => {
    expect(await verifier.verify(session)).toBe(expected)
  })
})
