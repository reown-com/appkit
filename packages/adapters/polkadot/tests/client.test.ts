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

  it('should have correct chain namespace', () => {
    expect(polkadotClient.chainNamespace).toBe('polkadot')
  })

  it('should have correct adapter type', () => {
    expect(polkadotClient.adapterType).toBe('polkadot')
  })

  it('should initialize parameters undefined before construct', () => {
    expect(polkadotClient.options).toBeUndefined()
    expect(polkadotClient.connectionControllerClient).toBeUndefined()
    expect(polkadotClient.defaultCaipNetwork).toBeUndefined()
  })
})
