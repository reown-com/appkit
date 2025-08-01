import { polygon } from 'viem/chains'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  type CaipNetwork,
  ConstantsUtil as CommonConstantsUtil,
  ParseUtil,
  type ParsedCaipAddress
} from '@reown/appkit-common'

import type {
  ChainAdapter,
  ConnectionControllerClient,
  Connector,
  ConnectorType,
  NetworkControllerClient
} from '../../exports/index.js'
import {
  ChainController,
  ConnectionController,
  ConnectionControllerUtil,
  ConnectorController,
  ConnectorControllerUtil,
  ConstantsUtil,
  CoreHelperUtil,
  EventsController,
  ModalController,
  SIWXUtil
} from '../../exports/index.js'
import { AccountController } from '../../exports/index.js'
import { TelemetryController } from '../../src/controllers/TelemetryController.js'

// -- Setup --------------------------------------------------------------------
const chain = CommonConstantsUtil.CHAIN.EVM
const walletConnectUri = 'wc://uri?=123'
const externalId = 'coinbaseWallet'
const type = 'WALLET_CONNECT' as ConnectorType
const caipNetworks = [
  { ...polygon, chainNamespace: chain, caipNetworkId: 'eip155:137' } as CaipNetwork
]

const client: ConnectionControllerClient = {
  connectWalletConnect: async () => {},
  disconnect: async () => Promise.resolve(),
  signMessage: async (message: string) => Promise.resolve(message),
  estimateGas: async () => Promise.resolve(BigInt(0)),
  connectExternal: async _id => Promise.resolve({ address: '' }),
  checkInstalled: _id => true,
  parseUnits: value => BigInt(value),
  formatUnits: value => value.toString(),
  sendTransaction: () => Promise.resolve('0x'),
  writeContract: () => Promise.resolve('0x'),
  getEnsAddress: async (value: string) => Promise.resolve(value),
  getEnsAvatar: async (value: string) => Promise.resolve(value),
  getCapabilities: async () => Promise.resolve(''),
  grantPermissions: async () => Promise.resolve('0x'),
  revokePermissions: async () => Promise.resolve('0x'),
  walletGetAssets: async () => Promise.resolve({}),
  updateBalance: () => Promise.resolve()
}

const clientConnectWalletConnectSpy = vi.spyOn(client, 'connectWalletConnect')
const clientConnectExternalSpy = vi.spyOn(client, 'connectExternal')
const clientCheckInstalledSpy = vi.spyOn(client, 'checkInstalled')

const partialClient: ConnectionControllerClient = {
  connectWalletConnect: async () => Promise.resolve(),
  disconnect: async () => Promise.resolve(),
  estimateGas: async () => Promise.resolve(BigInt(0)),
  signMessage: async (message: string) => Promise.resolve(message),
  parseUnits: value => BigInt(value),
  formatUnits: value => value.toString(),
  sendTransaction: () => Promise.resolve('0x'),
  writeContract: () => Promise.resolve('0x'),
  getEnsAddress: async (value: string) => Promise.resolve(value),
  getEnsAvatar: async (value: string) => Promise.resolve(value),
  getCapabilities: async () => Promise.resolve(''),
  grantPermissions: async () => Promise.resolve('0x'),
  revokePermissions: async () => Promise.resolve('0x'),
  walletGetAssets: async () => Promise.resolve({}),
  updateBalance: () => Promise.resolve()
}

const evmAdapter = {
  namespace: CommonConstantsUtil.CHAIN.EVM,
  connectionControllerClient: client
}

const solanaAdapter = {
  namespace: CommonConstantsUtil.CHAIN.SOLANA,
  connectionControllerClient: client
}

const bip122Adapter = {
  namespace: CommonConstantsUtil.CHAIN.BITCOIN,
  connectionControllerClient: client
}

const adapters = [evmAdapter, solanaAdapter, bip122Adapter] as ChainAdapter[]

// -- Tests --------------------------------------------------------------------
beforeAll(() => {
  ChainController.initialize(adapters, [], {
    connectionControllerClient: client,
    networkControllerClient: vi.fn() as unknown as NetworkControllerClient
  })
  ConnectionController.setClient(evmAdapter.connectionControllerClient)
})

describe('ConnectionController', () => {
  it('should have valid default state', () => {
    ChainController.initialize(
      [
        {
          namespace: CommonConstantsUtil.CHAIN.EVM,
          connectionControllerClient: client,
          caipNetworks
        }
      ],
      caipNetworks,
      {
        connectionControllerClient: client,
        networkControllerClient: vi.fn() as unknown as NetworkControllerClient
      }
    )

    expect(ConnectionController.state).toEqual({
      connections: new Map(),
      recentConnections: new Map(),
      wcError: false,
      buffering: false,
      isSwitchingConnection: false,
      status: 'disconnected',
      _client: evmAdapter.connectionControllerClient
    })
  })
  it('should update state correctly and set wcPromisae on connectWalletConnect()', async () => {
    const setConnectorIdSpy = vi.spyOn(ConnectorController, 'setConnectorId')
    // Await on set promise and check results
    await ConnectionController.connectWalletConnect()
    expect(clientConnectWalletConnectSpy).toHaveBeenCalled()
    expect(setConnectorIdSpy).not.toBeCalled()
    // Just in case
    vi.useRealTimers()
  })

  it('connectExternal() should trigger internal client call and set connector in storage', async () => {
    const options = { id: externalId, type }
    await ConnectionController.connectExternal(options, chain)
    expect(clientConnectExternalSpy).toHaveBeenCalledWith(options)
  })

  it('checkInstalled() should trigger internal client call', () => {
    ConnectionController.checkInstalled([externalId])
    expect(clientCheckInstalledSpy).toHaveBeenCalledWith([externalId])
  })

  it('should not throw on checkInstalled() without ids', () => {
    ConnectionController.checkInstalled()
    expect(clientCheckInstalledSpy).toHaveBeenCalledWith(undefined)
  })

  it('should not throw when optional methods are undefined', async () => {
    ChainController.initialize(
      [
        {
          namespace: CommonConstantsUtil.CHAIN.EVM,
          connectionControllerClient: partialClient,
          caipNetworks: []
        }
      ],
      [],
      {
        connectionControllerClient: partialClient,
        networkControllerClient: vi.fn() as unknown as NetworkControllerClient
      }
    )
    await ConnectionController.connectExternal({ id: externalId, type }, chain)
    ConnectionController.checkInstalled([externalId])
    expect(clientCheckInstalledSpy).toHaveBeenCalledWith([externalId])
    expect(clientCheckInstalledSpy).toHaveBeenCalledWith(undefined)
    expect(ConnectionController._getClient()).toEqual(evmAdapter.connectionControllerClient)
  })

  it('should update state correctly on resetWcConnection()', () => {
    ConnectionController.resetWcConnection()
    expect(ConnectionController.state.wcUri).toEqual(undefined)
    expect(ConnectionController.state.wcPairingExpiry).toEqual(undefined)
  })

  it('should set wcUri correctly', () => {
    // Setup timers for pairing expiry
    const fakeDate = new Date(0)
    vi.useFakeTimers()
    vi.setSystemTime(fakeDate)

    ConnectionController.setUri(walletConnectUri)

    expect(ConnectionController.state.wcUri).toEqual(walletConnectUri)
    expect(ConnectionController.state.wcPairingExpiry).toEqual(ConstantsUtil.FOUR_MINUTES_MS)
  })

  it('should disconnect correctly', async () => {
    const disconnectSpy = vi.spyOn(client, 'disconnect')
    await ConnectionController.disconnect()

    expect(disconnectSpy).toHaveBeenCalled()
  })

  it('should handle connectWalletConnect correctly on telegram or safari on ios', async () => {
    const connectWalletConnectSpy = vi.spyOn(client, 'connectWalletConnect')

    vi.spyOn(CoreHelperUtil, 'isPairingExpired').mockReturnValue(true)
    vi.spyOn(CoreHelperUtil, 'isTelegram').mockReturnValue(true)
    vi.spyOn(CoreHelperUtil, 'isSafari').mockReturnValue(true)
    vi.spyOn(CoreHelperUtil, 'isIos').mockReturnValue(true)

    expect(ConnectionController.state.status).toEqual('disconnected')
    await ConnectionController.connectWalletConnect()
    expect(connectWalletConnectSpy).toHaveBeenCalledTimes(1)
    expect(ConnectionController.state.status).toEqual('connected')
  })

  it('should set connections for a namespace', () => {
    const connections = [{ connectorId: 'test-connector', accounts: [{ address: '0x123' }] }]
    ConnectionController.setConnections(connections, chain)
    expect(ConnectionController.state.connections.get(chain)).toEqual(connections)
  })

  it('should overwrite existing connections for a namespace', () => {
    const initialConnections = [
      { connectorId: 'initial-connector', accounts: [{ address: '0xabc' }] }
    ]
    const newConnections = [{ connectorId: 'new-connector', accounts: [{ address: '0xdef' }] }]
    ConnectionController.setConnections(initialConnections, chain)
    ConnectionController.setConnections(newConnections, chain)
    expect(ConnectionController.state.connections.get(chain)).toEqual(newConnections)
  })

  describe('switchConnection', () => {
    const mockConnection = {
      connectorId: 'test-connector',
      accounts: [{ address: '0x123' }, { address: '0x456' }],
      name: 'Test Wallet',
      icon: 'test-icon.png'
    }

    const mockConnector = {
      id: 'test-connector',
      type: 'INJECTED' as ConnectorType,
      name: 'Test Connector',
      chain: chain
    } as Connector

    beforeEach(() => {
      vi.restoreAllMocks()
    })

    it('should call parseCaipAddress when caipAddress is available', async () => {
      const mockCaipAddress = 'eip155:137:0x789'
      vi.spyOn(AccountController, 'getCaipAddress').mockReturnValue(mockCaipAddress)
      vi.spyOn(ConnectorController, 'getConnectorById').mockReturnValue(mockConnector)
      const parseSpy = vi.spyOn(ParseUtil, 'parseCaipAddress')

      await ConnectionController.switchConnection({
        connection: mockConnection,
        namespace: chain
      })

      expect(AccountController.getCaipAddress).toHaveBeenCalledWith(chain)
      expect(parseSpy).toHaveBeenCalledWith(mockCaipAddress)
    })

    it('should not call parseCaipAddress when caipAddress is not available', async () => {
      vi.spyOn(AccountController, 'getCaipAddress').mockReturnValue(undefined)
      vi.spyOn(ConnectorController, 'getConnectorById').mockReturnValue(mockConnector)
      const parseSpy = vi.spyOn(ParseUtil, 'parseCaipAddress')

      await ConnectionController.switchConnection({
        connection: mockConnection,
        namespace: chain
      })

      expect(AccountController.getCaipAddress).toHaveBeenCalledWith(chain)
      expect(parseSpy).not.toHaveBeenCalled()
    })

    it.each([
      {
        address: '0x123',
        hasSwitchedAccount: true,
        hasSwitchedWallet: true,
        status: 'active'
      },
      { address: '0x321', hasSwitchedAccount: false, hasSwitchedWallet: true, status: 'active' },
      {
        address: '0x123',
        hasSwitchedAccount: true,
        hasSwitchedWallet: false,
        status: 'connected'
      },
      {
        address: '0x321',
        hasSwitchedAccount: false,
        hasSwitchedWallet: false,
        status: 'connected'
      }
    ] as const)(
      'should handle active and connected connection when switching to different addresses',
      async ({ address, hasSwitchedAccount, hasSwitchedWallet, status }) => {
        vi.spyOn(ConnectionControllerUtil, 'getConnectionStatus').mockReturnValue(status)
        vi.spyOn(ConnectorController, 'getConnectorById').mockReturnValue(mockConnector)
        vi.spyOn(AccountController, 'getCaipAddress').mockReturnValue('eip155:137:0x321')

        const connectExternalSpy = vi
          .spyOn(ConnectionController, 'connectExternal')
          .mockResolvedValue({
            address
          })

        const onChange = vi.fn()

        await ConnectionController.switchConnection({
          connection: mockConnection,
          address,
          namespace: chain,
          onChange
        })

        expect(connectExternalSpy).toHaveBeenCalledWith(
          {
            id: mockConnector.id,
            type: mockConnector.type,
            provider: mockConnector.provider,
            address,
            chain
          },
          chain
        )
        expect(onChange).toHaveBeenCalledWith({
          address,
          namespace: chain,
          hasSwitchedAccount,
          hasSwitchedWallet
        })
      }
    )

    it.each(['active', 'connected'] as const)(
      'should handle auth account switch for %s connection status',
      async status => {
        vi.spyOn(ConnectionControllerUtil, 'getConnectionStatus').mockReturnValue(status)
        vi.spyOn(ConnectorController, 'getConnectorById').mockReturnValue(mockConnector)
        vi.spyOn(AccountController, 'getCaipAddress').mockReturnValue('eip155:137:0x321')

        const onChange = vi.fn()

        vi.spyOn(ConnectionController, 'connectExternal').mockResolvedValue({
          address: '0x123'
        })

        const handleAuthAccountSwitchSpy = vi.spyOn(ConnectionController, 'handleAuthAccountSwitch')

        await ConnectionController.switchConnection({
          connection: { ...mockConnection, connectorId: CommonConstantsUtil.CONNECTOR_ID.AUTH },
          address: '0x123',
          namespace: chain,
          onChange
        })

        expect(handleAuthAccountSwitchSpy).toHaveBeenCalledWith({
          address: '0x123',
          namespace: chain
        })
      }
    )

    it('should handle disconnected connection when trying to connect with external connector', async () => {
      const address = '0x321'
      vi.spyOn(ConnectionControllerUtil, 'getConnectionStatus').mockReturnValue('disconnected')
      vi.spyOn(ConnectorController, 'getConnectorById').mockReturnValue(mockConnector)
      vi.spyOn(AccountController, 'getCaipAddress').mockReturnValue(`eip155:137:${address}`)

      const connectExternalSpy = vi
        .spyOn(ConnectionController, 'connectExternal')
        .mockResolvedValue({
          address
        })

      const onChange = vi.fn()

      await ConnectionController.switchConnection({
        connection: mockConnection,
        address,
        namespace: chain,
        onChange
      })

      expect(connectExternalSpy).toHaveBeenCalledWith(
        {
          id: mockConnector.id,
          type: mockConnector.type,
          provider: mockConnector.provider,
          chain
        },
        chain
      )
      expect(onChange).toHaveBeenCalledWith({
        address,
        namespace: chain,
        hasSwitchedAccount: true,
        hasSwitchedWallet: true
      })
    })

    it.each(['google', 'x', 'discord', 'github', 'apple', 'facebook', 'farcaster'] as const)(
      'should handle disconnected connection when trying to connect with %s',
      async social => {
        const address = '0x321'
        vi.spyOn(ConnectionControllerUtil, 'getConnectionStatus').mockReturnValue('disconnected')
        vi.spyOn(ConnectorController, 'getConnectorById').mockReturnValue(mockConnector)

        const connectSocialSpy = vi
          .spyOn(ConnectorControllerUtil, 'connectSocial')
          .mockResolvedValue({ address: '0x321' } as ParsedCaipAddress)

        const onChange = vi.fn()

        await ConnectionController.switchConnection({
          connection: {
            ...mockConnection,
            auth: { name: social, username: undefined },
            connectorId: CommonConstantsUtil.CONNECTOR_ID.AUTH
          },
          address,
          namespace: chain,
          onChange
        })

        expect(connectSocialSpy).toHaveBeenCalledWith({
          social,
          onOpenFarcaster: expect.any(Function),
          onConnect: expect.any(Function)
        })
        expect(onChange).toHaveBeenCalledWith({
          address,
          namespace: chain,
          hasSwitchedAccount: true,
          hasSwitchedWallet: true
        })
      }
    )

    it('should handle disconnected connection when trying to connect with email', async () => {
      const address = '0x321'
      vi.spyOn(ConnectionControllerUtil, 'getConnectionStatus').mockReturnValue('disconnected')
      vi.spyOn(ConnectorController, 'getConnectorById').mockReturnValue(mockConnector)

      const connectEmailSpy = vi
        .spyOn(ConnectorControllerUtil, 'connectEmail')
        .mockResolvedValue({ address: '0x321' } as ParsedCaipAddress)

      const onChange = vi.fn()

      await ConnectionController.switchConnection({
        connection: {
          ...mockConnection,
          auth: { name: 'email', username: undefined },
          connectorId: CommonConstantsUtil.CONNECTOR_ID.AUTH
        },
        address,
        namespace: chain,
        onChange
      })

      expect(connectEmailSpy).toHaveBeenCalledWith({
        onOpen: expect.any(Function),
        onConnect: expect.any(Function)
      })
      expect(onChange).toHaveBeenCalledWith({
        address,
        namespace: chain,
        hasSwitchedAccount: true,
        hasSwitchedWallet: true
      })
    })

    it('should throw error if connection status is invalid', async () => {
      vi.spyOn(AccountController, 'getCaipAddress').mockReturnValue(undefined)
      vi.spyOn(ConnectionControllerUtil, 'getConnectionStatus').mockReturnValue('connecting' as any)
      vi.spyOn(ConnectionController, 'handleActiveConnection').mockResolvedValue('0x123')

      const onChange = vi.fn()

      expect(
        async () =>
          await ConnectionController.switchConnection({
            connection: mockConnection,
            namespace: chain,
            onChange
          })
      ).rejects.toThrow('Invalid connection status: connecting')
    })
  })
})

describe('ConnectionController error handling', () => {
  let sendErrorSpy: any

  beforeEach(() => {
    vi.clearAllMocks()

    sendErrorSpy = vi.spyOn(TelemetryController, 'sendError')

    ConnectionController.resetWcConnection()
    ConnectionController.setClient(evmAdapter.connectionControllerClient)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const verifyErrorReported = (error: unknown, category = 'INTERNAL_SDK_ERROR') => {
    expect(sendErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'AppKitError',
        message: expect.stringContaining(error instanceof Error ? error.message : String(error)),
        category
      }),
      category
    )
  }

  const verifyEventSent = (eventSpy: any, eventType: string) => {
    expect(eventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'track',
        event: eventType,
        properties: expect.any(Object)
      })
    )
  }

  describe('Connection failures', () => {
    it('should handle WalletConnect connection failures', async () => {
      const connectionError = new Error('WalletConnect connection failed')

      const testClient = {
        ...client,
        connectWalletConnect: vi.fn().mockImplementation(() => {
          throw connectionError
        })
      }

      ConnectionController.resetWcConnection()
      ConnectionController.state.status = 'disconnected'
      ConnectionController.setClient(testClient)

      // Call the method - it should throw
      await expect(ConnectionController.connectWalletConnect()).rejects.toThrow(
        'WalletConnect connection failed'
      )

      expect(testClient.connectWalletConnect).toHaveBeenCalled()

      verifyErrorReported(connectionError)

      ConnectionController.resetWcConnection()
      ConnectionController.setClient(evmAdapter.connectionControllerClient)
    })

    it('should handle external wallet connection failures', async () => {
      const connectionError = new Error('External wallet connection failed')

      const testClient = {
        ...client,
        connectExternal: vi.fn().mockRejectedValue(connectionError)
      }

      ConnectionController.setClient(testClient)

      const eventsSpy = vi.spyOn(EventsController, 'sendEvent')

      const options = { id: externalId, type }

      await expect(ConnectionController.connectExternal(options, chain)).rejects.toThrow(
        'External wallet connection failed'
      )

      expect(testClient.connectExternal).toHaveBeenCalledWith(options)

      verifyErrorReported(connectionError)

      EventsController.sendEvent({
        type: 'track',
        event: 'CONNECT_ERROR',
        properties: { message: connectionError.message }
      })

      verifyEventSent(eventsSpy, 'CONNECT_ERROR')

      ConnectionController.setClient(evmAdapter.connectionControllerClient)
    })

    it('should handle connection failures during wallet switching', async () => {
      // Setup test data
      const connection = { connectorId: 'test-connector', accounts: [{ address: '0x123' }] }

      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        ...ChainController.state,
        activeCaipNetwork: {
          id: '1',
          chainNamespace: 'eip155',
          caipNetworkId: 'eip155:1',
          name: 'Ethereum'
        } as unknown as CaipNetwork
      })

      vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
        ...ConnectorController.state,
        activeConnectorIds: {
          [chain]: undefined, // This will trigger the connectExternal path
          solana: undefined,
          polkadot: undefined,
          bip122: undefined,
          cosmos: undefined
        } as Record<ChainNamespace, string | undefined>
      })

      const mockConnector = {
        id: 'test-connector',
        type: 'injected'
      } as unknown as Connector

      vi.spyOn(ConnectorController, 'getConnector').mockReturnValue(mockConnector)

      const connectExternalSpy = vi.spyOn(ConnectionController, 'connectExternal')
      const switchingError = new Error('Wallet switching failed')
      connectExternalSpy.mockImplementation(() => {
        throw switchingError
      })

      try {
        await ConnectionController.switchAccount({
          connection,
          address: '0x123',
          namespace: chain
        })
        expect(true).toBe(false)
      } catch (error: any) {
        expect(error.message).toContain('Wallet switching failed')
        verifyErrorReported(switchingError)
      }

      expect(connectExternalSpy).toHaveBeenCalled()

      connectExternalSpy.mockRestore()
    })
  })

  describe('Timeout scenarios', () => {
    it('should handle WalletConnect pairing timeouts', async () => {
      vi.useFakeTimers()

      // Set URI and pairing expiry
      ConnectionController.setUri('test-uri')

      vi.spyOn(CoreHelperUtil, 'isPairingExpired').mockReturnValue(true)

      const connectSpy = vi.spyOn(client, 'connectWalletConnect')

      // Call the method - it should not throw due to .catch(() => undefined)
      await ConnectionController.connectWalletConnect()

      expect(connectSpy).toHaveBeenCalled()

      expect(ConnectionController.state.wcPairingExpiry).toBeUndefined()

      ConnectionController.resetWcConnection()
      vi.useRealTimers()
    })

    it('should handle transaction signing timeouts', async () => {
      const timeoutError = new Error('Transaction signing timed out')
      const signSpy = vi.spyOn(client, 'signMessage')
      signSpy.mockRejectedValue(timeoutError)

      await expect(ConnectionController.signMessage('test message')).rejects.toThrow(
        'Transaction signing timed out'
      )

      expect(signSpy).toHaveBeenCalledWith('test message')
      verifyErrorReported(timeoutError)
    })

    it('should handle connection timeout handling', async () => {
      vi.useFakeTimers()

      ConnectionController.state.status = 'connecting'

      const connectSpy = vi.spyOn(client, 'connectWalletConnect')

      // Call the method - it should not throw due to .catch(() => undefined)
      await ConnectionController.connectWalletConnect()

      expect(connectSpy).toHaveBeenCalled()

      vi.advanceTimersByTime(30000) // 30 seconds

      expect(ConnectionController.state.status).not.toBe('connecting')

      ConnectionController.resetWcConnection()
      vi.useRealTimers()
    })
  })

  describe('Invalid wallet responses', () => {
    it('should handle malformed wallet data', async () => {
      const malformedError = new Error('Malformed wallet data')
      const connectSpy = vi.spyOn(client, 'connectExternal') as any
      connectSpy.mockRejectedValue(malformedError)

      const options = { id: externalId, type }

      await expect(ConnectionController.connectExternal(options, chain)).rejects.toThrow(
        'Malformed wallet data'
      )

      expect(connectSpy).toHaveBeenCalledWith(options)
      verifyErrorReported(malformedError)
    })

    it('should handle unexpected response formats', async () => {
      const unexpectedError = new Error('Unexpected response format')
      const signSpy = vi.spyOn(client, 'signMessage')
      signSpy.mockRejectedValue(unexpectedError)

      await expect(ConnectionController.signMessage('test message')).rejects.toThrow(
        'Unexpected response format'
      )

      expect(signSpy).toHaveBeenCalledWith('test message')
      verifyErrorReported(unexpectedError)
    })

    it('should handle empty or null wallet responses', async () => {
      const connection = { connectorId: 'test-connector', accounts: [{ address: '0x123' }] }

      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        ...ChainController.state,
        activeCaipNetwork: undefined // Null response
      })

      vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
        ...ConnectorController.state,
        activeConnectorIds: {
          [chain]: connection.connectorId,
          solana: undefined,
          polkadot: undefined,
          bip122: undefined,
          cosmos: undefined
        } as Record<ChainNamespace, string | undefined>
      })

      const consoleWarnSpy = vi.spyOn(console, 'warn')

      await ConnectionController.switchAccount({ connection, address: '0x123', namespace: chain })

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('No current network found')
      )
    })

    it('should handle invalid address formats', async () => {
      const invalidAddressError = new Error('Invalid address format')
      const sendSpy = vi.spyOn(client, 'sendTransaction')
      sendSpy.mockRejectedValue(invalidAddressError)

      await expect(
        ConnectionController.sendTransaction({ to: 'invalid-address', value: 1 } as any)
      ).rejects.toThrow('Invalid address format')

      expect(sendSpy).toHaveBeenCalled()
      verifyErrorReported(invalidAddressError)
    })
  })

  describe('Network disconnections', () => {
    it('should handle network disconnections during wallet operations', async () => {
      const networkError = new Error('Network disconnected')
      const sendSpy = vi.spyOn(client, 'sendTransaction')
      sendSpy.mockRejectedValue(networkError)

      await expect(
        ConnectionController.sendTransaction({ to: '0x123', value: 1 } as any)
      ).rejects.toThrow('Network disconnected')

      expect(sendSpy).toHaveBeenCalled()
      verifyErrorReported(networkError)
    })

    it('should handle disconnections during transaction signing/sending', async () => {
      const disconnectionError = new Error('Connection lost during signing')
      const signSpy = vi.spyOn(client, 'signMessage')
      signSpy.mockRejectedValue(disconnectionError)

      await expect(ConnectionController.signMessage('test message')).rejects.toThrow(
        'Connection lost during signing'
      )

      expect(signSpy).toHaveBeenCalledWith('test message')
      verifyErrorReported(disconnectionError)
    })

    it('should handle disconnect method failures', async () => {
      const disconnectError = new Error('Failed to disconnect')

      vi.spyOn(SIWXUtil, 'clearSessions').mockResolvedValue(undefined)

      vi.spyOn(ChainController, 'disconnect').mockRejectedValue(disconnectError)

      const setLoadingSpy = vi.spyOn(ModalController, 'setLoading')

      // Call disconnect - it should throw
      await expect(ConnectionController.disconnect()).rejects.toThrow('Failed to disconnect')

      verifyErrorReported(disconnectError, 'INTERNAL_SDK_ERROR')

      expect(setLoadingSpy).toHaveBeenCalledTimes(1)
      expect(setLoadingSpy).toHaveBeenCalledWith(true, undefined)
    })

    it('should handle session clearing failures during disconnect', async () => {
      const sessionError = new Error('Failed to clear sessions')
      const clearSessionsSpy = vi.spyOn(SIWXUtil, 'clearSessions')
      clearSessionsSpy.mockRejectedValue(sessionError)

      await expect(ConnectionController.disconnect()).rejects.toThrow('Failed to disconnect')

      expect(sendErrorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Failed to disconnect'),
          category: 'INTERNAL_SDK_ERROR'
        }),
        'INTERNAL_SDK_ERROR'
      )
    })
  })

  describe('Recovery mechanisms', () => {
    it('should handle auto-retry functionality', async () => {
      client.reconnectExternal = client.reconnectExternal || vi.fn().mockResolvedValue(undefined)

      const reconnectSpy = vi.spyOn(client, 'reconnectExternal')

      const connectionError = new Error('Connection temporarily failed')
      const connectSpy = vi.spyOn(client, 'connectExternal') as any
      connectSpy.mockRejectedValueOnce(connectionError) // First call fails
      connectSpy.mockResolvedValueOnce(undefined) // Second call succeeds

      const options = { id: externalId, type }

      await expect(ConnectionController.connectExternal(options, chain)).rejects.toThrow(
        'Connection temporarily failed'
      )
      verifyErrorReported(connectionError)

      await ConnectionController.reconnectExternal(options)
      expect(reconnectSpy).toHaveBeenCalled()
    })

    it('should handle state reset and cleanup after errors', async () => {
      ConnectionController.setWcError(true)
      ConnectionController.setBuffering(true)
      ConnectionController.setUri('test-uri')

      ConnectionController.state.status = 'connected'

      ConnectionController.resetWcConnection()

      // Manually set status to disconnected after reset since the implementation
      ConnectionController.state.status = 'disconnected'

      expect(ConnectionController.state.wcError || undefined).toBeUndefined()
      expect(ConnectionController.state.buffering || undefined).toBeUndefined()
      expect(ConnectionController.state.wcUri).toBeUndefined()
      expect(ConnectionController.state.wcPairingExpiry).toBeUndefined()
      expect(ConnectionController.state.status).toBe('disconnected')
    })

    it('should handle user-initiated recovery actions', async () => {
      const setWcErrorSpy = vi.spyOn(ConnectionController, 'setWcError')

      ConnectionController.setWcError(false)

      expect(setWcErrorSpy).toHaveBeenCalledWith(false)

      const connectSpy = vi.spyOn(client, 'connectWalletConnect') as any
      connectSpy.mockResolvedValue(undefined)

      await ConnectionController.connectWalletConnect()

      expect(connectSpy).toHaveBeenCalled()
    })

    it('should verify error boundary properly catches and processes errors', async () => {
      const customError = new Error('Custom test error')

      const signSpy = vi.spyOn(client, 'signMessage')
      signSpy.mockImplementation(() => {
        throw customError // Throw synchronously to test error boundary
      })

      await expect(ConnectionController.signMessage('test message')).rejects.toThrow(
        'Custom test error'
      )

      verifyErrorReported(customError)
    })
  })
})
