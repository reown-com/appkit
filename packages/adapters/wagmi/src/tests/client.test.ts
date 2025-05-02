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
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { type AppKitNetwork, ConstantsUtil } from '@reown/appkit-common'
import {
  AccountController,
  ChainController,
  type ConnectionControllerClient,
  type NetworkControllerClient,
  type PreferredAccountTypes,
  type SocialProvider
} from '@reown/appkit-controllers'
import { CaipNetworksUtil } from '@reown/appkit-utils'
import type { W3mFrameProvider } from '@reown/appkit-wallet'

import { WagmiAdapter } from '../client'
import * as auth from '../connectors/AuthConnector'
import { LimitterUtil } from '../utils/LimitterUtil'
import { mockAppKit } from './mocks/AppKit'

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
    getAccount: vi.fn(),
    prepareTransactionRequest: vi.fn(),
    reconnect: vi.fn(),
    watchAccount: vi.fn(),
    watchConnections: vi.fn(),
    watchPendingTransactions: vi.fn().mockReturnValue(vi.fn())
  }
})

const mockProjectId = 'test-project-id'
const mockNetworks = [mainnet]
const mockCaipNetworks = CaipNetworksUtil.extendCaipNetworks(mockNetworks, {
  projectId: mockProjectId,
  customNetworkImageUrls: {}
})

const mockWagmiConfig = {
  connectors: [
    {
      id: 'test-connector',
      getProvider() {
        return Promise.resolve({ connect: vi.fn(), request: vi.fn() })
      }
    }
  ],
  _internal: {
    connectors: {
      setup: vi.fn(),
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
    adapter = new WagmiAdapter({
      networks: mockNetworks,
      projectId: mockProjectId
    })
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

    it('should not set info property for injected connector', () => {
      const mockConnectors = [
        {
          id: 'Browser Wallet',
          name: 'Browser Wallet',
          type: 'injected',
          info: { rdns: 'Browser Wallet' }
        }
      ]

      ;(adapter as any).syncConnectors(mockConnectors)

      const injectedConnector = mockConnectors.filter((c: any) => c.id === 'injected')[0]

      expect(injectedConnector?.info).toBeUndefined()
    })

    it('should not add auth connector when email and socials are both false', async () => {
      const authConnectorSpy = vi.spyOn(auth, 'authConnector')

      const options = {
        enableWalletConnect: false,
        enableInjected: false,
        features: {
          email: false,
          socials: false as const
        },
        projectId: mockProjectId,
        networks: [mockCaipNetworks[0]] as [AppKitNetwork, ...AppKitNetwork[]]
      }

      adapter.syncConnectors(options, mockAppKit)

      expect(authConnectorSpy).not.toHaveBeenCalled()
    })

    it('should not add auth connector when email is true and socials is false', async () => {
      const authConnectorSpy = vi.spyOn(auth, 'authConnector')

      const options = {
        enableWalletConnect: false,
        enableInjected: false,
        features: {
          email: true,
          socials: false as const
        },
        projectId: mockProjectId,
        networks: [mockCaipNetworks[0]] as [AppKitNetwork, ...AppKitNetwork[]]
      }

      adapter.syncConnectors(options, mockAppKit)

      expect(authConnectorSpy).not.toHaveBeenCalled()
    })

    it('should not add auth connector when email is false and socials is an empty array', async () => {
      const authConnectorSpy = vi.spyOn(auth, 'authConnector')

      const options = {
        enableWalletConnect: false,
        enableInjected: false,
        features: {
          email: false,
          socials: [] as SocialProvider[]
        },
        projectId: mockProjectId,
        networks: [mockCaipNetworks[0]] as [AppKitNetwork, ...AppKitNetwork[]]
      }

      adapter.syncConnectors(options, mockAppKit)

      expect(authConnectorSpy).not.toHaveBeenCalled()
    })

    it('should add auth connector when email is true and socials are not false', async () => {
      const authConnectorSpy = vi.spyOn(auth, 'authConnector')

      const options = {
        enableWalletConnect: false,
        enableInjected: false,
        features: {
          email: true,
          socials: ['facebook'] as SocialProvider[]
        },
        projectId: mockProjectId,
        networks: [mockCaipNetworks[0]] as [AppKitNetwork, ...AppKitNetwork[]]
      }

      adapter.syncConnectors(options, mockAppKit)

      await vi.waitFor(() => {
        expect(authConnectorSpy).toHaveBeenCalled()
      })
    })

    it('should add auth connector when email is false and socials contain providers', async () => {
      const authConnectorSpy = vi.spyOn(auth, 'authConnector')

      const options = {
        enableWalletConnect: false,
        enableInjected: false,
        features: {
          email: false,
          socials: ['x'] as SocialProvider[]
        },
        projectId: mockProjectId,
        networks: [mockCaipNetworks[0]] as [AppKitNetwork, ...AppKitNetwork[]]
      }

      adapter.syncConnectors(options, mockAppKit)

      await vi.waitFor(() => {
        expect(authConnectorSpy).toHaveBeenCalled()
      })
    })

    it('should add auth connector when both email and socials are true', async () => {
      const authConnectorSpy = vi.spyOn(auth, 'authConnector')

      const options = {
        enableWalletConnect: false,
        enableInjected: false,
        features: {
          email: true,
          socials: ['google'] as SocialProvider[]
        },
        projectId: mockProjectId,
        networks: [mockCaipNetworks[0]] as [AppKitNetwork, ...AppKitNetwork[]]
      }

      adapter.syncConnectors(options, mockAppKit)

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

      await (adapter as any).addWagmiConnector(mockConnector)

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
      vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
        ...AccountController.state,
        caipAddress: 'eip155:1:0x123'
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

  describe('WagmiAdapter - connect and disconnect', () => {
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

    it('should disconnect successfully', async () => {
      const mockConnections = [
        { connector: { id: 'connector1' } },
        { connector: { id: 'connector2' } }
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

      const disconnectSpy = vi.spyOn(wagmiCore, 'disconnect').mockImplementationOnce(vi.fn())

      await adapter.disconnect()

      expect(disconnectSpy).toHaveBeenCalledTimes(2)
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
        expect.anything(),
        expect.objectContaining({
          connector: mockWagmiConnector,
          chainId: 1
        })
      )
      expect(result.clientId).toBe('mock-client-id')
    })
  })

  describe('WagmiAdapter - switchNetwork', () => {
    it('should switch network successfully', async () => {
      await adapter.switchNetwork({
        caipNetwork: mockCaipNetworks[0]
      })

      expect(switchChain).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          chainId: 1
        })
      )
    })

    it('should respect preferred account type when switching network with AUTH provider', async () => {
      vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
        ...AccountController.state,
        preferredAccountTypes: {
          eip155: 'smartAccount'
        } as PreferredAccountTypes
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
      expect(mockAuthProvider.switchNetwork).toHaveBeenCalledWith('eip155:1')
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
        address: '0x123',
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
        address: '0x123' as `0x${string}`,
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
        onChange({ address: '0x123', status: 'connected' } as any, {} as any)
        return vi.fn()
      })

      vi.spyOn(wagmiCore, 'watchPendingTransactions').mockReturnValue(unsubscribe)

      new WagmiAdapter({
        networks: mockNetworks,
        projectId: mockProjectId,
        pendingTransactionsFilter: {
          enable: true,
          pollingInterval: 500
        }
      })

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
        chainId: 1
      } as unknown as wagmiCore.GetAccountReturnType

      const prevAccount = {
        status: 'connecting',
        address: '0x123',
        chainId: 1
      } as unknown as wagmiCore.GetAccountReturnType

      vi.mocked(watchAccount).mockImplementation((_, { onChange }) => {
        onChange(currAccount, prevAccount)
        return vi.fn()
      })

      const accountChangedSpy = vi.fn()

      adapter.on('accountChanged', accountChangedSpy)

      adapter['setupWatchers']()

      expect(accountChangedSpy).toHaveBeenCalledWith({
        address: currAccount.address,
        chainId: currAccount.chainId
      })
    })

    it('should emit accountChanged current address and previous address are not the same', async () => {
      const currAccount = {
        status: 'connected',
        address: '0x123',
        chainId: 1
      } as unknown as wagmiCore.GetAccountReturnType

      const prevAccount = {
        status: 'connected',
        address: '0x321',
        chainId: 1
      } as unknown as wagmiCore.GetAccountReturnType

      vi.mocked(watchAccount).mockImplementation((_, { onChange }) => {
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

      expect(accountChangedSpy).toHaveBeenCalledWith({
        address: currAccount.address,
        chainId: currAccount.chainId
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

      vi.mocked(watchAccount).mockImplementation((_, { onChange }) => {
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

      vi.mocked(watchAccount).mockImplementation((_, { onChange }) => {
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

      vi.mocked(watchAccount).mockImplementation((_, { onChange }) => {
        onChange(currAccount, prevAccount)
        return vi.fn()
      })

      const disconnectSpy = vi.fn()

      adapter.on('disconnect', disconnectSpy)

      adapter['setupWatchers']()

      expect(disconnectSpy).not.toHaveBeenCalled()
    })
  })
})
