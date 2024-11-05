import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAppKitNetworkCore, useAppKitAccount } from '../../exports/react'

import type { CaipNetwork } from '@reown/appkit-common'
import { AccountController, ChainController } from '../../exports'

vi.mock('valtio', () => ({
  useSnapshot: vi.fn()
}))

const { useSnapshot } = vi.mocked(await import('valtio'), true)

describe('useAppKitNetwork', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should return the correct network state', () => {
    const mockNetwork: CaipNetwork = {
      id: 1,
      name: 'Ethereum',
      assets: {
        imageId: 'ethereum',
        imageUrl: ''
      },
      caipNetworkId: 'eip155:1',
      chainNamespace: 'eip155',
      nativeCurrency: {
        name: 'Ethereum',
        decimals: 18,
        symbol: 'ETH'
      },
      rpcUrls: {
        default: {
          http: ['']
        }
      }
    }

    // Mock the useSnapshot hook
    useSnapshot.mockReturnValue({
      activeCaipNetwork: mockNetwork
    })

    const { caipNetwork, chainId } = useAppKitNetworkCore()

    expect(caipNetwork).toBe(mockNetwork)
    expect(chainId).toBe(1)
    expect(useSnapshot).toHaveBeenCalledWith(ChainController.state)
  })
})

describe('useAppKitAccount', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should return the correct account state when connected', () => {
    const mockCaipAddress = 'eip155:1:0x123...'
    const mockPlainAddress = '0x123...'

    // Mock the useSnapshot hook for both calls
    useSnapshot
      .mockReturnValueOnce({ status: 'connected' }) // For AccountController
      .mockReturnValueOnce({ activeCaipAddress: mockCaipAddress }) // For ChainController

    const result = useAppKitAccount()

    expect(result).toEqual({
      address: mockPlainAddress,
      caipAddress: mockCaipAddress,
      isConnected: true,
      status: 'connected'
    })

    expect(useSnapshot).toHaveBeenCalledWith(AccountController.state)
    expect(useSnapshot).toHaveBeenCalledWith(ChainController.state)
  })

  it('should handle disconnected state', () => {
    // Mock the useSnapshot hook for both calls
    useSnapshot
      .mockReturnValueOnce({ status: 'disconnected' })
      .mockReturnValueOnce({ activeCaipAddress: undefined })

    const result = useAppKitAccount()

    expect(result).toEqual({
      address: undefined,
      caipAddress: undefined,
      isConnected: false,
      status: 'disconnected'
    })

    expect(useSnapshot).toHaveBeenCalledWith(AccountController.state)
    expect(useSnapshot).toHaveBeenCalledWith(ChainController.state)
  })
})
