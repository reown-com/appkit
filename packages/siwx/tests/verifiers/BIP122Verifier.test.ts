import { describe, expect, test } from 'vitest'

import { type SIWXSession } from '@reown/appkit-controllers'
import { mockSession } from '@reown/appkit-controllers/testing'

import { BIP122Verifier } from '../../src/verifiers/BIP122Verifier.js'

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
        accountAddress: 'bc1qczn7zmd0n8rddeyhfjm9vz5edwznd4vsce4w7a'
      },
      signature:
        'KML3pFh5aNynPZKegsEcasua2W17sKRhpsNgP/jMMbT3LR4N6jXM9Yl9n7hdHNJdff4clSAzvE/rICl/FsSu5uo='
    }),
    expected: true
  },
  {
    reason: 'invalid session with an invalid signature',
    session: mockSession({
      data: {
        accountAddress: 'bc1qczn7zmd0n8rddeyhfjm9vz5edwznd4vsce4w7a'
      },
      signature:
        'KFgSwkIlLxUuJ0N59F50AKMdiXi8bNF/O/OB9lKh85xnXB/9HoA50T0nZb6SQ1RHBDWPhmBukWU0Py01NU4VI0o='
    }),
    expected: false
  },
  {
    reason: 'invalid session with an invalid account address',
    session: mockSession({
      data: {
        accountAddress: 'bc1quht40y4r6psc6v5kdxpdumqv89azrdffvra2dn'
      },
      signature:
        'KML3pFh5aNynPZKegsEcasua2W17sKRhpsNgP/jMMbT3LR4N6jXM9Yl9n7hdHNJdff4clSAzvE/rICl/FsSu5uo='
    }),
    expected: false
  },
  {
    reason: 'different signature type',
    session: mockSession({
      data: {
        accountAddress: 'bc1qczn7zmd0n8rddeyhfjm9vz5edwznd4vsce4w7a'
      },
      signature:
        'AkcwRAIgIB8eAIUCg4bHJm7IuOktrosDZn4A0wUrlAxSU8WySNgCIBecJ7eTrlzNGvzXcLAxIC44STrZm+MsCNDGr4IYwTIbASECBPlzqRYbRCAR7uxM+u3okxS8AeBojHtyHstbbC4/6EU='
    }),
    expected: true
  }
]

describe('BIP122Verifier', () => {
  const verifier = new BIP122Verifier()

  test('should have bip122 as the chain namespace', () => {
    expect(verifier.chainNamespace).toBe('bip122')
  })

  test('should verify only bip122 chain id', () => {
    expect(
      verifier.shouldVerify(
        mockSession({
          data: {
            chainId: 'bip122:000000000019d6689c085ae165831e93'
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
