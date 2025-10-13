import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { App } from 'vue'
import { createApp, nextTick } from 'vue'

import { ConstantsUtil } from '@reown/appkit-common'

import {
  type AuthConnector,
  ChainController,
  ConnectionController,
  ConnectorController,
  OptionsController,
  StorageUtil
} from '../../exports/index.js'
import { AssetUtil } from '../../exports/utils.js'
import {
  useAppKitAccount,
  useAppKitConnection,
  useAppKitConnections,
  useDisconnect
} from '../../exports/vue.js'
import { ConnectionControllerUtil } from '../../src/utils/ConnectionControllerUtil.js'
import {
  connectedAccountState,
  connectedWithEmbeddedWalletState,
  defaultAccountState
} from '../mocks/useAppKitAccount.js'

export function withSetup<T>(composable: () => T): [T, App] {
  let result: T
  const app = createApp({
    setup() {
      result = composable()
      return () => {}
    }
  })

  app.mount(document.createElement('div'))
  // @ts-expect-error ignore used before reassigned error
  return [result, app]
}

describe('useAppKitAccount', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('should have default state when initialized', () => {
    const [state] = withSetup(() => useAppKitAccount())

    expect(state.value).toEqual(defaultAccountState)
  })

  it('should return the correct account state when connected', async () => {
    const [state] = withSetup(() => useAppKitAccount())

    expect(state.value.address).toEqual(undefined)

    ChainController.state.activeChain = ConstantsUtil.CHAIN.EVM
    // @ts-expect-error ignore type error
    ChainController.state.chains = new Map([
      [
        ConstantsUtil.CHAIN.EVM,
        { accountState: { caipAddress: 'eip155:1:0x123...', status: 'connected' } }
      ]
    ])

    await nextTick()

    expect(state.value).toEqual(connectedAccountState)
  })

  it('should return the correct account state when disconnected', async () => {
    ChainController.state.activeChain = ConstantsUtil.CHAIN.EVM
    // @ts-expect-error ignore type error
    ChainController.state.chains = new Map([
      [
        ConstantsUtil.CHAIN.EVM,
        { accountState: { caipAddress: 'eip155:1:0x123...', status: 'connected' } }
      ]
    ])

    const [state] = withSetup(() => useAppKitAccount())

    expect(state.value.address).toEqual('0x123...')

    // @ts-expect-error ignore type error
    ChainController.state.chains = new Map([
      [
        ConstantsUtil.CHAIN.EVM,
        { accountState: { caipAddress: undefined, status: 'disconnected', address: undefined } }
      ]
    ])

    await nextTick()

    expect(state.value.address).toEqual(undefined)
  })

  it('should return correct embedded wallet info when connected with social provider', async () => {
    const [state] = withSetup(() => useAppKitAccount())

    ChainController.state.activeChain = ConstantsUtil.CHAIN.EVM
    // @ts-expect-error ignore type error
    ChainController.state.chains = new Map([
      [
        ConstantsUtil.CHAIN.EVM,
        {
          accountState: {
            caipAddress: 'eip155:1:0x123...',
            status: 'connected',
            user: {
              username: 'test',
              email: 'testuser@example.com'
            },
            preferredAccountType: 'smartAccount',
            smartAccountDeployed: true
          }
        }
      ]
    ])
    const authConnector = {
      id: ConstantsUtil.CONNECTOR_ID.AUTH,
      type: 'AUTH'
    } as AuthConnector
    ConnectorController.state.connectors = [authConnector]
    vi.spyOn(StorageUtil, 'getConnectedConnectorId').mockReturnValue('AUTH')

    await nextTick()

    expect(state.value).toEqual(connectedWithEmbeddedWalletState)
  })

  it('should return account state with namespace parameter', async () => {
    ChainController.state.activeChain = ConstantsUtil.CHAIN.EVM
    // @ts-expect-error ignore type error
    ChainController.state.chains = new Map([
      [
        ConstantsUtil.CHAIN.SOLANA,
        {
          accountState: {
            caipAddress: 'solana:mainnet:address',
            status: 'connected',
            address: 'address'
          }
        }
      ]
    ])
    const [state] = withSetup(() => useAppKitAccount({ namespace: ConstantsUtil.CHAIN.SOLANA }))

    await nextTick()

    expect(state.value).toEqual({
      allAccounts: [],
      address: 'address',
      caipAddress: 'solana:mainnet:address',
      isConnected: true,
      status: 'connected',
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
      chainNamespace: 'eip155'
    }
  } as any

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
    vi.restoreAllMocks()

    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      remoteFeatures: { multiWallet: true }
    })
  })

  it('should return formatted connections and storage connections', async () => {
    vi.spyOn(ConnectionControllerUtil, 'getConnectionsData').mockReturnValue({
      connections: [mockConnection],
      recentConnections: [mockConnection]
    })
    vi.spyOn(ConnectorController, 'getConnectorById').mockReturnValue(mockConnector)
    vi.spyOn(ConnectorController, 'getConnectorName').mockReturnValue('Test Connector')
    vi.spyOn(AssetUtil, 'getConnectorImage').mockReturnValue('connector-icon-url')
    vi.spyOn(AssetUtil, 'getNetworkImage').mockReturnValue('network-icon-url')

    const [state] = withSetup(() => useAppKitConnections())

    await nextTick()

    expect(state.value).toEqual({
      connections: [mockFormattedConnection],
      recentConnections: [mockFormattedConnection]
    })

    expect(ConnectionControllerUtil.getConnectionsData).toHaveBeenCalledWith('eip155')
    expect(ConnectorController.getConnectorById).toHaveBeenCalledWith('test-connector')
    expect(AssetUtil.getConnectorImage).toHaveBeenCalled()
    expect(AssetUtil.getNetworkImage).toHaveBeenCalledWith(mockConnection.caipNetwork)
  })

  it('should use provided namespace instead of active chain', async () => {
    vi.spyOn(ConnectionControllerUtil, 'getConnectionsData').mockReturnValue({
      connections: [],
      recentConnections: []
    })

    withSetup(() => useAppKitConnections(ConstantsUtil.CHAIN.SOLANA))

    await nextTick()

    expect(ConnectionControllerUtil.getConnectionsData).toHaveBeenCalledWith(
      ConstantsUtil.CHAIN.SOLANA
    )
  })

  it('should return empty state when no namespace is found', () => {
    vi.spyOn(ChainController.state, 'activeChain', 'get').mockReturnValue(undefined)

    const [state] = withSetup(() => useAppKitConnections())

    expect(state.value.connections).toEqual([])
    expect(state.value.recentConnections).toEqual([])
  })

  it('should handle empty connections', () => {
    ChainController.state.activeChain = ConstantsUtil.CHAIN.EVM
    vi.spyOn(ConnectionControllerUtil, 'getConnectionsData').mockReturnValue({
      connections: [],
      recentConnections: []
    })

    const [state] = withSetup(() => useAppKitConnections())

    expect(state.value.connections).toEqual([])
    expect(state.value.recentConnections).toEqual([])
  })

  it('should update when controller states change', async () => {
    const mockConnections = [mockConnection]

    ChainController.state.activeChain = ConstantsUtil.CHAIN.EVM
    vi.spyOn(ConnectionControllerUtil, 'getConnectionsData').mockReturnValue({
      connections: mockConnections,
      recentConnections: []
    })

    const [state] = withSetup(() => useAppKitConnections())

    await nextTick()

    expect(state.value.connections).toHaveLength(1)

    vi.spyOn(ConnectionControllerUtil, 'getConnectionsData').mockReturnValue({
      connections: [],
      recentConnections: []
    })

    await nextTick()
  })

  it('should return empty state when multiWallet is disabled', () => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      remoteFeatures: { multiWallet: false }
    })

    const [state] = withSetup(() => useAppKitConnections())

    expect(state.value.connections).toEqual([])
    expect(state.value.recentConnections).toEqual([])
  })
})

describe('useAppKitConnection', () => {
  const mockConnection = {
    connectorId: 'test-connector',
    accounts: [{ address: '0x123...', type: 'eoa' }],
    caipNetwork: {
      id: 1,
      name: 'Ethereum',
      caipNetworkId: 'eip155:1',
      chainNamespace: 'eip155'
    }
  } as any

  const mockOnSuccess = vi.fn()
  const mockOnError = vi.fn()

  beforeEach(() => {
    vi.restoreAllMocks()

    vi.spyOn(ConnectionController.state, 'connections', 'get').mockReturnValue(
      new Map([['eip155', [mockConnection]]])
    )
    vi.spyOn(ConnectionController.state, 'isSwitchingConnection', 'get').mockReturnValue(false)
    vi.spyOn(ConnectorController.state, 'activeConnectorIds', 'get').mockReturnValue({
      ...ConnectorController.state.activeConnectorIds,
      eip155: 'test-connector'
    })
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      remoteFeatures: { multiWallet: true }
    })
    vi.spyOn(ChainController.state, 'activeChain', 'get').mockReturnValue('eip155')
  })

  it('should return current connection and connection state', async () => {
    const mockConnections = new Map([[ConstantsUtil.CHAIN.EVM, [mockConnection]]])

    vi.spyOn(ChainController.state, 'activeChain', 'get').mockReturnValue('eip155')
    vi.spyOn(ConnectionController.state, 'connections', 'get').mockReturnValue(mockConnections)
    vi.spyOn(ConnectorController.state, 'activeConnectorIds', 'get').mockReturnValue({
      ...ConnectorController.state.activeConnectorIds,
      eip155: 'test-connector'
    })
    vi.spyOn(ConnectionController.state, 'isSwitchingConnection', 'get').mockReturnValue(false)

    const [state] = withSetup(() => useAppKitConnection({ namespace: 'eip155' }))

    await nextTick()

    expect(state.value.connection).toStrictEqual(mockConnection)
    expect(state.value.isPending).toBe(false)
    expect(typeof state.value.switchConnection).toBe('function')
    expect(typeof state.value.deleteConnection).toBe('function')
  })

  it('should handle switching connection successfully', async () => {
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

    const [state] = withSetup(() =>
      useAppKitConnection({
        namespace: 'eip155',
        onSuccess: mockOnSuccess,
        onError: mockOnError
      })
    )

    await nextTick()

    await state.value.switchConnection({
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
    const mockError = new Error('Connection failed')
    const setIsSwitchingConnectionSpy = vi.spyOn(ConnectionController, 'setIsSwitchingConnection')
    const switchConnectionSpy = vi
      .spyOn(ConnectionController, 'switchConnection')
      .mockRejectedValue(mockError)

    const [state] = withSetup(() =>
      useAppKitConnection({
        namespace: 'eip155',
        onSuccess: mockOnSuccess,
        onError: mockOnError
      })
    )

    await nextTick()

    await state.value.switchConnection({
      connection: mockConnection,
      address: '0x456...'
    })

    expect(setIsSwitchingConnectionSpy).toHaveBeenCalledWith(true)
    expect(switchConnectionSpy).toHaveBeenCalled()
    expect(mockOnError).toHaveBeenCalledWith(mockError)
    expect(setIsSwitchingConnectionSpy).toHaveBeenCalledWith(false)
  })

  it('should handle non-error exceptions in switchConnection', async () => {
    const setIsSwitchingConnectionSpy = vi.spyOn(ConnectionController, 'setIsSwitchingConnection')
    const switchConnectionSpy = vi
      .spyOn(ConnectionController, 'switchConnection')
      .mockRejectedValue('String error')

    const [state] = withSetup(() =>
      useAppKitConnection({
        namespace: 'eip155',
        onSuccess: mockOnSuccess,
        onError: mockOnError
      })
    )

    await nextTick()

    await state.value.switchConnection({
      connection: mockConnection,
      address: '0x456...'
    })

    expect(setIsSwitchingConnectionSpy).toHaveBeenCalledWith(true)
    expect(switchConnectionSpy).toHaveBeenCalled()
    expect(mockOnError).toHaveBeenCalledWith(new Error('Something went wrong'))
    expect(setIsSwitchingConnectionSpy).toHaveBeenCalledWith(false)
  })

  it('should handle deleting connection', async () => {
    const deleteAddressFromConnectionSpy = vi.spyOn(StorageUtil, 'deleteAddressFromConnection')

    const [state] = withSetup(() =>
      useAppKitConnection({
        namespace: 'eip155',
        onSuccess: mockOnSuccess,
        onError: mockOnError
      })
    )

    await nextTick()

    state.value.deleteConnection({
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

  it('should use provided namespace instead of active chain', async () => {
    const solanaConnection = { ...mockConnection, connectorId: 'solana-connector' }

    vi.spyOn(ConnectionController.state, 'connections', 'get').mockReturnValue(
      new Map([
        [ConstantsUtil.CHAIN.EVM, [mockConnection]],
        [ConstantsUtil.CHAIN.SOLANA, [solanaConnection]]
      ])
    )
    vi.spyOn(ConnectorController.state, 'activeConnectorIds', 'get').mockReturnValue({
      ...ConnectorController.state.activeConnectorIds,
      eip155: 'test-connector',
      solana: 'solana-connector'
    })

    const [state] = withSetup(() =>
      useAppKitConnection({
        namespace: 'solana',
        onSuccess: mockOnSuccess,
        onError: mockOnError
      })
    )

    await nextTick()

    expect(state.value.connection).toEqual(solanaConnection)
  })

  it('should return undefined connection when no namespace is found', () => {
    vi.spyOn(ChainController.state, 'activeChain', 'get').mockReturnValue(undefined)

    const [state] = withSetup(() =>
      useAppKitConnection({
        namespace: undefined,
        onSuccess: vi.fn(),
        onError: vi.fn()
      })
    )

    expect(state.value.connection).toBeUndefined()
    expect(state.value.isPending).toBe(false)
  })

  it('should return undefined connection when no matching connector found', () => {
    const mockConnections = new Map([[ConstantsUtil.CHAIN.EVM, [mockConnection]]])

    vi.spyOn(ChainController.state, 'activeChain', 'get').mockReturnValue('eip155')
    vi.spyOn(ConnectionController.state, 'connections', 'get').mockReturnValue(mockConnections)
    vi.spyOn(ConnectorController.state, 'activeConnectorIds', 'get').mockReturnValue({
      ...ConnectorController.state.activeConnectorIds,
      eip155: 'different-connector'
    })

    const [state] = withSetup(() => useAppKitConnection({ namespace: 'eip155' }))

    expect(state.value.connection).toBeUndefined()
  })

  it('should handle case-insensitive connector matching', () => {
    const upperCaseConnection = { ...mockConnection, connectorId: 'TEST-CONNECTOR' }
    const mockConnections = new Map([[ConstantsUtil.CHAIN.EVM, [upperCaseConnection]]])

    vi.spyOn(ChainController.state, 'activeChain', 'get').mockReturnValue('eip155')
    vi.spyOn(ConnectionController.state, 'connections', 'get').mockReturnValue(mockConnections)
    vi.spyOn(ConnectorController.state, 'activeConnectorIds', 'get').mockReturnValue({
      ...ConnectorController.state.activeConnectorIds,
      eip155: 'test-connector'
    })

    const [state] = withSetup(() => useAppKitConnection({ namespace: 'eip155' }))

    expect(state.value.connection).toStrictEqual(upperCaseConnection)
  })

  it('should return empty state when multiWallet is disabled', () => {
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      remoteFeatures: { multiWallet: false }
    })

    const [state] = withSetup(() => useAppKitConnection({ namespace: 'eip155' }))

    expect(state.value.connection).toBeUndefined()
    expect(state.value.isPending).toBe(false)
  })
})
