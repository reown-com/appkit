import { polygon } from 'viem/chains'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  type CaipNetwork,
  ConstantsUtil as CommonConstantsUtil,
  ParseUtil,
  type ParsedCaipAddress
} from '@reown/appkit-common'

import type { AccountState, AdapterBlueprint } from '../../exports/index.js'
import type {
  Connector,
  ConnectorType,
  ModalControllerState,
  RouterControllerState
} from '../../exports/index.js'
import {
  AdapterController,
  ChainController,
  ConnectionController,
  ConnectionControllerUtil,
  ConnectorController,
  ConnectorControllerUtil,
  ConstantsUtil,
  CoreHelperUtil,
  EventsController,
  ModalController,
  RouterController
} from '../../exports/index.js'

// -- Setup --------------------------------------------------------------------
const chain = CommonConstantsUtil.CHAIN.EVM
const walletConnectUri = 'wc://uri?=123'
const externalId = 'coinbaseWallet'
const type = 'WALLET_CONNECT' as ConnectorType
const caipNetworks = [
  { ...polygon, chainNamespace: chain, caipNetworkId: 'eip155:137' },
  {
    chainNamespace: 'solana' as const,
    caipNetworkId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
    id: '1'
  },
  { chainNamespace: 'bip122' as const, caipNetworkId: 'bip122:1', id: '1' }
] as CaipNetwork[]

const baseAdapter = {
  connectWalletConnect: vi.fn(),
  disconnect: vi.fn(),
  connect: vi.fn()
} as unknown as AdapterBlueprint

const evmAdapter = {
  ...baseAdapter,
  namespace: CommonConstantsUtil.CHAIN.EVM
} as unknown as AdapterBlueprint

const solanaAdapter = {
  ...baseAdapter,
  namespace: CommonConstantsUtil.CHAIN.SOLANA
} as unknown as AdapterBlueprint

const bip122Adapter = {
  ...baseAdapter,
  namespace: CommonConstantsUtil.CHAIN.BITCOIN
} as unknown as AdapterBlueprint

const adapters = [evmAdapter, solanaAdapter, bip122Adapter] as AdapterBlueprint[]

// -- Tests --------------------------------------------------------------------
beforeAll(() => {
  ChainController.initialize(adapters, [])
  AdapterController.initialize(adapters)
})

describe('ConnectionController', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })
  it('should have valid default state', () => {
    ChainController.initialize(
      [
        {
          namespace: CommonConstantsUtil.CHAIN.EVM,
          caipNetworks
        }
      ],
      caipNetworks
    )

    expect(ConnectionController.state).toEqual({
      connections: new Map(),
      recentConnections: new Map(),
      wcError: false,
      buffering: false,
      isSwitchingConnection: false,
      status: 'disconnected'
    })
  })
  it('should update state correctly and set wcPromisae on connectWalletConnect()', async () => {
    const setConnectorIdSpy = vi.spyOn(ConnectorController, 'setConnectorId')
    // Await on set promise and check results
    await ConnectionController.connectWalletConnect()
    expect(evmAdapter.connectWalletConnect).toHaveBeenCalled()
    expect(setConnectorIdSpy).not.toBeCalled()
    // Just in case
    vi.useRealTimers()
  })

  it('connectExternal() should trigger adapter call and set connector in storage', async () => {
    const options = { id: externalId, type }
    await ConnectionController.connectExternal(options, chain)
    expect(evmAdapter.connect).toHaveBeenCalledWith(
      expect.objectContaining({
        id: externalId,
        type,
        chainId: polygon.id
      })
    )
  })

  it('should not throw when optional methods are undefined', async () => {
    ChainController.initialize(
      [
        {
          namespace: CommonConstantsUtil.CHAIN.EVM,
          caipNetworks: []
        }
      ],
      []
    )
    await ConnectionController.connectExternal({ id: externalId, type }, chain)
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
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      chains: new Map([
        [chain, { accountState: { caipAddress: 'eip155:137:0x123' } as unknown as AccountState }],
        [
          CommonConstantsUtil.CHAIN.SOLANA,
          {
            accountState: {
              caipAddress: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:0x123'
            } as unknown as AccountState
          }
        ],
        [
          CommonConstantsUtil.CHAIN.BITCOIN,
          { accountState: { caipAddress: 'bip122:1:0x123' } as unknown as AccountState }
        ]
      ]),
      activeChain: chain,
      activeCaipAddress: 'eip155:137:0x123',
      noAdapters: false,
      isSwitchingNamespace: false
    })
    vi.spyOn(ConnectionController.state, 'connections', 'get').mockReturnValue(
      new Map([
        [chain, [{ connectorId: 'eip155-connector', accounts: [{ address: '0x123' }] }]],
        [
          CommonConstantsUtil.CHAIN.SOLANA,
          [{ connectorId: 'solana-connector', accounts: [{ address: '0x123' }] }]
        ],
        [
          CommonConstantsUtil.CHAIN.BITCOIN,
          [{ connectorId: 'bip122-connector', accounts: [{ address: '0x123' }] }]
        ]
      ])
    )
    const disconnectEvmSpy = vi.spyOn(evmAdapter, 'disconnect')
    const disconnectSolanaSpy = vi.spyOn(solanaAdapter, 'disconnect')
    const disconnectBitcoinSpy = vi.spyOn(bip122Adapter, 'disconnect')
    await ConnectionController.disconnect()

    expect(disconnectEvmSpy).toHaveBeenCalled()
    expect(disconnectSolanaSpy).toHaveBeenCalled()
    expect(disconnectBitcoinSpy).toHaveBeenCalled()
  })

  it('should handle connectWalletConnect correctly on telegram or safari on ios', async () => {
    const connectWalletConnectSpy = vi.spyOn(evmAdapter, 'connectWalletConnect')

    vi.spyOn(CoreHelperUtil, 'isPairingExpired').mockReturnValue(true)
    vi.spyOn(CoreHelperUtil, 'isTelegram').mockReturnValue(true)
    vi.spyOn(CoreHelperUtil, 'isSafari').mockReturnValue(true)
    vi.spyOn(CoreHelperUtil, 'isIos').mockReturnValue(true)

    expect(ConnectionController.state.status).toEqual('disconnected')
    await ConnectionController.connectWalletConnect()
    expect(connectWalletConnectSpy).toHaveBeenCalledTimes(1)
    expect(ConnectionController.state.status).toEqual('connected')
  })

  it('should handle connectWalletConnect when cache argument is "never"', async () => {
    vi.spyOn(CoreHelperUtil, 'isTelegram').mockReturnValue(true)
    vi.spyOn(CoreHelperUtil, 'isSafari').mockReturnValue(true)
    vi.spyOn(CoreHelperUtil, 'isIos').mockReturnValue(true)

    const connectWalletConnectSpy = vi.spyOn(evmAdapter, 'connectWalletConnect')

    await ConnectionController.connectWalletConnect()

    expect(connectWalletConnectSpy).toHaveBeenCalledTimes(1)
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
      vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
        caipAddress: mockCaipAddress
      } as unknown as AccountState)
      vi.spyOn(ConnectorController, 'getConnectorById').mockReturnValue(mockConnector)
      const parseSpy = vi.spyOn(ParseUtil, 'parseCaipAddress')

      await ConnectionController.switchConnection({
        connection: mockConnection,
        namespace: chain
      })

      expect(ChainController.getAccountData).toHaveBeenCalledWith(chain)
      expect(parseSpy).toHaveBeenCalledWith(mockCaipAddress)
    })

    it('should not call parseCaipAddress when caipAddress is not available', async () => {
      vi.spyOn(ChainController, 'getAccountData').mockReturnValue(undefined)
      vi.spyOn(ConnectorController, 'getConnectorById').mockReturnValue(mockConnector)
      const parseSpy = vi.spyOn(ParseUtil, 'parseCaipAddress')

      await ConnectionController.switchConnection({
        connection: mockConnection,
        namespace: chain
      })

      expect(ChainController.getAccountData).toHaveBeenCalledWith(chain)
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
        vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
          caipAddress: 'eip155:137:0x321'
        } as unknown as AccountState)

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
        vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
          caipAddress: 'eip155:137:0x321'
        } as unknown as AccountState)

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
      vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
        caipAddress: `eip155:137:${address}`
      } as unknown as AccountState)

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

    it('should handle connected connection when trying to connect with walletconnect if modal open', async () => {
      const address = '0x321'
      vi.spyOn(ConnectionControllerUtil, 'getConnectionStatus').mockReturnValue('disconnected')
      vi.spyOn(ConnectorController, 'getConnectorById').mockReturnValue(mockConnector)
      vi.spyOn(ModalController, 'state', 'get').mockReturnValue({
        open: true
      } as ModalControllerState)
      vi.spyOn(RouterController, 'push')

      const connectWalletConnectSpy = vi
        .spyOn(ConnectorControllerUtil, 'connectWalletConnect')
        .mockImplementation(({ onOpen }) => {
          onOpen?.(false)
          return Promise.resolve({ address: '0x321' } as ParsedCaipAddress)
        })

      const onChange = vi.fn()

      await ConnectionController.switchConnection({
        connection: {
          ...mockConnection,
          connectorId: CommonConstantsUtil.CONNECTOR_ID.WALLET_CONNECT
        },
        address,
        namespace: chain,
        onChange
      })

      expect(connectWalletConnectSpy).toHaveBeenCalledWith({
        walletConnect: true,
        onOpen: expect.any(Function),
        onConnect: expect.any(Function),
        connector: mockConnector,
        closeModalOnConnect: undefined
      })

      expect(RouterController.push).toHaveBeenCalledWith('ConnectingWalletConnect')
    })

    it('should handle connected connection when trying to connect with walletconnect if modal closed', async () => {
      const address = '0x321'
      vi.spyOn(ConnectionControllerUtil, 'getConnectionStatus').mockReturnValue('disconnected')
      vi.spyOn(ConnectorController, 'getConnectorById').mockReturnValue(mockConnector)
      vi.spyOn(ModalController, 'state', 'get').mockReturnValue({
        open: false
      } as ModalControllerState)
      vi.spyOn(ModalController, 'open')

      const connectWalletConnectSpy = vi
        .spyOn(ConnectorControllerUtil, 'connectWalletConnect')
        .mockImplementation(({ onOpen }) => {
          onOpen?.(false)
          return Promise.resolve({ address: '0x321' } as ParsedCaipAddress)
        })

      const onChange = vi.fn()

      await ConnectionController.switchConnection({
        connection: {
          ...mockConnection,
          connectorId: CommonConstantsUtil.CONNECTOR_ID.WALLET_CONNECT
        },
        address,
        namespace: chain,
        onChange
      })

      expect(connectWalletConnectSpy).toHaveBeenCalledWith({
        walletConnect: true,
        onOpen: expect.any(Function),
        onConnect: expect.any(Function),
        connector: mockConnector,
        closeModalOnConnect: undefined
      })

      expect(ModalController.open).toHaveBeenCalledWith({
        view: 'ConnectingWalletConnect'
      })
    })

    it('should throw error if connection status is invalid', async () => {
      vi.spyOn(ChainController, 'getAccountData').mockReturnValue(undefined)
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

describe('finalizeWcConnection', () => {
  it('should include event properties when address is provided', () => {
    const sendEventSpy = vi.spyOn(EventsController, 'sendEvent').mockImplementation(() => {})

    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      view: 'TestView' as unknown as RouterControllerState['view'],
      data: { wallet: { name: 'TestWallet', id: 'test' } }
    })

    vi.spyOn(ConnectionController, 'state', 'get').mockReturnValue({
      ...ConnectionController.state,
      wcLinking: { href: 'wc://deeplink', name: 'TestWallet' },
      recentWallet: { id: 'test', order: 5, name: 'TestWallet' }
    })

    const address = '0xabc'

    ConnectionController.finalizeWcConnection(address)

    expect(sendEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'track',
        event: 'CONNECT_SUCCESS',
        address,
        properties: expect.objectContaining({
          method: 'mobile',
          name: 'TestWallet',
          view: 'TestView',
          walletRank: 5
        })
      })
    )
  })
})
