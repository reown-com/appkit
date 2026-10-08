import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'

import type { CaipNetworkId } from '@reown/appkit-common'

import { DefaultSIWX } from '../../src/configs/DefaultSIWX.js'
import { InformalMessenger } from '../../src/messengers/InformalMessenger.js'

const STATEMENT = 'Sign in to verify that you own this wallet.'
const ADDRESS = '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin'

const SOLANA_MAINNET = 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'
const SOLANA_TESTNET = 'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z'
const SOLANA_DEVNET = 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1'
const SOLANA_CUSTOM = 'solana:CustomNetworkGenesisHash00000000'

function getChainIdLine(text: string) {
  return text.split('\n').find(line => line.startsWith('Chain ID: '))
}

describe('DefaultSIWX default messenger', () => {
  beforeAll(() => {
    vi.useFakeTimers({ now: new Date('2024-01-01T00:00:00Z') })
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  test.each([
    [SOLANA_MAINNET, 'solana:mainnet'],
    [SOLANA_TESTNET, 'solana:testnet'],
    [SOLANA_DEVNET, 'solana:devnet']
  ] as [CaipNetworkId, string][])(
    'adds the statement and writes %s as %s in the message text',
    async (chainId, expectedChainIdText) => {
      const message = await new DefaultSIWX().createMessage({ accountAddress: ADDRESS, chainId })
      const text = message.toString()

      expect(message.statement).toBe(STATEMENT)
      expect(message.chainId).toBe(chainId)
      expect(text).toContain(`\n${ADDRESS}\n\n${STATEMENT}\n\nURI: `)
      expect(getChainIdLine(text)).toBe(`Chain ID: ${expectedChainIdText}`)
    }
  )

  test('keeps the CAIP-2 id for a custom Solana network but still adds the statement', async () => {
    const message = await new DefaultSIWX().createMessage({
      accountAddress: ADDRESS,
      chainId: SOLANA_CUSTOM
    })
    const text = message.toString()

    expect(message.statement).toBe(STATEMENT)
    expect(text).toContain(`\n${ADDRESS}\n\n${STATEMENT}\n\nURI: `)
    expect(getChainIdLine(text)).toBe(`Chain ID: ${SOLANA_CUSTOM}`)
  })

  test.each([
    ['eip155:1', '0x1234567890abcdef1234567890abcdef12345678'],
    ['bip122:000000000019d6689c085ae165831e93', 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq']
  ] as [CaipNetworkId, string][])(
    'leaves the %s message unchanged',
    async (chainId, accountAddress) => {
      const message = await new DefaultSIWX().createMessage({ accountAddress, chainId })
      const text = message.toString()

      expect(message.statement).toBeUndefined()
      expect(text).not.toContain(STATEMENT)
      expect(text).toContain(`\n${accountAddress}\n\nURI: `)
      expect(getChainIdLine(text)).toBe(`Chain ID: ${chainId}`)
    }
  )

  test('does not touch a messenger passed by the app', async () => {
    const messenger = new InformalMessenger({
      domain: 'example.com',
      uri: 'https://example.com',
      getNonce: () => Promise.resolve('12345678')
    })

    const message = await new DefaultSIWX({ messenger }).createMessage({
      accountAddress: ADDRESS,
      chainId: SOLANA_MAINNET
    })
    const text = message.toString()

    expect(message.statement).toBeUndefined()
    expect(text).not.toContain(STATEMENT)
    expect(getChainIdLine(text)).toBe(`Chain ID: ${SOLANA_MAINNET}`)
  })
})
