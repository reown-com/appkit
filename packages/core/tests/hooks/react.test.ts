import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { CaipNetwork } from '@reown/appkit-common'

import { AccountController, ChainController, ConnectorController } from '../../exports'
import { useAppKitAccount, useAppKitNetworkCore } from '../../exports/react'

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
      .mockReturnValueOnce({
        status: 'connected',
        preferredAccountType: 'eoa'
      }) // For AccountController
      .mockReturnValueOnce({ activeCaipAddress: mockCaipAddress }) // For ChainController

    const result = useAppKitAccount()

    expect(result).toEqual({
      allAccounts: undefined,
      address: mockPlainAddress,
      caipAddress: mockCaipAddress,
      isConnected: true,
      status: 'connected',
      embeddedWalletInfo: undefined
    })

    expect(useSnapshot).toHaveBeenCalledWith(AccountController.state)
    expect(useSnapshot).toHaveBeenCalledWith(ChainController.state)
  })

  it('should return the correct account state when connected', () => {
    const mockCaipAddress = 'eip155:1:0x123...'
    const mockPlainAddress = '0x123...'

    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue({} as any)

    // Mock the useSnapshot hook for both calls
    useSnapshot
      .mockReturnValueOnce({
        allAccounts: undefined,
        status: 'connected',
        preferredAccountType: 'eoa',
        smartAccountDeployed: false,
        user: {
          email: 'email@email.test',
          userName: 'test'
        }
      }) // For AccountController
      .mockReturnValueOnce({ activeCaipAddress: mockCaipAddress }) // For ChainController

    const result = useAppKitAccount()

    expect(result).toEqual({
      address: mockPlainAddress,
      caipAddress: mockCaipAddress,
      isConnected: true,
      status: 'connected',
      embeddedWalletInfo: {
        user: {
          email: 'email@email.test',
          userName: 'test'
        },
        authProvider: 'email',
        isSmartAccountDeployed: false,
        accountType: 'eoa'
      }
    })

    expect(useSnapshot).toHaveBeenCalledWith(AccountController.state)
    expect(useSnapshot).toHaveBeenCalledWith(ChainController.state)
  })

  it('should return appropiate auth provider when social provider is set', () => {
    const mockCaipAddress = 'eip155:1:0x123...'
    const mockPlainAddress = '0x123...'

    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue({} as any)

    // Mock the useSnapshot hook for both calls
    useSnapshot
      .mockReturnValueOnce({
        allAccounts: undefined,
        status: 'connected',
        socialProvider: 'google',
        preferredAccountType: 'eoa',
        smartAccountDeployed: false,
        user: {
          email: 'email@email.test',
          userName: 'test'
        }
      }) // For AccountController
      .mockReturnValueOnce({ activeCaipAddress: mockCaipAddress }) // For ChainController

    const result = useAppKitAccount()

    expect(result).toEqual({
      address: mockPlainAddress,
      caipAddress: mockCaipAddress,
      isConnected: true,
      status: 'connected',
      embeddedWalletInfo: {
        user: {
          email: 'email@email.test',
          userName: 'test'
        },
        authProvider: 'google',
        isSmartAccountDeployed: false,
        accountType: 'eoa'
      }
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
