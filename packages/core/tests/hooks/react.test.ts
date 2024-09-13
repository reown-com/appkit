import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useWeb3ModalNetwork, useWeb3ModalAccount } from '../../exports/react'

import type { CaipNetwork } from '@reown/appkit-common'
import { AccountController, ChainController } from '../../exports'

vi.mock('valtio', () => ({
  useSnapshot: vi.fn()
}))

const { useSnapshot } = vi.mocked(await import('valtio'), true)

describe('useWeb3ModalNetwork', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should return the correct network state', () => {
    const mockNetwork: CaipNetwork = {
      id: 'eip155:1',
      name: 'Ethereum',
      imageId: 'ethereum',
      rpcUrl: 'https://mainnet.infura.io/v3/YOUR-PROJECT-ID',
      chainId: 1,
      chainNamespace: 'eip155',
      explorerUrl: 'https://etherscan.io',
      currency: 'ETH'
    }

    // Mock the useSnapshot hook
    useSnapshot.mockReturnValue({
      activeCaipNetwork: mockNetwork
    })

    const { caipNetwork, chainId } = useWeb3ModalNetwork()

    expect(caipNetwork).toBe(mockNetwork)
    expect(chainId).toBe(1)
    expect(useSnapshot).toHaveBeenCalledWith(ChainController.state)
  })
})

describe('useWeb3ModalAccount', () => {
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

    const result = useWeb3ModalAccount()

    expect(result).toEqual({
      address: mockPlainAddress,
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

    const result = useWeb3ModalAccount()

    expect(result).toEqual({
      address: undefined,
      isConnected: false,
      status: 'disconnected'
    })

    expect(useSnapshot).toHaveBeenCalledWith(AccountController.state)
    expect(useSnapshot).toHaveBeenCalledWith(ChainController.state)
  })
})
