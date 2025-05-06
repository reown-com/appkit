import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'

import { type SIWXMessage } from '@reown/appkit-controllers'

import { InformalMessenger } from '../../src/index.js'

type Case = {
  params: SIWXMessage.Input & InformalMessenger.ConstructorParams
  expected: string
}

const cases: Case[] = [
  {
    params: {
      domain: 'example.com',
      accountAddress: '0x1234567890abcdef1234567890abcdef12345678',
      statement: 'This is a statement',
      chainId: 'eip155:1',
      uri: 'siwx://example.com',
      getNonce: () => Promise.resolve('123')
    },
    expected: `example.com wants you to sign in with your **blockchain** account:
0x1234567890abcdef1234567890abcdef12345678

This is a statement

URI: siwx://example.com
Version: 1
Chain ID: eip155:1
Nonce: 123
Issued At: 2024-01-01T00:00:00.000Z`
  },
  {
    params: {
      domain: 'example.com',
      accountAddress: '0x1234567890abcdef1234567890abcdef12345678',
      chainId: 'eip155:1',
      uri: 'siwx://example.com',
      getNonce: () => Promise.resolve('123'),
      getRequestId: () => Promise.resolve('123'),
      expiration: 24 * 60 * 60 * 1000,
      notBefore: '2022-01-02T00:00:00Z',
      resources: ['resource1', 'resource2']
    },
    expected: `example.com wants you to sign in with your **blockchain** account:
0x1234567890abcdef1234567890abcdef12345678

URI: siwx://example.com
Version: 1
Chain ID: eip155:1
Nonce: 123
Issued At: 2024-01-01T00:00:00.000Z
Expiration Time: 2022-01-03T00:00:00.000Z
Not Before: 2022-01-02T00:00:00.000Z
Request ID: 123
Resources:
- resource1
- resource2`
  },
  {
    params: {
      domain: 'example.com',
      accountAddress: '0x1234567890abcdef1234567890abcdef12345678',
      chainId: 'eip155:1',
      uri: 'siwx://example.com',
      getNonce: () => Promise.resolve('123'),
      getRequestId: () => Promise.resolve('123'),
      expiration: 24 * 60 * 60 * 1000,
      notBefore: '2022-01-02T00:00:00Z',
      resources: ['resource1', 'resource2'],
      clearChainIdNamespace: true
    },
    expected: `example.com wants you to sign in with your **blockchain** account:
0x1234567890abcdef1234567890abcdef12345678

URI: siwx://example.com
Version: 1
Chain ID: 1
Nonce: 123
Issued At: 2024-01-01T00:00:00.000Z
Expiration Time: 2022-01-03T00:00:00.000Z
Not Before: 2022-01-02T00:00:00.000Z
Request ID: 123
Resources:
- resource1
- resource2`
  }
]

describe('InformalMessenger', () => {
  beforeAll(() => {
    vi.useFakeTimers({
      now: new Date('2024-01-01T00:00:00Z')
    })
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  test.each(cases)(`should return expected message`, async ({ params, expected }) => {
    const messageFactory = new InformalMessenger(params)
    const message = await messageFactory.createMessage(params)
    expect(message.toString()).toBe(expected)
  })
})
