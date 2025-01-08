import { describe, it, expect, beforeEach, vi } from 'vitest'
import { WagmiAdapter } from '../client'
import type { Config } from '@wagmi/core'
import {
  getConnections,
  switchChain,
  getBalance,
  getEnsName,
  getEnsAvatar,
  signMessage,
  estimateGas,
  sendTransaction as wagmiSendTransaction,
  getEnsAddress as wagmiGetEnsAddress,
  writeContract as wagmiWriteContract,
  waitForTransactionReceipt,
  watchAccount,
  getAccount,
  watchPendingTransactions,
  http
} from '@wagmi/core'
import * as wagmiCore from '@wagmi/core'
import { mainnet } from '@wagmi/core/chains'
import { CaipNetworksUtil } from '@reown/appkit-utils'
import type UniversalProvider from '@walletconnect/universal-provider'
import { mockAppKit } from './mocks/AppKit'
import { ConstantsUtil } from '@reown/appkit-common'
import { LimitterUtil } from '../utils/LimitterUtil'

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
    getEnsName: vi.fn(),
    getEnsAvatar: vi.fn(),
    signMessage: vi.fn(),
    estimateGas: vi.fn(),
    sendTransaction: vi.fn(),
    getEnsAddress: vi.fn(),
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
      id: 'test-connector'
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

describe('WagmiAdapter', () => {
  let adapter: WagmiAdapter

  beforeEach(() => {
    vi.clearAllMocks()
    adapter = new WagmiAdapter({
      networks: mockNetworks,
      projectId: mockProjectId
    })
  })

  describe('WagmiAdapter - constructor and initialization', () => {
    it('should initialize with correct parameters', () => {
      expect(adapter.projectId).toBe(mockProjectId)
      expect(adapter.adapterType).toBe('wagmi')
      expect(adapter.namespace).toBe('eip155')
    })

    it('should set wagmi connectors', () => {
      vi.spyOn(wagmiCore, 'watchConnectors').mockImplementation(vi.fn())

      adapter.syncConnectors({ networks: [mainnet], projectId: 'YOUR_PROJECT_ID' }, mockAppKit)

      expect(adapter.connectors).toStrictEqual([
        {
          chain: 'eip155',
          chains: [],
          explorerId: undefined,
          id: 'test-connector',
          imageId: undefined,
          imageUrl: undefined,
          info: { rdns: 'test-connector' },
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
          [mainnet.id]: http('https://cloudflare-eth.com')
        }
      })

      expect(adapterWithCustomRpc.wagmiChains?.[0].rpcUrls.default.http[0]).toBe(
        `https://cloudflare-eth.com`
      )
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
        address: '0x123',
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

  describe('WagmiAdapter - getEnsAddress', () => {
    it('should resolve ENS address successfully', async () => {
      const mockAddress = '0x123'
      vi.mocked(wagmiGetEnsAddress).mockResolvedValue(mockAddress)

      const result = await adapter.getEnsAddress({
        name: 'test.eth',
        caipNetwork: mockCaipNetworks[0]
      })

      expect(result.address).toBe(mockAddress)
    })

    it('should return false for unresolvable ENS', async () => {
      vi.mocked(wagmiGetEnsAddress).mockResolvedValue(null)

      const result = await adapter.getEnsAddress({
        name: 'nonexistent.eth',
        caipNetwork: mockCaipNetworks[0]
      })

      expect(result.address).toBe(false)
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

  describe('WagmiAdapter - getProfile', () => {
    it('should get profile successfully', async () => {
      const mockEnsName = 'test.eth'
      const mockAvatar = 'https://avatar.com/test.jpg'

      vi.mocked(getEnsName).mockResolvedValue(mockEnsName)
      vi.mocked(getEnsAvatar).mockResolvedValue(mockAvatar)

      const result = await adapter.getProfile({
        address: '0x123',
        chainId: 1
      })

      expect(result).toEqual({
        profileName: mockEnsName,
        profileImage: mockAvatar
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
})
