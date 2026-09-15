import { describe, expect, it } from 'vitest'

import type { CaipNetwork } from '@reown/appkit-common'

import { createNamespaces } from '../src/WCNamespaceUtil.js'

function network(
  overrides: Partial<CaipNetwork> & Pick<CaipNetwork, 'id' | 'chainNamespace' | 'caipNetworkId'>
): CaipNetwork {
  return {
    name: 'Test',
    nativeCurrency: { name: 'T', symbol: 'T', decimals: 18 },
    rpcUrls: { default: { http: ['https://rpc.example'] } },
    ...overrides
  } as CaipNetwork
}

describe('createNamespaces', () => {
  it('keeps standard EVM caipNetworkId values', () => {
    const result = createNamespaces([
      network({
        id: 1,
        chainNamespace: 'eip155',
        caipNetworkId: 'eip155:1'
      })
    ])

    expect(result.eip155?.chains).toEqual(['eip155:1'])
    expect(result.eip155?.rpcMap?.[1]).toBe('https://rpc.example')
  })

  it('uses caipNetworkId when it differs from `${chainNamespace}:${id}`', () => {
    const result = createNamespaces([
      network({
        id: 'stellar',
        chainNamespace: 'stellar',
        caipNetworkId: 'stellar:pubnet',
        nativeCurrency: { name: 'Lumens', symbol: 'XLM', decimals: 7 }
      })
    ])

    expect(result.stellar?.chains).toEqual(['stellar:pubnet'])
    expect(result.stellar?.chains).not.toContain('stellar:stellar')
  })

  it('uses caipNetworkId for Solana when id is a short alias', () => {
    const result = createNamespaces([
      network({
        id: 'solana',
        chainNamespace: 'solana',
        caipNetworkId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
        nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 }
      })
    ])

    expect(result.solana?.chains).toContain('solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp')
    expect(result.solana?.chains).not.toContain('solana:solana')
  })
})
