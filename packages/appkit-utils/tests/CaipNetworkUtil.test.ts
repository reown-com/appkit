import { describe, expect, test } from 'vitest'

import { CaipNetworksUtil } from '../src/CaipNetworkUtil.js'

describe('CaipNetworkUtil', () => {
  test('isCaipNetworkId', () => {
    expect(CaipNetworksUtil.isCaipNetworkId('eip155:1')).toBe(true)
    expect(CaipNetworksUtil.isCaipNetworkId('solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp')).toBe(true)
    expect(CaipNetworksUtil.isCaipNetworkId('bip122:000000000019d6689c085ae165831e93')).toBe(true)

    expect(CaipNetworksUtil.isCaipNetworkId('1')).toBe(false)
    expect(CaipNetworksUtil.isCaipNetworkId('5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp')).toBe(false)
    expect(CaipNetworksUtil.isCaipNetworkId('000000000019d6689c085ae165831e93')).toBe(false)
    expect(CaipNetworksUtil.isCaipNetworkId('eip155')).toBe(false)
    expect(CaipNetworksUtil.isCaipNetworkId(':')).toBe(false)
    expect(CaipNetworksUtil.isCaipNetworkId('unsupported:1')).toBe(false)
  })
})
