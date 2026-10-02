import { describe, expect, it } from 'vitest'

import { SolStoreUtil } from '../utils/SolanaStoreUtil'

describe('SolStoreUtil', () => {
  it('should set both connection and rpc together', () => {
    const mockConnection = { rpcEndpoint: 'mock-endpoint' } as any
    const mockRpc = { getBalance: () => {} } as any

    SolStoreUtil.setConnection(mockConnection, mockRpc)

    expect(SolStoreUtil.state.connection).toBe(mockConnection)
    expect(SolStoreUtil.state.rpc).toBe(mockRpc)
  })
})
