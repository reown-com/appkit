import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { CaipNetwork } from '@reown/appkit-common'

import { ChainController, ConnectionController, ConnectorController } from '../../exports/index.js'
import { useAppKitAccount, useAppKitNetworkCore, useDisconnect } from '../../exports/react.js'

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

  it('should return the correct account state when disconnected', () => {
    useSnapshot.mockReturnValueOnce({
      activeChain: 'eip155',
      chains: new Map([
        [
          'eip155',
          {
            accountState: {
              address: undefined,
              caipAddress: undefined,
              allAccounts: [],
              status: 'disconnected'
            }
          }
        ]
      ])
    })

    const result = useAppKitAccount()

    expect(result).toEqual({
      allAccounts: [],
      address: undefined,
      caipAddress: undefined,
      isConnected: false,
      status: 'disconnected',
      embeddedWalletInfo: undefined
    })
  })

  it('should return the correct account state when connected', () => {
    const mockCaipAddress = 'eip155:1:0x123...'
    const mockPlainAddress = '0x123...'

    useSnapshot.mockReturnValueOnce({
      activeChain: 'eip155',
      chains: new Map([
        [
          'eip155',
          {
            accountState: {
              address: mockPlainAddress,
              caipAddress: mockCaipAddress,
              allAccounts: [],
              status: 'connected'
            }
          }
        ]
      ])
    })

    const result = useAppKitAccount()

    expect(result).toEqual({
      allAccounts: [],
      address: mockPlainAddress,
      caipAddress: mockCaipAddress,
      isConnected: true,
      status: 'connected',
      embeddedWalletInfo: undefined
    })
  })

  it('should return correct embedded wallet info when connected with social provider', () => {
    const mockCaipAddress = 'eip155:1:0x123...'
    const mockPlainAddress = '0x123...'
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValueOnce({} as any)

    useSnapshot.mockReturnValueOnce({
      activeChain: 'eip155',
      chains: new Map([
        [
          'eip155',
          {
            accountState: {
              address: mockPlainAddress,
              caipAddress: mockCaipAddress,
              allAccounts: [],
              status: 'connected',
              preferredAccountType: 'eoa',
              socialProvider: 'google',
              smartAccountDeployed: false,
              user: {
                email: 'email@email.test',
                userName: 'test'
              }
            }
          }
        ]
      ])
    })

    const result = useAppKitAccount()

    expect(result).toEqual({
      allAccounts: [],
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
        accountType: 'eoa',
        isSmartAccountDeployed: false
      }
    })
  })

  it('should return account state with namespace parameter', async () => {
    const mockCaipAddress = 'eip155:1:0x123...'
    const mockPlainAddress = '0x123...'

    useSnapshot.mockReturnValueOnce({
      activeChain: 'eip155',
      chains: new Map([
        [
          'eip155',
          {
            accountState: {
              address: mockPlainAddress,
              caipAddress: mockCaipAddress,
              allAccounts: [],
              status: 'connected'
            }
          }
        ]
      ])
    })

    const result = useAppKitAccount({ namespace: 'solana' })

    expect(result).toEqual({
      allAccounts: [],
      address: undefined,
      caipAddress: undefined,
      isConnected: false,
      status: undefined,
      embeddedWalletInfo: undefined
    })
  })
})

describe('useDisconnect', () => {
  it('should disconnect as expected', async () => {
    const disconnectSpy = vi.spyOn(ConnectionController, 'disconnect')
    const { disconnect } = useDisconnect()

    await disconnect()

    expect(disconnectSpy).toHaveBeenCalled()
  })

  it('should disconnect for specific namespace as expected', async () => {
    const disconnectSpy = vi.spyOn(ConnectionController, 'disconnect')
    const { disconnect } = useDisconnect()

    await disconnect({ namespace: 'solana' })

    expect(disconnectSpy).toHaveBeenCalledWith('solana')
  })
})
