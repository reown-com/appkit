import type { Config } from '@wagmi/core'
import {
  estimateGas,
  getAccount,
  getBalance,
  getConnections,
  http,
  signMessage,
  switchChain,
  sendTransaction as wagmiSendTransaction,
  writeContract as wagmiWriteContract,
  waitForTransactionReceipt,
  watchAccount,
  watchPendingTransactions
} from '@wagmi/core'
import * as wagmiCore from '@wagmi/core'
import { mainnet } from '@wagmi/core/chains'
import type UniversalProvider from '@walletconnect/universal-provider'
import { checksumAddress } from 'viem'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { type AppKitNetwork, type CaipAddress, ConstantsUtil } from '@reown/appkit-common'
import {
  ChainController,
  type ConnectionControllerClient,
  CoreHelperUtil,
  type NetworkControllerClient,
  type SocialProvider
} from '@reown/appkit-controllers'
import { CaipNetworksUtil } from '@reown/appkit-utils'
import type { W3mFrameProvider } from '@reown/appkit-wallet'

import { WagmiAdapter } from '../client'
import * as auth from '../connectors/AuthConnector'
import { LimitterUtil } from '../utils/LimitterUtil'
import * as helpers from '../utils/helpers'
import { mockAppKit } from './mocks/AppKit'

// Define spies at the top-level for @wagmi/connectors
const mockCoinbaseWallet = vi.fn(() => ({
  id: 'coinbaseWallet',
  name: 'Coinbase Wallet',
  type: 'injected',
  getProvider: vi.fn().mockResolvedValue({ connect: vi.fn(), request: vi.fn() })
}))
const mockSafe = vi.fn(() => ({
  id: 'safe',
  name: 'Safe',
  type: 'injected',
  getProvider: vi.fn().mockResolvedValue({ connect: vi.fn(), request: vi.fn() })
}))

vi.mock('@wagmi/core', async () => {
  const actual = await vi.importActual('@wagmi/core')
  return {
    ...actual,
    addConnector: vi.fn(),
    connect: vi.fn(() => mockConnect()),
    disconnect: vi.fn(),
    createConfig: vi.fn(() => mockWagmiConfig),
    getConnections: vi.fn(),
    switchChain: vi.fn(),
    getBalance: vi.fn(),
    signMessage: vi.fn(),
    estimateGas: vi.fn(),
    sendTransaction: vi.fn(),
    writeContract: vi.fn(),
    waitForTransactionReceipt: vi.fn(),
    getAccount: vi.fn(() => ({
      chainId: 1
    })),
    prepareTransactionRequest: vi.fn(),
    reconnect: vi.fn(),
    watchAccount: vi.fn(),
    watchConnections: vi.fn(),
    watchPendingTransactions: vi.fn().mockReturnValue(vi.fn())
  }
})

// Top-level mock for @wagmi/connectors

const mockProjectId = 'test-project-id'
const mockNetworks = [mainnet]
const mockCaipNetworks = CaipNetworksUtil.extendCaipNetworks(mockNetworks, {
  projectId: mockProjectId,
  customNetworkImageUrls: {}
})
const mockWagmiConfig = {
  chains: mockCaipNetworks,
  connectors: [
    {
      id: 'test-connector',
      getProvider() {
        return Promise.resolve({ connect: vi.fn(), request: vi.fn() })
      }
    },
    {
      id: 'ID_AUTH',
      getProvider() {
        return Promise.resolve({
          user: {
            address: '0x123',
            accounts: [
              { address: '0x123', type: 'eoa' },
              { address: '0x456', type: 'smartAccount' }
            ]
          }
        })
      }
    }
  ],
  state: {
    connections: new Map()
  },
  _internal: {
    connectors: {
      setup: vi.fn(connector => connector),
      setState: vi.fn()
    }
  }
} as unknown as Config

const mockConnect = vi.fn(() => ({
  chainId: 1,
  address: '0x123',
  accounts: ['0x123']
}))

const mockAuthProvider = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  switchNetwork: vi.fn(),
  getUser: vi.fn()
} as unknown as W3mFrameProvider

describe('WagmiAdapter', () => {
  let adapter: WagmiAdapter

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mock('@wagmi/connectors', async () => {
      const actual = await vi.importActual('@wagmi/connectors')
      return {
        ...actual,
        coinbaseWallet: mockCoinbaseWallet,
        safe: mockSafe
      }
    })

    vi.spyOn(helpers, 'getCoinbaseConnector').mockResolvedValue(mockCoinbaseWallet() as any)

    adapter = new WagmiAdapter({
      networks: mockNetworks,
      projectId: mockProjectId
    })
    adapter.wagmiConfig = mockWagmiConfig
    ChainController.initialize([adapter], mockCaipNetworks, {
      connectionControllerClient: vi.fn() as unknown as ConnectionControllerClient,
      networkControllerClient: vi.fn() as unknown as NetworkControllerClient
    })
    ChainController.setRequestedCaipNetworks(mockCaipNetworks, 'eip155')
  })

  describe('WagmiAdapter - constructor and initialization', () => {
    it('should initialize with correct parameters', () => {
      expect(adapter.projectId).toBe(mockProjectId)
      expect(adapter.adapterType).toBe(ConstantsUtil.ADAPTER_TYPES.WAGMI)
      expect(adapter.namespace).toBe(ConstantsUtil.CHAIN.EVM)
    })

    it('should emit switchNetwork in constructor when chainId is returned from getAccount', () => {
      const emitSpy = vi.spyOn(WagmiAdapter.prototype, 'emit' as any)

      new WagmiAdapter({
        networks: mockNetworks,
        projectId: mockProjectId
      })

      expect(emitSpy).toHaveBeenCalledWith('switchNetwork', {
        chainId: 1
      })
    })

    it('should emit switchNetwork in construct when chainId is returned from getAccount', () => {
      const emitSpy = vi.fn()
      adapter.on('switchNetwork', emitSpy)
      adapter.construct({})
      expect(emitSpy).toHaveBeenCalledWith({
        chainId: 1
      })
    })

    it('should set wagmi connectors', async () => {
      vi.spyOn(wagmiCore, 'watchConnectors').mockImplementation(vi.fn())
      vi.spyOn(wagmiCore, 'watchConnectors')

      await adapter.syncConnectors(
        { networks: [mainnet], projectId: 'YOUR_PROJECT_ID' },
        mockAppKit
      )
      expect(wagmiCore.watchConnectors).toHaveBeenCalledOnce()
      expect(adapter.connectors).toStrictEqual([
        {
          chain: 'eip155',
          chains: [],
          explorerId: undefined,
          id: 'test-connector',
          imageId: undefined,
          imageUrl: undefined,
          info: { rdns: 'test-connector' },
          provider: {
            connect: expect.any(Function),
            request: expect.any(Function)
          },
          name: undefined,
          type: 'EXTERNAL'
        }
      ])
    })

    it('should not set info property for injected connector', async () => {
      const mockConnectors = [
        {
          id: 'Browser Wallet',
          name: 'Browser Wallet',
          type: 'injected',
          info: { rdns: 'Browser Wallet' }
        }
      ]

      await (adapter as any).syncConnectors(mockConnectors)

      const injectedConnector = mockConnectors.filter((c: any) => c.id === 'injected')[0]

      expect(injectedConnector?.info).toBeUndefined()
    })

    it('should not add auth connector when email and socials are both false', async () => {
      const authConnectorSpy = vi.spyOn(auth, 'authConnector')

      const options = {
        enableInjected: false,
        projectId: mockProjectId,
        networks: [mockCaipNetworks[0]] as [AppKitNetwork, ...AppKitNetwork[]]
      }

      mockAppKit.features = {
        email: false,
        socials: false
      }

      await adapter.syncConnectors(options, mockAppKit)

      expect(authConnectorSpy).not.toHaveBeenCalled()
    })

    it('should add auth connector when email is true and socials are false', async () => {
      const authConnectorSpy = vi.spyOn(auth, 'authConnector')

      const options = {
        enableInjected: false,
        projectId: mockProjectId,
        networks: [mockCaipNetworks[0]] as [AppKitNetwork, ...AppKitNetwork[]]
      }

      mockAppKit.features = {
        email: true,
        socials: false
      }

      await adapter.syncConnectors(options, mockAppKit)

      expect(authConnectorSpy).toHaveBeenCalled()
    })

    it('should not add auth connector when email is false and socials is an empty array', async () => {
      const authConnectorSpy = vi.spyOn(auth, 'authConnector')

      const options = {
        enableInjected: false,
        projectId: mockProjectId,
        networks: [mockCaipNetworks[0]] as [AppKitNetwork, ...AppKitNetwork[]]
      }

      mockAppKit.features = {
        email: false,
        socials: []
      }

      await adapter.syncConnectors(options, mockAppKit)

      expect(authConnectorSpy).not.toHaveBeenCalled()
    })

    it('should add auth connector when email is true and socials are not false', async () => {
      const authConnectorSpy = vi.spyOn(auth, 'authConnector')

      const options = {
        enableInjected: false,
        projectId: mockProjectId,
        networks: [mockCaipNetworks[0]] as [AppKitNetwork, ...AppKitNetwork[]]
      }

      mockAppKit.features = {
        email: true,
        socials: ['facebook'] as SocialProvider[]
      }

      await adapter.syncConnectors(options, mockAppKit)

      await vi.waitFor(() => {
        expect(authConnectorSpy).toHaveBeenCalled()
      })
    })

    it('should add auth connector when email is false and socials contain providers', async () => {
      const authConnectorSpy = vi.spyOn(auth, 'authConnector')

      const options = {
        enableInjected: false,
        projectId: mockProjectId,
        networks: [mockCaipNetworks[0]] as [AppKitNetwork, ...AppKitNetwork[]]
      }

      mockAppKit.features = {
        email: false,
        socials: ['x'] as SocialProvider[]
      }

      await adapter.syncConnectors(options, mockAppKit)

      await vi.waitFor(() => {
        expect(authConnectorSpy).toHaveBeenCalled()
      })
    })

    it('should add auth connector when both email and socials are true', async () => {
      const authConnectorSpy = vi.spyOn(auth, 'authConnector')

      const options = {
        enableInjected: false,
        projectId: mockProjectId,
        networks: [mockCaipNetworks[0]] as [AppKitNetwork, ...AppKitNetwork[]]
      }

      mockAppKit.features = {
        email: true,
        socials: ['google'] as SocialProvider[]
      }

      await adapter.syncConnectors(options, mockAppKit)

      await vi.waitFor(() => {
        expect(authConnectorSpy).toHaveBeenCalled()
      })
    })

    it('should return reown RPC by default', () => {
      expect(adapter.wagmiChains?.[0].rpcUrls.default.http[0]).toBe(
        `https://rpc.walletconnect.org/v1/?chainId=eip155%3A1&projectId=${mockProjectId}`
      )
    })

    it('should return custom RPC if transports is provided', () => {
      const adapterWithCustomRpc = new WagmiAdapter({
        networks: mockNetworks,
        projectId: mockProjectId,
        transports: {
          [mainnet.id]: http('https://eth.merkle.io')
        }
      })

      expect(adapterWithCustomRpc.wagmiChains?.[0].rpcUrls.default.http[0]).toBe(
        'https://rpc.walletconnect.org/v1/?chainId=eip155%3A1&projectId=test-project-id'
      )
    })

    it('should add connector with provider', async () => {
      const mockConnector = {
        id: 'injected',
        name: 'Injected Wallet',
        type: 'injected',
        getProvider() {
          return Promise.resolve({ connect: vi.fn(), request: vi.fn() })
        }
      } as unknown as wagmiCore.Connector

      await (adapter as any).addWagmiConnector(mockConnector, {
        enableEIP6963: true
      })

      expect(adapter.connectors).toStrictEqual([
        {
          chain: 'eip155',
          chains: [],
          explorerId: undefined,
          id: 'injected',
          imageId: '07ba87ed-43aa-4adf-4540-9e6a2b9cae00',
          imageUrl: undefined,
          info: undefined,
          name: 'Browser Wallet',
          provider: {
            connect: expect.any(Function),
            request: expect.any(Function)
          },
          type: 'INJECTED'
        }
      ])
    })
  })

  describe('WagmiAdapter - signMessage', () => {
    it('should sign a message successfully', async () => {
      const mockSignature = '0xmocksignature'
      vi.mocked(signMessage).mockResolvedValueOnce(mockSignature)

      const result = await adapter.signMessage({
        message: 'Hello',
        address: '0x123'
      })

      expect(result.signature).toBe(mockSignature)
    })
  })

  describe('WagmiAdapter - sendTransaction', () => {
    it('should send transaction successfully', async () => {
      const mockTxHash = '0xtxhash'
      vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
        address: '0x123',
        currentTab: 0,
        tokenBalance: [],
        smartAccountDeployed: false,
        addressLabels: new Map(),
        user: undefined
      })
      vi.mocked(getAccount).mockReturnValue({
        chainId: 1,
        address: '0x123',
        addresses: [],
        chain: mainnet,
        connector: {} as any,
        isConnected: true,
        isReconnecting: true,
        isConnecting: false,
        isDisconnected: false,
        status: 'reconnecting'
      })
      vi.mocked(wagmiSendTransaction).mockResolvedValue(mockTxHash)
      vi.mocked(waitForTransactionReceipt).mockResolvedValue({} as any)

      const result = await adapter.sendTransaction({
        to: '0x456',
        value: BigInt(1000),
        gas: BigInt(21000),
        gasPrice: BigInt(2000000000),
        data: '0x'
      })

      expect(result.hash).toBe(mockTxHash)
    })
  })

  describe('writeContract', () => {
    it('should write contract successfully', async () => {
      const mockTxHash = '0xtxhash'
      vi.mocked(wagmiWriteContract).mockResolvedValue(mockTxHash)

      const result = await adapter.writeContract({
        caipNetwork: mockCaipNetworks[0],
        caipAddress: 'eip155:1:0x123',
        tokenAddress: '0x123',
        fromAddress: '0x456',
        args: ['0x789', BigInt(1000)],
        abi: [],
        method: 'transfer',
        chainNamespace: 'eip155'
      })

      expect(result.hash).toBe(mockTxHash)
    })
  })

  describe('WagmiAdapter - estimateGas', () => {
    it('should estimate gas successfully', async () => {
      const mockGas = BigInt(21000)
      vi.mocked(estimateGas).mockResolvedValue(mockGas)

      const result = await adapter.estimateGas({
        address: '0x123',
        to: '0x456',
        data: '0x',
        caipNetwork: mockCaipNetworks[0]
      })

      expect(result.gas).toBe(mockGas)
    })

    it('should throw error when estimation fails', async () => {
      vi.mocked(estimateGas).mockRejectedValue(new Error())

      await expect(
        adapter.estimateGas({
          address: '0x123',
          to: '0x456',
          data: '0x',
          caipNetwork: mockCaipNetworks[0]
        })
      ).rejects.toThrow('WagmiAdapter:estimateGas - error estimating gas')
    })
  })

  describe('WagmiAdapter - parseUnits and formatUnits', () => {
    it('should parse units correctly', () => {
      const result = adapter.parseUnits({
        value: '1.5',
        decimals: 18
      })

      expect(result).toBe(BigInt('1500000000000000000'))
    })

    it('should format units correctly', () => {
      const result = adapter.formatUnits({
        value: BigInt('1500000000000000000'),
        decimals: 18
      })

      expect(result).toBe('1.5')
    })
  })

  describe('WagmiAdapter - getBalance', () => {
    it('should get balance successfully', async () => {
      vi.mocked(getBalance).mockResolvedValue({
        formatted: '1.5',
        symbol: 'ETH'
      } as any)

      const result = await adapter.getBalance({
        address: '0x123',
        chainId: 1
      })

      expect(result).toEqual({
        balance: '1.5',
        symbol: 'ETH'
      })
    })

    it('should call getBalance once even when multiple adapter requests are sent at the same time', async () => {
      // delay the response to simulate http request latency
      const latency = 1000
      const numSimultaneousRequests = 10
      const expectedSentRequests = 1

      vi.mocked(getBalance).mockResolvedValue(
        new Promise(resolve => {
          setTimeout(() => {
            resolve({
              formatted: '1.5',
              symbol: 'ETH'
            })
          }, latency)
        }) as any
      )

      const result = await Promise.all([
        ...Array.from({ length: numSimultaneousRequests }).map(() =>
          adapter.getBalance({
            address: '0x123',
            chainId: 1
          })
        )
      ])

      expect(getBalance).toHaveBeenCalledTimes(expectedSentRequests)
      expect(result.length).toBe(numSimultaneousRequests)
      expect(expectedSentRequests).to.be.lt(numSimultaneousRequests)

      // verify all calls got the same balance
      for (const balance of result) {
        expect(balance).toEqual({
          balance: '1.5',
          symbol: 'ETH'
        })
      }
    })

    it('should return empty balance when network not found', async () => {
      const result = await adapter.getBalance({
        address: '0x123',
        chainId: 999
      })

      expect(result).toEqual({
        balance: '',
        symbol: ''
      })
    })
  })

  describe('WagmiAdapter - connect, syncConnection and disconnect', () => {
    it('should connect successfully', async () => {
      const result = await adapter.connect({
        id: 'test-connector',
        provider: {} as any,
        type: 'injected',
        chainId: 1
      })

      expect(result.address).toBe('0x123')
      expect(result.chainId).toBe(1)
    })

    it('should sync connection successfully', async () => {
      vi.mocked(getConnections).mockReturnValue([
        { connector: { id: 'test-connector', type: 'injected' }, accounts: ['0x123'], chainId: 1 }
      ] as any)
      const result = await adapter.syncConnection({
        id: 'test-connector',
        chainId: 1,
        namespace: 'eip155',
        rpcUrl: 'https://rpc.walletconnect.org'
      })

      expect(result.address).toBe('0x123')
      expect(result.type).toBe('INJECTED')
      expect(result.chainId).toBe(1)
    })

    it('should disconnect successfully', async () => {
      const mockConnections = [
        {
          accounts: ['0x123'],
          connector: {
            id: 'connector1',
            getProvider: vi.fn().mockImplementation(() => Promise.resolve({}))
          }
        },
        {
          accounts: ['0x123'],
          connector: {
            id: 'connector2',
            getProvider: vi.fn().mockImplementation(() => Promise.resolve({}))
          }
        }
      ]

      vi.spyOn(wagmiCore, 'getConnections').mockReturnValue(mockConnections as any)
      vi.spyOn(wagmiCore, 'createConfig').mockReturnValue({
        connectors: mockConnections.map(
          ({ connector }) => connector as unknown as wagmiCore.Connector
        ),
        state: {
          connections: new Map([
            ['connector1', { connector: { id: 'connector1' } }],
            ['connector2', { connector: { id: 'connector2' } }]
          ])
        }
      } as any)

      const disconnectSpy = vi.spyOn(wagmiCore, 'disconnect').mockImplementationOnce(vi.fn())

      const adapter = new WagmiAdapter({
        networks: mockNetworks,
        projectId: mockProjectId
      })

      adapter.construct({})

      await adapter.disconnect({})

      expect(disconnectSpy).toHaveBeenCalledTimes(2)
      expect(adapter.wagmiConfig.state.connections.size).toBe(0)
    })

    it('should disconnect wagmi context succesfully even if one of the connectors fails to disconnect', async () => {
      const mockConnections = [
        {
          accounts: ['0x123'],
          connector: {
            id: 'connector1'
          }
        },
        {
          accounts: ['0x123'],
          connector: {
            id: 'connector2'
          }
        }
      ]

      vi.spyOn(wagmiCore, 'getConnections').mockReturnValue(mockConnections as any)
      vi.spyOn(wagmiCore, 'createConfig').mockReturnValue({
        connectors: mockConnections.map(
          ({ connector }) => connector as unknown as wagmiCore.Connector
        ),
        state: {
          connections: new Map([
            ['connector1', { connector: { id: 'connector1' } }],
            ['connector2', { connector: { id: 'connector2' } }]
          ])
        }
      } as any)

      const disconnectSpy = vi.spyOn(wagmiCore, 'disconnect').mockImplementationOnce(vi.fn())
      disconnectSpy.mockRejectedValueOnce(new Error('Failed to disconnect'))

      const wagmiAdapter = new WagmiAdapter({
        networks: mockNetworks,
        projectId: mockProjectId
      })

      wagmiAdapter.construct({})

      await wagmiAdapter.disconnect({})

      expect(disconnectSpy).toHaveBeenCalledTimes(2)
      expect(wagmiAdapter.wagmiConfig.state.connections.size).toBe(0)
    })

    it('should authenticate and connect with wagmi when using connectWalletConnect', async () => {
      const mockWalletConnectConnector = {
        authenticate: vi.fn().mockResolvedValue(true),
        provider: {
          client: {
            core: {
              crypto: {
                getClientId: vi.fn().mockResolvedValue('mock-client-id')
              }
            }
          }
        }
      }

      const mockWagmiConnector = {
        id: 'walletConnect'
      }

      vi.spyOn(adapter as any, 'getWalletConnectConnector').mockReturnValue(
        mockWalletConnectConnector
      )
      vi.spyOn(adapter as any, 'getWagmiConnector').mockReturnValue(mockWagmiConnector)
      const connectSpy = vi.spyOn(wagmiCore, 'connect').mockResolvedValue({} as any)

      const result = await adapter.connectWalletConnect(1)

      expect(mockWalletConnectConnector.authenticate).toHaveBeenCalled()
      expect(connectSpy).toHaveBeenCalledWith(
        adapter.wagmiConfig,
        expect.objectContaining({
          connector: mockWagmiConnector,
          chainId: 1
        })
      )
      expect(result.clientId).toBe('mock-client-id')
    })

    it('should disconnect specific connector when id is provided', async () => {
      const mockConnection = {
        accounts: ['0x123'],
        connector: {
          id: 'specific-connector',
          getProvider: vi.fn().mockImplementation(() => Promise.resolve({}))
        }
      }

      vi.spyOn(wagmiCore, 'getConnections').mockReturnValue([mockConnection] as any)
      const disconnectSpy = vi.spyOn(wagmiCore, 'disconnect').mockImplementationOnce(vi.fn())

      await adapter.disconnect({ id: 'specific-connector' })

      expect(disconnectSpy).toHaveBeenCalledWith(adapter.wagmiConfig, expect.any(Object))
    })

    it('should handle empty connections gracefully', async () => {
      vi.spyOn(wagmiCore, 'getConnections').mockReturnValue([])
      const disconnectSpy = vi.spyOn(wagmiCore, 'disconnect').mockImplementationOnce(vi.fn())

      const result = await adapter.disconnect({})

      expect(disconnectSpy).not.toHaveBeenCalled()
      expect(result.connections).toEqual([])
    })

    it('should sync connections using wagmi watchConnections', async () => {
      const mockConnections = [
        {
          accounts: ['0x123'],
          connector: { id: 'test-connector', type: 'injected' },
          chainId: 1
        }
      ]

      vi.spyOn(wagmiCore, 'watchConnections').mockImplementation((_config, { onChange }) => {
        onChange(mockConnections as any, [])
        return vi.fn()
      })

      const emitSpy = vi.spyOn(adapter, 'emit' as any)

      adapter['setupWatchers']()

      expect(wagmiCore.watchConnections).toHaveBeenCalledWith(
        adapter.wagmiConfig,
        expect.objectContaining({
          onChange: expect.any(Function)
        })
      )

      expect(emitSpy).toHaveBeenCalledWith('connections', expect.any(Array))
    })

    it('should handle connection changes and emit connections when connections are removed', async () => {
      const prevConnections = [
        {
          accounts: ['0x123'],
          connector: { id: 'test-connector', type: 'injected' },
          chainId: 1
        }
      ]

      vi.spyOn(wagmiCore, 'watchConnections').mockImplementation((_config, { onChange }) => {
        onChange([], prevConnections as any)
        return vi.fn()
      })

      const emitSpy = vi.spyOn(adapter, 'emit' as any)

      adapter['setupWatchers']()

      expect(emitSpy).toHaveBeenCalledWith('connections', [])
    })
  })

  describe('WagmiAdapter - switchNetwork', () => {
    it('should switch network successfully', async () => {
      await adapter.switchNetwork({
        caipNetwork: mockCaipNetworks[0]
      })

      expect(switchChain).toHaveBeenCalledWith(
        adapter.wagmiConfig,
        expect.objectContaining({
          chainId: 1,
          addEthereumChainParameter: {
            chainName: mockCaipNetworks[0].name,
            nativeCurrency: {
              name: mockCaipNetworks[0].nativeCurrency.name,
              symbol: mockCaipNetworks[0].nativeCurrency.symbol,
              decimals: mockCaipNetworks[0].nativeCurrency.decimals
            },
            rpcUrls: [mockCaipNetworks[0].rpcUrls?.['chainDefault']?.http?.[0] ?? ''],
            blockExplorerUrls: [mockCaipNetworks[0].blockExplorers?.default.url ?? '']
          }
        })
      )
    })

    it('should respect preferred account type when switching network with AUTH provider', async () => {
      vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
        address: '0x123',
        currentTab: 0,
        tokenBalance: [],
        smartAccountDeployed: false,
        addressLabels: new Map(),
        user: undefined,
        preferredAccountType: 'smartAccount'
      })

      await adapter.switchNetwork({
        caipNetwork: mockCaipNetworks[0],
        provider: mockAuthProvider,
        providerType: 'AUTH'
      })

      expect(mockAuthProvider.getUser).toHaveBeenCalledWith({
        chainId: 'eip155:1',
        preferredAccountType: 'smartAccount'
      })
      expect(mockAuthProvider.switchNetwork).toHaveBeenCalledWith({ chainId: 'eip155:1' })
    })
  })

  describe('WagmiAdapter - Permissions', () => {
    const mockProvider = {
      request: vi.fn()
    } as unknown as UniversalProvider

    beforeEach(() => {
      vi.mocked(getConnections).mockReturnValue([
        {
          connector: {
            getProvider: () => Promise.resolve(mockProvider)
          }
        }
      ] as any)
    })

    it('should get capabilities from session properties', async () => {
      const mockRequest = vi.fn()

      const mockConnections = [
        {
          connector: {
            id: 'test-connector',
            getProvider: vi.fn().mockReturnValue({
              session: {
                sessionProperties: {}
              },
              request: mockRequest
            })
          }
        }
      ]

      vi.spyOn(wagmiCore, 'getConnections').mockReturnValue(mockConnections as any)

      vi.spyOn(wagmiCore, 'createConfig').mockReturnValue({
        connectors: mockConnections.map(
          ({ connector }) => connector as unknown as wagmiCore.Connector
        )
      } as any)

      const adapter = new WagmiAdapter({
        networks: mockNetworks,
        projectId: mockProjectId
      })

      await adapter.getCapabilities('eip155:1:0x123')

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'wallet_getCapabilities',
        params: ['eip155:1:0x123']
      })
    })

    it('should call provider request with correct params', async () => {
      const mockRequest = vi.fn()

      const mockConnections = [
        {
          connector: {
            id: 'test-connector',
            getProvider: vi.fn().mockReturnValue({
              session: {
                sessionProperties: {}
              },
              request: mockRequest
            })
          }
        }
      ]

      vi.spyOn(wagmiCore, 'getConnections').mockReturnValue(mockConnections as any)

      vi.spyOn(wagmiCore, 'createConfig').mockReturnValue({
        connectors: mockConnections.map(
          ({ connector }) => connector as unknown as wagmiCore.Connector
        )
      } as any)

      const mockParams = {
        pci: 'test-pci',
        expiry: 1234567890,
        address: 'eip155:1:0x123' as CaipAddress,
        permissions: ['eth_accounts']
      }

      const adapter = new WagmiAdapter({
        networks: mockNetworks,
        projectId: mockProjectId
      })

      await adapter.grantPermissions(mockParams)

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'wallet_grantPermissions',
        params: mockParams
      })
    })

    it('should call provider request with correct params', async () => {
      const mockParams = {
        pci: 'test-pci',
        expiry: 1234567890,
        address: 'eip155:1:0x123' as CaipAddress,
        permissions: ['eth_accounts']
      }

      const mockRequest = vi.fn()

      const mockConnections = [
        {
          connector: {
            id: 'test-connector',
            getProvider: vi.fn().mockReturnValue({
              session: {
                sessionProperties: {}
              },
              request: mockRequest
            })
          }
        }
      ]

      vi.spyOn(wagmiCore, 'getConnections').mockReturnValue(mockConnections as any)

      vi.spyOn(wagmiCore, 'createConfig').mockReturnValue({
        connectors: mockConnections.map(
          ({ connector }) => connector as unknown as wagmiCore.Connector
        )
      } as any)

      const adapter = new WagmiAdapter({
        networks: mockNetworks,
        projectId: mockProjectId
      })

      await adapter.revokePermissions(mockParams)

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'wallet_revokePermissions',
        params: mockParams
      })
    })
  })

  describe('WagmiAdapter - watchPendingTransactions', () => {
    it('should emit pendingTransactions when transactions are pending', async () => {
      const adapter = new WagmiAdapter({
        networks: mockNetworks,
        projectId: mockProjectId,
        pendingTransactionsFilter: {
          enable: true,
          pollingInterval: 5000
        }
      })

      const emitSpy = vi.spyOn(adapter, 'emit' as any)

      vi.mocked(watchPendingTransactions).mockImplementation((_, { onTransactions }) => {
        onTransactions(['0xtx1', '0xtx2'])
        return vi.fn()
      })

      adapter['setupWatchPendingTransactions']()

      expect(emitSpy).toHaveBeenCalledWith('pendingTransactions')
    })

    it('should limit the amount of pendingTransactions calls', async () => {
      const unsubscribe = vi.fn()

      vi.mocked(watchAccount).mockImplementation((_, { onChange }) => {
        onChange(
          {
            address: '0x123',
            status: 'connected',
            connector: { getProvider: vi.fn().mockImplementation(() => Promise.resolve({})) }
          } as any,
          {} as any
        )
        return vi.fn()
      })

      vi.spyOn(wagmiCore, 'watchPendingTransactions').mockReturnValue(unsubscribe)

      const adapter = new WagmiAdapter({
        networks: mockNetworks,
        projectId: mockProjectId,
        pendingTransactionsFilter: {
          enable: true,
          pollingInterval: 500
        }
      })

      adapter.construct({})

      // Set state to maximum limit so we know once we reach the limit it'll unsubscribe the watchPendingTransactions
      LimitterUtil.state.pendingTransactions = ConstantsUtil.LIMITS.PENDING_TRANSACTIONS

      // Wait for valtio to check for updated state and unsubscribe watchPendingTransactions
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(unsubscribe).toHaveBeenCalled()
    })
  })

  describe('WagmiAdapter - watchAccount', () => {
    let adapter: WagmiAdapter

    beforeAll(() => {
      adapter = new WagmiAdapter({
        networks: mockNetworks,
        projectId: mockProjectId,
        pendingTransactionsFilter: {
          enable: true,
          pollingInterval: 5000
        }
      })
    })

    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should emit accountChanged if previous account status is not connected', async () => {
      const currAccount = {
        status: 'connected',
        address: '0x123',
        chainId: 1,
        connector: {
          getProvider: vi.fn().mockImplementation(() => Promise.resolve({}))
        }
      } as unknown as wagmiCore.GetAccountReturnType

      const prevAccount = {
        status: 'connecting',
        address: '0x123',
        chainId: 1,
        connector: {
          getProvider: vi.fn().mockImplementation(() => Promise.resolve({}))
        }
      } as unknown as wagmiCore.GetAccountReturnType

      vi.mocked(watchAccount).mockImplementation((config, { onChange }) => {
        expect(config).toBe(adapter.wagmiConfig)
        onChange(currAccount, prevAccount)
        return vi.fn()
      })

      const accountChangedSpy = vi.fn()

      adapter.on('accountChanged', accountChangedSpy)

      adapter['setupWatchers']()

      await vi.waitFor(() => {
        expect(accountChangedSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            address: checksumAddress(currAccount.address as `0x${string}`),
            chainId: currAccount.chainId
          })
        )
      })
    })

    it('should emit accountChanged when status is connected', async () => {
      const currAccount = {
        status: 'connected',
        address: '0x123',
        chainId: 1,
        connector: {
          getProvider: vi.fn().mockImplementation(() => Promise.resolve({}))
        }
      } as unknown as wagmiCore.GetAccountReturnType

      const prevAccount = {
        status: 'connected',
        address: '0x321',
        chainId: 1,
        connector: {
          getProvider: vi.fn().mockImplementation(() => Promise.resolve({}))
        }
      } as unknown as wagmiCore.GetAccountReturnType

      vi.mocked(watchAccount).mockImplementation((config, { onChange }) => {
        expect(config).toBe(adapter.wagmiConfig)
        onChange(currAccount, prevAccount)
        return vi.fn()
      })

      const adapter = new WagmiAdapter({
        networks: mockNetworks,
        projectId: mockProjectId,
        pendingTransactionsFilter: {
          enable: true,
          pollingInterval: 5000
        }
      })

      const accountChangedSpy = vi.fn()

      adapter.on('accountChanged', accountChangedSpy)

      adapter['setupWatchers']()

      await vi.waitFor(() => {
        expect(accountChangedSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            address: checksumAddress(currAccount.address as `0x${string}`),
            chainId: currAccount.chainId
          })
        )
      })
    })

    it('should not emit accountChanged if current status is not connected', async () => {
      const currAccount = {
        status: 'connecting',
        address: '0x123',
        chainId: 1
      } as unknown as wagmiCore.GetAccountReturnType

      const prevAccount = {
        status: 'connected',
        address: '0x123',
        chainId: 1
      } as unknown as wagmiCore.GetAccountReturnType

      vi.mocked(watchAccount).mockImplementation((config, { onChange }) => {
        expect(config).toBe(adapter.wagmiConfig)
        onChange(currAccount, prevAccount)
        return vi.fn()
      })

      const accountChangedSpy = vi.fn()

      adapter.on('accountChanged', accountChangedSpy)

      adapter['setupWatchers']()

      expect(accountChangedSpy).not.toHaveBeenCalled()
    })

    it('should emit disconnect if status is disconnected and previous data is connected', async () => {
      const currAccount = {
        status: 'disconnected',
        address: undefined,
        chainId: 1
      } as unknown as wagmiCore.GetAccountReturnType

      const prevAccount = {
        status: 'connected',
        address: '0x123',
        chainId: 1
      } as unknown as wagmiCore.GetAccountReturnType

      vi.mocked(watchAccount).mockImplementation((config, { onChange }) => {
        expect(config).toBe(adapter.wagmiConfig)
        onChange(currAccount, prevAccount)
        return vi.fn()
      })

      const disconnectSpy = vi.fn()

      adapter.on('disconnect', disconnectSpy)

      adapter['setupWatchers']()

      expect(disconnectSpy).toHaveBeenCalled()
    })

    it('should not emit disconnect if previous account data is undefined and current account data is disconnected', async () => {
      const currAccount = {
        status: 'disconnected',
        address: '0x123',
        chainId: 1
      } as unknown as wagmiCore.GetAccountReturnType

      const prevAccount = {
        status: 'disconnected',
        address: undefined,
        chainId: 1
      } as unknown as wagmiCore.GetAccountReturnType

      vi.mocked(watchAccount).mockImplementation((config, { onChange }) => {
        expect(config).toBe(adapter.wagmiConfig)
        onChange(currAccount, prevAccount)
        return vi.fn()
      })

      const disconnectSpy = vi.fn()

      adapter.on('disconnect', disconnectSpy)

      adapter['setupWatchers']()

      expect(disconnectSpy).not.toHaveBeenCalled()
    })

    it('should emit switchNetwork when chainId changes regardless of connection status', async () => {
      const currAccount = {
        status: 'disconnected',
        address: undefined,
        chainId: 137
      } as unknown as wagmiCore.GetAccountReturnType

      const prevAccount = {
        status: 'disconnected',
        address: undefined,
        chainId: undefined
      } as unknown as wagmiCore.GetAccountReturnType

      vi.mocked(watchAccount).mockImplementation((config, { onChange }) => {
        expect(config).toBe(adapter.wagmiConfig)
        onChange(currAccount, prevAccount)
        return vi.fn()
      })

      const switchNetworkSpy = vi.fn()

      adapter.on('switchNetwork', switchNetworkSpy)

      adapter['setupWatchers']()

      expect(switchNetworkSpy).toHaveBeenCalledWith({
        chainId: currAccount.chainId
      })
    })

    it('should return accounts successfully when using auth connector', async () => {
      vi.spyOn(wagmiCore, 'createConfig').mockReturnValue({
        connectors: mockWagmiConfig.connectors
      } as any)

      const adapter = new WagmiAdapter({
        networks: mockNetworks,
        projectId: mockProjectId,
        pendingTransactionsFilter: {
          enable: true,
          pollingInterval: 5000
        }
      })

      const accounts = await adapter.getAccounts({ id: 'ID_AUTH' })

      expect(accounts).toEqual({
        accounts: [
          {
            namespace: 'eip155',
            address: '0x123',
            type: 'eoa',
            publicKey: undefined,
            path: undefined
          },
          {
            namespace: 'eip155',
            address: '0x456',
            type: 'smartAccount',
            publicKey: undefined,
            path: undefined
          }
        ]
      })
    })
  })
})

describe('WagmiAdapter - setUniversalProvider', () => {
  let adapter: WagmiAdapter
  let mockUniversalProvider: UniversalProvider

  beforeEach(() => {
    vi.clearAllMocks()

    mockUniversalProvider = {
      on: vi.fn(),
      emit: vi.fn(),
      removeListener: vi.fn()
    } as unknown as UniversalProvider

    adapter = new WagmiAdapter({
      networks: mockNetworks,
      projectId: mockProjectId
    })

    vi.mocked(getConnections).mockReturnValue([
      {
        connector: {
          id: 'walletConnect1'
        }
      }
    ] as any)

    vi.spyOn(adapter as any, 'getWagmiConnector').mockReturnValue({
      id: 'walletConnect'
    })
  })

  it('should not trigger reconnect when activeChain is eip155', () => {
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeChain: 'eip155'
    })

    const reconnectSpy = vi.spyOn(wagmiCore, 'reconnect')

    adapter.setUniversalProvider(mockUniversalProvider)

    const connectHandler = vi
      .mocked(mockUniversalProvider.on)
      .mock.calls.find(call => call[0] === 'connect')?.[1]

    expect(connectHandler).toBeDefined()

    connectHandler?.()

    expect(reconnectSpy).not.toHaveBeenCalled()
  })

  it('should trigger reconnect when activeChain is not eip155', () => {
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeChain: 'cosmos'
    })

    const reconnectSpy = vi.spyOn(wagmiCore, 'reconnect')

    adapter.setUniversalProvider(mockUniversalProvider)

    const connectHandler = vi
      .mocked(mockUniversalProvider.on)
      .mock.calls.find(call => call[0] === 'connect')?.[1]

    expect(connectHandler).toBeDefined()

    connectHandler?.()

    expect(reconnectSpy).toHaveBeenCalledWith(adapter.wagmiConfig, {
      connectors: [{ id: 'walletConnect' }]
    })
  })
})

describe('WagmiAdapter - addThirdPartyConnectors', () => {
  let adapter: WagmiAdapter
  let originalWindow: Window & typeof globalThis

  beforeEach(() => {
    vi.clearAllMocks()

    if (typeof window !== 'undefined') {
      originalWindow = window
    }

    const mockWindow = {
      self: undefined,
      top: undefined,
      location: {
        ancestorOrigins: [],
        hostname: 'localhost'
      },
      document: {},
      URL: vi.fn(url => ({
        hostname: new URL(url).hostname,
        href: url
      }))
    }

    vi.stubGlobal('window', mockWindow)
    if (!vi.isMockFunction(CoreHelperUtil.isClient)) {
      vi.spyOn(CoreHelperUtil, 'isClient').mockReturnValue(true)
    }

    adapter = new WagmiAdapter({
      networks: mockNetworks,
      projectId: mockProjectId
    })
    const mockConnectorsArray: wagmiCore.Connector[] = []
    adapter.wagmiConfig = {
      ...mockWagmiConfig,
      connectors: mockConnectorsArray,
      _internal: {
        connectors: {
          setup: vi.fn(connector => connector),
          setState: vi.fn(fn => {
            const newConnectors = fn(mockConnectorsArray)
            mockConnectorsArray.splice(0, mockConnectorsArray.length, ...newConnectors)
          })
        }
      }
    } as unknown as Config
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    if (originalWindow) {
      global.window = originalWindow
    }
    vi.restoreAllMocks()
  })

  it('should add Coinbase connector if enableCoinbase is not false', async () => {
    const getCoinbaseConnectorSpy = vi
      .spyOn(helpers, 'getCoinbaseConnector')
      .mockResolvedValue(mockCoinbaseWallet() as any)
    await adapter['addThirdPartyConnectors']({
      projectId: mockProjectId,
      networks: [mainnet]
    })
    expect(getCoinbaseConnectorSpy).toHaveBeenCalled()
    expect(adapter.wagmiConfig.connectors.length).toBe(1)
  })

  it('should not add Coinbase connector if enableCoinbase is false', async () => {
    await adapter['addThirdPartyConnectors']({
      projectId: mockProjectId,
      networks: [mainnet],
      enableCoinbase: false
    })
    expect(mockCoinbaseWallet).not.toHaveBeenCalled()
    expect(adapter.wagmiConfig.connectors.length).toBe(0)
  })

  it('should add Safe connector if in iframe and ancestor is app.safe.global', async () => {
    const mockSpecificWindow = {
      self: 'iframe_mock_self',
      top: 'mock_top',
      location: {
        ancestorOrigins: ['https://app.safe.global'],
        hostname: 'current.app'
      },
      document: {},
      URL: window.URL
    }
    vi.stubGlobal('window', mockSpecificWindow)
    vi.spyOn(CoreHelperUtil, 'isClient').mockReturnValue(true)

    await adapter['addThirdPartyConnectors']({
      projectId: mockProjectId,
      networks: [mainnet]
    })
    expect(mockSafe).toHaveBeenCalled()
    expect(adapter.wagmiConfig.connectors.some(c => c.id === 'safe')).toBe(true)
  })

  it('should not add Safe connector if not in iframe', async () => {
    const mockSpecificWindow = {
      self: globalThis,
      top: globalThis,
      location: {
        ancestorOrigins: [],
        hostname: 'current.app'
      },
      document: {},
      URL: window.URL
    }
    vi.stubGlobal('window', mockSpecificWindow)
    vi.spyOn(CoreHelperUtil, 'isClient').mockReturnValue(true)

    await adapter['addThirdPartyConnectors']({
      projectId: mockProjectId,
      networks: [mainnet]
    })
    expect(mockSafe).not.toHaveBeenCalled()
    expect(adapter.wagmiConfig.connectors.some(c => c.id === 'safe')).toBe(false)
  })

  it('should not add Safe connector if ancestor is not app.safe.global', async () => {
    const mockSpecificWindow = {
      self: 'iframe_mock_self',
      top: 'mock_top',
      location: {
        ancestorOrigins: ['https://some.other.domain'],
        hostname: 'current.app'
      },
      document: {},
      URL: window.URL
    }
    vi.stubGlobal('window', mockSpecificWindow)
    vi.spyOn(CoreHelperUtil, 'isClient').mockReturnValue(true)

    await adapter['addThirdPartyConnectors']({
      projectId: mockProjectId,
      networks: [mainnet]
    })
    expect(mockSafe).not.toHaveBeenCalled()
    expect(adapter.wagmiConfig.connectors.some(c => c.id === 'safe')).toBe(false)
  })
})
