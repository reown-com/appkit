import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ConstantsUtil as CommonConstantsUtil, ConstantsUtil } from '@reown/appkit-common'
import type { Connection } from '@reown/appkit-common'

import {
  ApiController,
  type AuthConnector,
  ChainController,
  ConnectionController,
  ConnectorController,
  type ConnectorControllerState,
  PublicStateController,
  StorageUtil
} from '../../exports/index.js'
import {
  useAppKitAccount,
  useAppKitConnection,
  useAppKitConnections,
  useAppKitNetworkCore,
  useAppKitWallets,
  useDisconnect
} from '../../exports/react.js'
import { extendedMainnet } from '../../exports/testing.js'
import { AssetUtil } from '../../exports/utils.js'
import { ConnectUtil } from '../../src/utils/ConnectUtil.js'
import type { WalletItem } from '../../src/utils/ConnectUtil.js'
import { ConnectionControllerUtil } from '../../src/utils/ConnectionControllerUtil.js'
import { ConnectorControllerUtil } from '../../src/utils/ConnectorControllerUtil.js'

vi.mock('valtio', () => ({
  useSnapshot: vi.fn()
}))

// Store refs to persist across renders and mock resets
let useRefCallCount = 0
const refStore: Array<{ current: any }> = []

// Factory function that creates a useRef mock implementation
function createUseRefMock() {
  return (initialValue: any) => {
    // This simulates React's behavior where useRef returns the same ref across renders
    const callIndex = useRefCallCount++
    if (!refStore[callIndex]) {
      refStore[callIndex] = { current: initialValue }
    }
    return refStore[callIndex]
  }
}

vi.mock('react', () => ({
  useCallback: vi.fn(fn => fn),
  useState: vi.fn(() => [0, vi.fn()]),
  useMemo: vi.fn(fn => fn()),
  useEffect: vi.fn(),
  useRef: vi.fn(createUseRefMock())
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
      id: 'AUTH',
      name: 'ID Auth',
      imageUrl: 'https://example.com/id-auth.png'
    } as AuthConnector
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue(authConnector)
    vi.spyOn(StorageUtil, 'getConnectedConnectorId').mockReturnValue('AUTH')
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
    vi.spyOn(ConnectionControllerUtil, 'getConnectionsData').mockReturnValue({
      connections: [],
      recentConnections: []
    })

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
    vi.spyOn(ConnectionControllerUtil, 'getConnectionsData').mockReturnValue({
      connections: [],
      recentConnections: []
    })

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

describe('useAppKitWallets', () => {
  const mockWalletItem: WalletItem = {
    id: 'test-wallet',
    name: 'Test Wallet',
    imageUrl: 'https://example.com/wallet.png',
    connectors: [
      {
        id: 'test-connector',
        chain: 'eip155',
        chainImageUrl: 'https://example.com/chain.png'
      }
    ],
    isInjected: false,
    isRecent: false,
    supportsWcPay: false,
    walletInfo: {}
  }

  const mockInjectedWalletItem: WalletItem = {
    ...mockWalletItem,
    id: 'injected-wallet',
    name: 'Injected Wallet',
    isInjected: true
  }

  beforeEach(() => {
    // Reset ref tracking to start fresh for each test
    useRefCallCount = 0
    refStore.length = 0

    vi.resetAllMocks()

    // Re-implement useRef mock after reset to ensure it always returns valid refs
    // This must be done after resetAllMocks because reset clears the mock implementation
    mockedReact.useRef.mockImplementation((initialValue: any) => {
      const callIndex = useRefCallCount++
      if (!refStore[callIndex]) {
        refStore[callIndex] = { current: initialValue }
      }
      return refStore[callIndex]
    })

    mockedReact.useState.mockReturnValue([false, vi.fn()])
    mockedReact.useMemo.mockImplementation(fn => fn())
    mockedReact.useEffect.mockImplementation(fn => fn())
  })

  it('should return empty state when headless is not enabled', () => {
    useSnapshot.mockReturnValue({
      features: { headless: false },
      remoteFeatures: { headless: false }
    })

    // Mock ConnectorController.state since useMemo runs before early return
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      connectors: []
    } as any)
    // Mock ApiController.state since getInitialWallets and getWalletConnectWallets access it
    ApiController.state.wallets = []
    ApiController.state.search = []

    const result = useAppKitWallets()

    expect(result).toEqual({
      wallets: [],
      wcWallets: [],
      isFetchingWallets: false,
      isFetchingWcUri: false,
      isInitialized: false,
      wcUri: undefined,
      connectingWallet: undefined,
      page: 0,
      count: 0,
      connect: expect.any(Function),
      fetchWallets: expect.any(Function),
      resetWcUri: expect.any(Function)
    })
  })

  it('should return empty state when remoteFeatures.headless is false', () => {
    useSnapshot.mockReturnValue({
      features: { headless: true },
      remoteFeatures: { headless: false }
    })

    // Mock ConnectorController.state since useMemo runs before early return
    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      connectors: []
    } as any)
    // Mock ApiController.state since getInitialWallets and getWalletConnectWallets access it
    ApiController.state.wallets = []
    ApiController.state.search = []

    const result = useAppKitWallets()

    expect(result.wallets).toEqual([])
    expect(result.wcWallets).toEqual([])
    expect(result.isInitialized).toBe(false)
  })

  it('should return wallets and wcWallets when headless is enabled', () => {
    const mockWallets = [mockWalletItem]
    const mockWcWallets = [mockWalletItem, { ...mockWalletItem, id: 'wc-wallet-2' }]

    useSnapshot
      .mockReturnValueOnce({
        features: { headless: true },
        remoteFeatures: { headless: true }
      })
      .mockReturnValueOnce({
        wcUri: undefined,
        wcFetchingUri: false
      })
      .mockReturnValueOnce({
        wallets: [{ id: 'wc-wallet-1' }, { id: 'wc-wallet-2' }],
        search: [],
        page: 1,
        count: 100
      })
      .mockReturnValueOnce({
        initialized: true,
        connectingWallet: undefined
      })

    vi.spyOn(ConnectUtil, 'getInitialWallets').mockReturnValue(mockWallets)
    vi.spyOn(ConnectUtil, 'getWalletConnectWallets').mockReturnValue(mockWcWallets)

    const result = useAppKitWallets()

    expect(result.wallets).toEqual(mockWallets)
    expect(result.wcWallets).toEqual(mockWcWallets)
    expect(result.isInitialized).toBe(true)
    expect(result.isFetchingWcUri).toBe(false)
    expect(result.page).toBe(1)
    expect(result.count).toBe(100)
  })

  it('should return correct state values', () => {
    const setIsFetchingWallets = vi.fn()
    mockedReact.useState.mockReturnValue([true, setIsFetchingWallets])

    useSnapshot
      .mockReturnValueOnce({
        features: { headless: true },
        remoteFeatures: { headless: true }
      })
      .mockReturnValueOnce({
        wcUri: 'wc:test-uri',
        wcFetchingUri: true
      })
      .mockReturnValueOnce({
        wallets: [],
        search: [],
        page: 2,
        count: 50
      })
      .mockReturnValueOnce({
        initialized: true,
        connectingWallet: mockWalletItem
      })

    vi.spyOn(ConnectUtil, 'getInitialWallets').mockReturnValue([])
    vi.spyOn(ConnectUtil, 'getWalletConnectWallets').mockReturnValue([])

    const result = useAppKitWallets()

    expect(result.isFetchingWallets).toBe(true)
    expect(result.isFetchingWcUri).toBe(true)
    expect(result.wcUri).toBe('wc:test-uri')
    expect(result.connectingWallet).toEqual(mockWalletItem)
    expect(result.page).toBe(2)
    expect(result.count).toBe(50)
  })

  it('should fetch wallets without query', async () => {
    const setIsFetchingWallets = vi.fn()
    mockedReact.useState.mockReturnValue([false, setIsFetchingWallets])

    useSnapshot
      .mockReturnValueOnce({
        features: { headless: true },
        remoteFeatures: { headless: true }
      })
      .mockReturnValueOnce({
        wcUri: undefined,
        wcFetchingUri: false
      })
      .mockReturnValueOnce({
        wallets: [],
        search: [],
        page: 1,
        count: 0
      })
      .mockReturnValueOnce({
        initialized: true,
        connectingWallet: undefined
      })

    vi.spyOn(ConnectUtil, 'getInitialWallets').mockReturnValue([])
    vi.spyOn(ConnectUtil, 'getWalletConnectWallets').mockReturnValue([])
    const fetchWalletsByPageSpy = vi
      .spyOn(ApiController, 'fetchWalletsByPage')
      .mockResolvedValue(undefined)

    const result = useAppKitWallets()

    await result.fetchWallets()

    expect(setIsFetchingWallets).toHaveBeenCalledWith(true)
    expect(fetchWalletsByPageSpy).toHaveBeenCalledWith({ page: 1, entries: undefined })
    expect(ApiController.state.search).toEqual([])
    expect(setIsFetchingWallets).toHaveBeenCalledWith(false)
  })

  it('should fetch wallets with query', async () => {
    const setIsFetchingWallets = vi.fn()
    mockedReact.useState.mockReturnValue([false, setIsFetchingWallets])

    useSnapshot
      .mockReturnValueOnce({
        features: { headless: true },
        remoteFeatures: { headless: true }
      })
      .mockReturnValueOnce({
        wcUri: undefined,
        wcFetchingUri: false
      })
      .mockReturnValueOnce({
        wallets: [],
        search: [],
        page: 1,
        count: 0
      })
      .mockReturnValueOnce({
        initialized: true,
        connectingWallet: undefined
      })

    vi.spyOn(ConnectUtil, 'getInitialWallets').mockReturnValue([])
    vi.spyOn(ConnectUtil, 'getWalletConnectWallets').mockReturnValue([])
    const searchWalletSpy = vi.spyOn(ApiController, 'searchWallet').mockResolvedValue(undefined)

    const result = useAppKitWallets()

    await result.fetchWallets({ query: 'metamask' })

    expect(setIsFetchingWallets).toHaveBeenCalledWith(true)
    expect(searchWalletSpy).toHaveBeenCalledWith({ search: 'metamask' })
    expect(setIsFetchingWallets).toHaveBeenCalledWith(false)
  })

  it('should fetch wallets with page and entries', async () => {
    const setIsFetchingWallets = vi.fn()
    mockedReact.useState.mockReturnValue([false, setIsFetchingWallets])

    useSnapshot
      .mockReturnValueOnce({
        features: { headless: true },
        remoteFeatures: { headless: true }
      })
      .mockReturnValueOnce({
        wcUri: undefined,
        wcFetchingUri: false
      })
      .mockReturnValueOnce({
        wallets: [],
        search: [],
        page: 1,
        count: 0
      })
      .mockReturnValueOnce({
        initialized: true,
        connectingWallet: undefined
      })

    vi.spyOn(ConnectUtil, 'getInitialWallets').mockReturnValue([])
    vi.spyOn(ConnectUtil, 'getWalletConnectWallets').mockReturnValue([])
    const fetchWalletsByPageSpy = vi
      .spyOn(ApiController, 'fetchWalletsByPage')
      .mockResolvedValue(undefined)

    const result = useAppKitWallets()

    await result.fetchWallets({ page: 3 })

    expect(fetchWalletsByPageSpy).toHaveBeenCalledWith({ page: 3 })
  })

  it('should handle fetchWallets error gracefully', async () => {
    const setIsFetchingWallets = vi.fn()
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockedReact.useState.mockReturnValue([false, setIsFetchingWallets])

    useSnapshot
      .mockReturnValueOnce({
        features: { headless: true },
        remoteFeatures: { headless: true }
      })
      .mockReturnValueOnce({
        wcUri: undefined,
        wcFetchingUri: false
      })
      .mockReturnValueOnce({
        wallets: [],
        search: [],
        page: 1,
        count: 0
      })
      .mockReturnValueOnce({
        initialized: true,
        connectingWallet: undefined
      })

    vi.spyOn(ConnectUtil, 'getInitialWallets').mockReturnValue([])
    vi.spyOn(ConnectUtil, 'getWalletConnectWallets').mockReturnValue([])
    vi.spyOn(ApiController, 'fetchWalletsByPage').mockRejectedValue(new Error('Fetch failed'))

    const result = useAppKitWallets()

    await result.fetchWallets()

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to fetch WalletConnect wallets:',
      expect.any(Error)
    )
    expect(setIsFetchingWallets).toHaveBeenCalledWith(false)
    consoleErrorSpy.mockRestore()
  })

  it('should connect to injected wallet', async () => {
    const mockConnector = {
      id: 'test-connector',
      type: 'INJECTED' as const,
      name: 'Test Connector',
      chain: 'eip155' as const
    }

    useSnapshot
      .mockReturnValueOnce({
        features: { headless: true },
        remoteFeatures: { headless: true }
      })
      .mockReturnValueOnce({
        wcUri: undefined,
        wcFetchingUri: false
      })
      .mockReturnValueOnce({
        wallets: [],
        search: [],
        page: 1,
        count: 0
      })
      .mockReturnValueOnce({
        initialized: true,
        connectingWallet: undefined
      })

    vi.spyOn(ConnectUtil, 'getInitialWallets').mockReturnValue([])
    vi.spyOn(ConnectUtil, 'getWalletConnectWallets').mockReturnValue([])
    const setSpy = vi.spyOn(PublicStateController, 'set')
    const getConnectorSpy = vi
      .spyOn(ConnectorController, 'getConnector')
      .mockReturnValue(mockConnector as any)
    const connectExternalSpy = vi
      .spyOn(ConnectorControllerUtil, 'connectExternal')
      .mockResolvedValue({ address: '0x123', chainNamespace: 'eip155', chainId: '1' })

    const result = useAppKitWallets()

    await result.connect(mockInjectedWalletItem, 'eip155')

    expect(setSpy).toHaveBeenCalledWith({ connectingWallet: mockInjectedWalletItem })
    expect(getConnectorSpy).toHaveBeenCalledWith({
      id: 'test-connector',
      namespace: 'eip155'
    })
    expect(connectExternalSpy).toHaveBeenCalledWith(mockConnector)
  })

  it('should connect to WalletConnect wallet', async () => {
    useSnapshot
      .mockReturnValueOnce({
        features: { headless: true },
        remoteFeatures: { headless: true }
      })
      .mockReturnValueOnce({
        wcUri: undefined,
        wcFetchingUri: false
      })
      .mockReturnValueOnce({
        wallets: [],
        search: [],
        page: 1,
        count: 0
      })
      .mockReturnValueOnce({
        initialized: true,
        connectingWallet: undefined
      })

    vi.spyOn(ConnectUtil, 'getInitialWallets').mockReturnValue([])
    vi.spyOn(ConnectUtil, 'getWalletConnectWallets').mockReturnValue([])
    const setSpy = vi.spyOn(PublicStateController, 'set')
    const connectWalletConnectSpy = vi
      .spyOn(ConnectionController, 'connectWalletConnect')
      .mockResolvedValue(undefined)

    const result = useAppKitWallets()

    await result.connect(mockWalletItem)

    expect(setSpy).toHaveBeenCalledWith({ connectingWallet: mockWalletItem })
    expect(connectWalletConnectSpy).toHaveBeenCalledWith({ cache: 'never' })
  })

  it('should connect to WalletConnect wallet when connector is not found', async () => {
    useSnapshot
      .mockReturnValueOnce({
        features: { headless: true },
        remoteFeatures: { headless: true }
      })
      .mockReturnValueOnce({
        wcUri: undefined,
        wcFetchingUri: false
      })
      .mockReturnValueOnce({
        wallets: [],
        search: [],
        page: 1,
        count: 0
      })
      .mockReturnValueOnce({
        initialized: true,
        connectingWallet: undefined
      })

    vi.spyOn(ConnectUtil, 'getInitialWallets').mockReturnValue([])
    vi.spyOn(ConnectUtil, 'getWalletConnectWallets').mockReturnValue([])
    const setSpy = vi.spyOn(PublicStateController, 'set')
    vi.spyOn(ConnectorController, 'getConnector').mockReturnValue(undefined)
    const connectWalletConnectSpy = vi
      .spyOn(ConnectionController, 'connectWalletConnect')
      .mockResolvedValue(undefined)

    const result = useAppKitWallets()

    await result.connect(mockInjectedWalletItem, 'eip155')

    expect(setSpy).toHaveBeenCalledWith({ connectingWallet: mockInjectedWalletItem })
    expect(connectWalletConnectSpy).toHaveBeenCalledWith({ cache: 'never' })
  })

  it('should handle connect error and clear connectingWallet', async () => {
    const mockError = new Error('Connection failed')

    useSnapshot
      .mockReturnValueOnce({
        features: { headless: true },
        remoteFeatures: { headless: true }
      })
      .mockReturnValueOnce({
        wcUri: undefined,
        wcFetchingUri: false
      })
      .mockReturnValueOnce({
        wallets: [],
        search: [],
        page: 1,
        count: 0
      })
      .mockReturnValueOnce({
        initialized: true,
        connectingWallet: undefined
      })

    vi.spyOn(ConnectUtil, 'getInitialWallets').mockReturnValue([])
    vi.spyOn(ConnectUtil, 'getWalletConnectWallets').mockReturnValue([])
    const setSpy = vi.spyOn(PublicStateController, 'set')
    vi.spyOn(ConnectionController, 'connectWalletConnect').mockRejectedValue(mockError)

    const result = useAppKitWallets()

    await expect(result.connect(mockWalletItem)).rejects.toThrow('Connection failed')
    expect(setSpy).toHaveBeenCalledWith({ connectingWallet: mockWalletItem })
    expect(setSpy).toHaveBeenCalledWith({ connectingWallet: undefined })
  })

  it('should show alert when headless is not enabled after initialization', () => {
    useSnapshot
      .mockReturnValueOnce({
        features: { headless: false },
        remoteFeatures: { headless: false }
      })
      .mockReturnValueOnce({
        wcUri: undefined,
        wcFetchingUri: false
      })
      .mockReturnValueOnce({
        wallets: [],
        search: [],
        page: 1,
        count: 0
      })
      .mockReturnValueOnce({
        initialized: true,
        connectingWallet: undefined
      })

    vi.spyOn(ConnectUtil, 'getInitialWallets').mockReturnValue([])
    vi.spyOn(ConnectUtil, 'getWalletConnectWallets').mockReturnValue([])

    useAppKitWallets()

    // useEffect should be called
    expect(mockedReact.useEffect).toHaveBeenCalled()
  })

  it('should use search results for wcWallets when search is not empty', () => {
    const mockSearchWallets = [
      { id: 'search-wallet-1', name: 'Search Wallet 1' },
      { id: 'search-wallet-2', name: 'Search Wallet 2' }
    ]

    useSnapshot
      .mockReturnValueOnce({
        features: { headless: true },
        remoteFeatures: { headless: true }
      })
      .mockReturnValueOnce({
        wcUri: undefined,
        wcFetchingUri: false
      })
      .mockReturnValueOnce({
        wallets: [{ id: 'wc-wallet-1' }],
        search: mockSearchWallets,
        page: 1,
        count: 100
      })
      .mockReturnValueOnce({
        initialized: true,
        connectingWallet: undefined
      })

    const mockSearchWalletItems = mockSearchWallets.map(w => ({
      ...mockWalletItem,
      id: w.id,
      name: w.name
    }))
    vi.spyOn(ConnectUtil, 'getInitialWallets').mockReturnValue([])
    vi.spyOn(ConnectUtil, 'getWalletConnectWallets').mockReturnValue(mockSearchWalletItems)

    const result = useAppKitWallets()

    expect(result.wcWallets).toEqual(mockSearchWalletItems)
  })

  it('should call both resetUri and setWcLinking when resetWcUri is called', () => {
    useSnapshot
      .mockReturnValueOnce({
        features: { headless: true },
        remoteFeatures: { headless: true }
      })
      .mockReturnValueOnce({
        wcUri: undefined,
        wcFetchingUri: false
      })
      .mockReturnValueOnce({
        wallets: [],
        search: [],
        page: 1,
        count: 0
      })
      .mockReturnValueOnce({
        initialized: true,
        connectingWallet: undefined
      })

    vi.spyOn(ConnectUtil, 'getInitialWallets').mockReturnValue([])
    vi.spyOn(ConnectUtil, 'getWalletConnectWallets').mockReturnValue([])

    const resetUriSpy = vi.spyOn(ConnectionController, 'resetUri')
    const setWcLinkingSpy = vi.spyOn(ConnectionController, 'setWcLinking')

    const result = useAppKitWallets()

    result.resetWcUri()

    expect(resetUriSpy).toHaveBeenCalled()
    expect(setWcLinkingSpy).toHaveBeenCalledWith(undefined)
  })
})
