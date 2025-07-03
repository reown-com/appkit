import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ConstantsUtil as CommonConstantsUtil, ConstantsUtil } from '@reown/appkit-common'
import type { Connection } from '@reown/appkit-common'

import {
  type AuthConnector,
  ChainController,
  ConnectionController,
  ConnectorController,
  type ConnectorControllerState,
  StorageUtil
} from '../../exports/index.js'
import {
  useAppKitAccount,
  useAppKitConnection,
  useAppKitConnections,
  useAppKitNetworkCore,
  useDisconnect
} from '../../exports/react.js'
import { extendedMainnet } from '../../exports/testing.js'
import { AssetUtil } from '../../exports/utils.js'
import { ConnectionControllerUtil } from '../../src/utils/ConnectionControllerUtil.js'

vi.mock('valtio', () => ({
  useSnapshot: vi.fn()
}))

vi.mock('react', () => ({
  useCallback: vi.fn(fn => fn),
  useState: vi.fn(() => [0, vi.fn()])
}))

const { useSnapshot } = vi.mocked(await import('valtio'), true)

const mockedReact = vi.mocked(await import('react'), true)

describe('useAppKitNetwork', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should return the correct network state', () => {
    useSnapshot.mockReturnValue({ activeCaipNetwork: extendedMainnet })

    const { caipNetwork, chainId } = useAppKitNetworkCore()

    expect(caipNetwork).toBe(extendedMainnet)
    expect(chainId).toBe(1)
    expect(useSnapshot).toHaveBeenCalledWith(ChainController.state)
  })
})

describe('useAppKitAccount', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should return the correct account state when disconnected', () => {
    useSnapshot.mockReturnValue({
      activeChain: 'eip155',
      activeConnectorIds: { eip155: 'test-connector' },
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

    useSnapshot.mockReturnValue({
      activeChain: 'eip155',
      activeConnectorIds: { eip155: 'test-connector' },
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
    const authConnector = {
      id: 'ID_AUTH',
      name: 'ID Auth',
      imageUrl: 'https://example.com/id-auth.png'
    } as AuthConnector
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue(authConnector)
    vi.spyOn(StorageUtil, 'getConnectedConnectorId').mockReturnValue('ID_AUTH')
    vi.spyOn(StorageUtil, 'getConnectedSocialUsername').mockReturnValue('test-username')

    useSnapshot.mockReturnValue({
      activeChain: 'eip155',
      activeConnectorIds: { eip155: CommonConstantsUtil.CONNECTOR_ID.AUTH },
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
                email: 'email@email.test'
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
          username: 'test-username'
        },
        authProvider: 'google',
        accountType: 'eoa',
        isSmartAccountDeployed: false
      }
    })
  })

  it('should return account state with namespace parameter', async () => {
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      allConnectors: [{}],
      connected: true,
      activeConnector: {}
    } as unknown as ConnectorControllerState)

    const mockCaipAddress = 'eip155:1:0x123...'
    const mockPlainAddress = '0x123...'

    useSnapshot.mockReturnValue({
      activeChain: 'eip155',
      activeConnectorIds: { eip155: 'test-connector' },
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

    expect(disconnectSpy).toHaveBeenCalledWith({ namespace: 'solana' })
  })
})

describe('useAppKitConnections', () => {
  const mockConnection = {
    connectorId: 'test-connector',
    accounts: [{ address: '0x123...', type: 'eoa' }],
    caipNetwork: {
      id: 1,
      name: 'Ethereum',

      caipNetworkId: 'eip155:1',
      chainNamespace: ConstantsUtil.CHAIN.EVM
    }
  } as unknown as Connection

  const mockFormattedConnection = {
    ...mockConnection,
    name: 'Test Connector',
    icon: 'connector-icon-url',
    networkIcon: 'network-icon-url'
  }

  const mockConnector = {
    id: 'test-connector',
    type: 'WALLET_CONNECT' as const,
    name: 'Test Connector',
    chain: 'eip155' as const
  }

  beforeEach(() => {
    vi.resetAllMocks()

    mockedReact.useState.mockReturnValue([0, vi.fn()])
    mockedReact.useCallback.mockImplementation(fn => fn)
  })

  it('should return formatted connections and storage connections', () => {
    useSnapshot
      .mockReturnValueOnce({})
      .mockReturnValueOnce({})
      .mockReturnValueOnce({})
      .mockReturnValueOnce({ activeChain: 'eip155' })
      .mockReturnValueOnce({ remoteFeatures: { multiWallet: true } })

    vi.spyOn(ConnectionControllerUtil, 'getConnectionsData').mockReturnValue({
      connections: [mockConnection],
      recentConnections: [mockConnection]
    })

    vi.spyOn(ConnectorController, 'getConnectorById').mockReturnValue(mockConnector)
    vi.spyOn(ConnectorController, 'getConnectorName').mockReturnValue('Test Connector')

    vi.spyOn(AssetUtil, 'getConnectorImage').mockReturnValue('connector-icon-url')
    vi.spyOn(AssetUtil, 'getNetworkImage').mockReturnValue('network-icon-url')

    const result = useAppKitConnections()

    expect(result).toEqual({
      connections: [mockFormattedConnection],
      recentConnections: [mockFormattedConnection]
    })

    expect(ConnectionControllerUtil.getConnectionsData).toHaveBeenCalledWith('eip155')
    expect(ConnectorController.getConnectorById).toHaveBeenCalledWith('test-connector')
    expect(AssetUtil.getConnectorImage).toHaveBeenCalled()
    expect(AssetUtil.getNetworkImage).toHaveBeenCalledWith(mockConnection.caipNetwork)
  })

  it('should use provided namespace instead of active chain', () => {
    useSnapshot
      .mockReturnValueOnce({})
      .mockReturnValueOnce({})
      .mockReturnValueOnce({})
      .mockReturnValueOnce({ activeChain: 'eip155' })
      .mockReturnValueOnce({ remoteFeatures: { multiWallet: true } })

    vi.spyOn(ConnectionControllerUtil, 'getConnectionsData').mockReturnValue({
      connections: [],
      recentConnections: []
    })

    useAppKitConnections('solana')

    expect(ConnectionControllerUtil.getConnectionsData).toHaveBeenCalledWith('solana')
  })

  it('should throw error when no namespace is found', () => {
    useSnapshot
      .mockReturnValueOnce({})
      .mockReturnValueOnce({})
      .mockReturnValueOnce({})
      .mockReturnValueOnce({ activeChain: undefined })
      .mockReturnValueOnce({ remoteFeatures: { multiWallet: true } })

    expect(() => useAppKitConnections()).toThrow('No namespace found')
  })

  it('should handle empty connections', () => {
    useSnapshot
      .mockReturnValueOnce({})
      .mockReturnValueOnce({})
      .mockReturnValueOnce({})
      .mockReturnValueOnce({ activeChain: 'eip155' })
      .mockReturnValueOnce({ remoteFeatures: { multiWallet: true } })

    vi.spyOn(ConnectionControllerUtil, 'getConnectionsData').mockReturnValue({
      connections: [],
      recentConnections: []
    })

    const result = useAppKitConnections()

    expect(result).toEqual({
      connections: [],
      recentConnections: []
    })
  })

  it('should return empty state when multiWallet is disabled', () => {
    useSnapshot
      .mockReturnValueOnce({})
      .mockReturnValueOnce({})
      .mockReturnValueOnce({})
      .mockReturnValueOnce({ activeChain: 'eip155' })
      .mockReturnValueOnce({ remoteFeatures: { multiWallet: false } })

    const result = useAppKitConnections()

    expect(result).toEqual({
      connections: [],
      recentConnections: []
    })
  })
})

describe('useAppKitConnection', () => {
  const mockConnection = {
    connectorId: 'test-connector',
    accounts: [{ address: '0x123...', type: 'eoa' }],
    caipNetwork: {}
  } as unknown as Connection

  const mockOnSuccess = vi.fn()
  const mockOnError = vi.fn()

  beforeEach(() => {
    vi.resetAllMocks()

    mockedReact.useState.mockReturnValue([0, vi.fn()])
    mockedReact.useCallback.mockImplementation(fn => fn)
  })

  it('should return current connection and connection state', () => {
    const mockConnections = new Map([['eip155', [mockConnection]]])

    useSnapshot
      .mockReturnValueOnce({
        connections: mockConnections,
        isSwitchingConnection: false
      })
      .mockReturnValueOnce({
        activeConnectorIds: { eip155: 'test-connector' }
      })
      .mockReturnValueOnce({ activeChain: 'eip155' })
      .mockReturnValueOnce({ remoteFeatures: { multiWallet: true } })

    const result = useAppKitConnection({
      onSuccess: mockOnSuccess,
      onError: mockOnError
    })

    expect(result.connection).toBe(mockConnection)
    expect(result.isPending).toBe(false)
    expect(typeof result.switchConnection).toBe('function')
    expect(typeof result.deleteConnection).toBe('function')
  })

  it('should handle switching connection successfully', async () => {
    const mockConnections = new Map([['eip155', [mockConnection]]])

    useSnapshot
      .mockReturnValueOnce({
        connections: mockConnections,
        isSwitchingConnection: false
      })
      .mockReturnValueOnce({
        activeConnectorIds: { eip155: 'test-connector' }
      })
      .mockReturnValueOnce({ activeChain: 'eip155' })
      .mockReturnValueOnce({ remoteFeatures: { multiWallet: true } })

    const setIsSwitchingConnectionSpy = vi.spyOn(ConnectionController, 'setIsSwitchingConnection')
    const switchConnectionSpy = vi
      .spyOn(ConnectionController, 'switchConnection')
      .mockImplementation(async ({ onChange }) => {
        onChange?.({
          address: '0x456...',
          namespace: 'eip155',
          hasSwitchedAccount: true,
          hasSwitchedWallet: false
        })
      })

    const { switchConnection } = useAppKitConnection({
      onSuccess: mockOnSuccess,
      onError: mockOnError
    })

    await switchConnection({
      connection: mockConnection,
      address: '0x456...'
    })

    expect(setIsSwitchingConnectionSpy).toHaveBeenCalledWith(true)
    expect(switchConnectionSpy).toHaveBeenCalledWith({
      connection: mockConnection,
      address: '0x456...',
      namespace: 'eip155',
      onChange: expect.any(Function)
    })
    expect(mockOnSuccess).toHaveBeenCalledWith({
      address: '0x456...',
      namespace: 'eip155',
      hasSwitchedAccount: true,
      hasSwitchedWallet: false,
      hasDeletedWallet: false
    })
    expect(setIsSwitchingConnectionSpy).toHaveBeenCalledWith(false)
  })

  it('should handle switching connection error', async () => {
    const mockConnections = new Map([['eip155', [mockConnection]]])
    const mockError = new Error('Connection failed')

    useSnapshot
      .mockReturnValueOnce({
        connections: mockConnections,
        isSwitchingConnection: false
      })
      .mockReturnValueOnce({
        activeConnectorIds: { eip155: 'test-connector' }
      })
      .mockReturnValueOnce({ activeChain: 'eip155' })
      .mockReturnValueOnce({ remoteFeatures: { multiWallet: true } })

    const setIsSwitchingConnectionSpy = vi.spyOn(ConnectionController, 'setIsSwitchingConnection')
    const switchConnectionSpy = vi
      .spyOn(ConnectionController, 'switchConnection')
      .mockRejectedValue(mockError)

    const { switchConnection } = useAppKitConnection({
      onSuccess: mockOnSuccess,
      onError: mockOnError
    })

    await switchConnection({
      connection: mockConnection,
      address: '0x456...'
    })

    expect(setIsSwitchingConnectionSpy).toHaveBeenCalledWith(true)
    expect(switchConnectionSpy).toHaveBeenCalled()
    expect(mockOnError).toHaveBeenCalledWith(mockError)
    expect(setIsSwitchingConnectionSpy).toHaveBeenCalledWith(false)
  })

  it('should handle non-error exceptions in switchConnection', async () => {
    const mockConnections = new Map([['eip155', [mockConnection]]])

    useSnapshot
      .mockReturnValueOnce({
        connections: mockConnections,
        isSwitchingConnection: false
      })
      .mockReturnValueOnce({
        activeConnectorIds: { eip155: 'test-connector' }
      })
      .mockReturnValueOnce({ activeChain: 'eip155' })
      .mockReturnValueOnce({ remoteFeatures: { multiWallet: true } })

    const setIsSwitchingConnectionSpy = vi.spyOn(ConnectionController, 'setIsSwitchingConnection')
    const switchConnectionSpy = vi
      .spyOn(ConnectionController, 'switchConnection')
      .mockRejectedValue('String error')

    const { switchConnection } = useAppKitConnection({
      onSuccess: mockOnSuccess,
      onError: mockOnError
    })

    await switchConnection({
      connection: mockConnection,
      address: '0x456...'
    })

    expect(setIsSwitchingConnectionSpy).toHaveBeenCalledWith(true)
    expect(switchConnectionSpy).toHaveBeenCalled()
    expect(mockOnError).toHaveBeenCalledWith(new Error('Something went wrong'))
    expect(setIsSwitchingConnectionSpy).toHaveBeenCalledWith(false)
  })

  it('should handle deleting connection', () => {
    const mockConnections = new Map([['eip155', [mockConnection]]])

    useSnapshot
      .mockReturnValueOnce({
        connections: mockConnections,
        isSwitchingConnection: false
      })
      .mockReturnValueOnce({
        activeConnectorIds: { eip155: 'test-connector' }
      })
      .mockReturnValueOnce({ activeChain: 'eip155' })
      .mockReturnValueOnce({ remoteFeatures: { multiWallet: true } })

    const deleteAddressFromConnectionSpy = vi.spyOn(StorageUtil, 'deleteAddressFromConnection')

    const { deleteConnection } = useAppKitConnection({
      onSuccess: mockOnSuccess,
      onError: mockOnError
    })

    deleteConnection({
      address: '0x123...',
      connectorId: 'test-connector'
    })

    expect(deleteAddressFromConnectionSpy).toHaveBeenCalledWith({
      connectorId: 'test-connector',
      address: '0x123...',
      namespace: 'eip155'
    })
    expect(mockOnSuccess).toHaveBeenCalledWith({
      address: '0x123...',
      namespace: 'eip155',
      hasSwitchedAccount: false,
      hasSwitchedWallet: false,
      hasDeletedWallet: true
    })
  })

  it('should use provided namespace instead of active chain', () => {
    const mockConnections = new Map([
      ['solana', [{ ...mockConnection, connectorId: 'solana-connector' }]]
    ])

    useSnapshot
      .mockReturnValueOnce({
        connections: mockConnections,
        isSwitchingConnection: false
      })
      .mockReturnValueOnce({
        activeConnectorIds: { solana: 'solana-connector' }
      })
      .mockReturnValueOnce({ activeChain: 'eip155' })
      .mockReturnValueOnce({ remoteFeatures: { multiWallet: true } })

    const result = useAppKitConnection({
      namespace: 'solana',
      onSuccess: mockOnSuccess,
      onError: mockOnError
    })

    expect(result.connection).toEqual({ ...mockConnection, connectorId: 'solana-connector' })
  })

  it('should throw error when no namespace is found', () => {
    useSnapshot
      .mockReturnValueOnce({
        connections: new Map(),
        isSwitchingConnection: false
      })
      .mockReturnValueOnce({
        activeConnectorIds: {}
      })
      .mockReturnValueOnce({ activeChain: undefined })
      .mockReturnValueOnce({ remoteFeatures: { multiWallet: true } })

    expect(() =>
      useAppKitConnection({
        onSuccess: mockOnSuccess,
        onError: mockOnError
      })
    ).toThrow('No namespace found')
  })

  it('should return undefined connection when no matching connector found', () => {
    const mockConnections = new Map([['eip155', [mockConnection]]])

    useSnapshot
      .mockReturnValueOnce({
        connections: mockConnections,
        isSwitchingConnection: false
      })
      .mockReturnValueOnce({
        activeConnectorIds: { eip155: 'different-connector' }
      })
      .mockReturnValueOnce({ activeChain: 'eip155' })
      .mockReturnValueOnce({ remoteFeatures: { multiWallet: true } })

    const result = useAppKitConnection({
      onSuccess: mockOnSuccess,
      onError: mockOnError
    })

    expect(result.connection).toBeUndefined()
  })

  it('should handle case-insensitive connector matching', () => {
    const mockConnections = new Map([
      ['eip155', [{ ...mockConnection, connectorId: 'TEST-CONNECTOR' }]]
    ])

    useSnapshot
      .mockReturnValueOnce({
        connections: mockConnections,
        isSwitchingConnection: false
      })
      .mockReturnValueOnce({
        activeConnectorIds: { eip155: 'test-connector' }
      })
      .mockReturnValueOnce({ activeChain: 'eip155' })
      .mockReturnValueOnce({ remoteFeatures: { multiWallet: true } })

    const result = useAppKitConnection({
      onSuccess: mockOnSuccess,
      onError: mockOnError
    })

    expect(result.connection).toEqual({ ...mockConnection, connectorId: 'TEST-CONNECTOR' })
  })

  it('should return empty state when multiWallet is disabled', () => {
    useSnapshot
      .mockReturnValueOnce({
        connections: new Map(),
        isSwitchingConnection: false
      })
      .mockReturnValueOnce({
        activeConnectorIds: {}
      })
      .mockReturnValueOnce({
        activeChain: 'eip155'
      })
      .mockReturnValueOnce({ remoteFeatures: { multiWallet: false } })

    const result = useAppKitConnection({ namespace: 'eip155' })

    expect(result.connection).toBeUndefined()
    expect(result.isPending).toBe(false)
  })
})
