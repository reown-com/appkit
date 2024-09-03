import { beforeEach, describe, expect, it } from 'vitest'
import { PolkadotClient } from '../src/client'

describe('Polkadot Client', () => {
  let polkadotClient = new PolkadotClient()

  beforeEach(() => {
    polkadotClient = new PolkadotClient()
  })

  it('should be defined', () => {
    expect(polkadotClient).toBeDefined()
  })
})
