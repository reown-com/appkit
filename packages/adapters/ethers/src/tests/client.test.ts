import { describe, it, expect, beforeEach, vi } from 'vitest'
import { EthersAdapter } from '../client'
import { CaipNetworksUtil } from '@reown/appkit-utils'
import type { Provider } from '@reown/appkit-core'
import type { W3mFrameProvider } from '@reown/appkit-wallet'
import UniversalProvider from '@walletconnect/universal-provider'
import { JsonRpcProvider, InfuraProvider } from 'ethers'
import { mainnet } from '@reown/appkit/networks'
import { EthersMethods } from '../utils/EthersMethods'
import { ProviderUtil } from '@reown/appkit/store'

// Mock external dependencies
vi.mock('ethers', async importOriginal => {
  const actual = await importOriginal<typeof import('ethers')>()
  return {
    ...actual,
    formatEther: vi.fn(() => '1.5'),
    InfuraProvider: vi.fn(() => ({
      lookupAddress: vi.fn(),
      getAvatar: vi.fn()
    })),
    JsonRpcProvider: vi.fn(() => ({
      getBalance: vi.fn()
    }))
  }
})

vi.mock('../utils/EthersMethods', () => ({
  EthersMethods: {
    signMessage: vi.fn(),
    sendTransaction: vi.fn(),
    writeContract: vi.fn(),
    estimateGas: vi.fn(),
    getEnsAddress: vi.fn(),
    parseUnits: vi.fn(),
    formatUnits: vi.fn(),
    hexStringToNumber: vi.fn(hex => parseInt(hex, 16)),
    numberToHexString: vi.fn(num => `0x${num.toString(16)}`)
  }
}))

const mockProvider = {
  request: vi.fn(),
  on: vi.fn(),
  removeListener: vi.fn()
} as unknown as Provider

const mockWalletConnectProvider = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  on: vi.fn(),
  removeListener: vi.fn(),
  session: true,
  setDefaultChain: vi.fn()
} as unknown as UniversalProvider

const mockAuthProvider = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  switchNetwork: vi.fn()
} as unknown as W3mFrameProvider

const mockNetworks = [mainnet]
const mockCaipNetworks = CaipNetworksUtil.extendCaipNetworks(mockNetworks, {
  projectId: 'test-project-id',
  customNetworkImageUrls: {}
})

describe('EthersAdapter', () => {
  let adapter: EthersAdapter

  beforeEach(() => {
    vi.clearAllMocks()
    adapter = new EthersAdapter()
  })

  describe('EthersAdapter -constructor', () => {
    it('should initialize with correct parameters', () => {
      expect(adapter.adapterType).toBe('ethers')
      expect(adapter.namespace).toBe('eip155')
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
  })

  describe('EthersAdapter - signMessage', () => {
    it('should sign message successfully', async () => {
      const mockSignature = '0xmocksignature'
      vi.mocked(EthersMethods.signMessage).mockResolvedValue(mockSignature)

      const result = await adapter.signMessage({
        message: 'Hello',
        address: '0x123',
        provider: mockProvider
      })

      expect(result.signature).toBe(mockSignature)
    })

    it('should throw error when provider is undefined', async () => {
      await expect(
        adapter.signMessage({
          message: 'Hello',
          address: '0x123'
        })
      ).rejects.toThrow('Provider is undefined')
    })
  })

  describe('EthersAdapter -sendTransaction', () => {
    it('should send transaction successfully', async () => {
      const mockTxHash = '0xtxhash'
      vi.mocked(EthersMethods.sendTransaction).mockResolvedValue(mockTxHash)

      const result = await adapter.sendTransaction({
        value: BigInt(1000),
        to: '0x456',
        data: '0x',
        gas: BigInt(21000),
        gasPrice: BigInt(2000000000),
        address: '0x123',
        provider: mockProvider,
        caipNetwork: mockCaipNetworks[0]
      })

      expect(result.hash).toBe(mockTxHash)
    })

    it('should throw error when provider is undefined', async () => {
      await expect(
        adapter.sendTransaction({
          value: BigInt(1000),
          to: '0x456',
          data: '0x',
          gas: BigInt(21000),
          gasPrice: BigInt(2000000000),
          address: '0x123'
        })
      ).rejects.toThrow('Provider is undefined')
    })
  })

  describe('EthersAdapter -writeContract', () => {
    it('should write contract successfully', async () => {
      const mockTxHash = '0xtxhash'
      vi.mocked(EthersMethods.writeContract).mockResolvedValue(mockTxHash)

      const result = await adapter.writeContract({
        abi: [],
        method: 'transfer',
        caipAddress: 'eip155:1:0x123',
        fromAddress: '0x123',
        receiverAddress: '0x456',
        tokenAmount: BigInt(1000),
        tokenAddress: '0x789',
        provider: mockProvider,
        caipNetwork: mockCaipNetworks[0]
      })

      expect(result.hash).toBe(mockTxHash)
    })
  })

  describe('EthersAdapter -connect', () => {
    it('should connect with external provider', async () => {
      vi.mocked(mockProvider.request).mockImplementation(request => {
        if (request.method === 'eth_requestAccounts') return Promise.resolve(['0x123'])
        if (request.method === 'eth_chainId') return Promise.resolve('0x1')
        return Promise.resolve(null)
      })
      const connectors = [
        {
          id: 'test',
          provider: mockProvider,
          chains: [1],
          type: 'EXTERNAL',
          chain: 1
        }
      ]
      Object.defineProperty(adapter, 'connectors', {
        value: connectors
      })

      const result = await adapter.connect({
        id: 'test',
        provider: mockProvider,
        type: 'EXTERNAL',
        chainId: 1
      })

      expect(result.address).toBe('0x123')
      expect(result.chainId).toBe(1)
    })
  })

  describe('EthersAdapter -disconnect', () => {
    it('should disconnect WalletConnect provider', async () => {
      await adapter.disconnect({
        provider: mockWalletConnectProvider,
        providerType: 'WALLET_CONNECT'
      })

      expect(mockWalletConnectProvider.disconnect).toHaveBeenCalled()
    })

    it('should disconnect Auth provider', async () => {
      await adapter.disconnect({
        provider: mockAuthProvider,
        providerType: 'AUTH'
      })

      expect(mockAuthProvider.disconnect).toHaveBeenCalled()
    })
  })

  describe('EthersAdapter -getBalance', () => {
    it('should get balance successfully', async () => {
      adapter.caipNetworks = mockCaipNetworks
      const mockBalance = BigInt(1500000000000000000)
      vi.mocked(JsonRpcProvider).mockImplementation(
        () =>
          ({
            getBalance: vi.fn().mockResolvedValue(mockBalance)
          }) as any
      )

      const result = await adapter.getBalance({
        address: '0x123',
        chainId: 1
      })

      expect(result).toEqual({
        balance: '1.5',
        symbol: 'ETH'
      })
    })
  })

  describe('EthersAdapter -getProfile', () => {
    it('should get profile successfully', async () => {
      const mockEnsName = 'test.eth'
      const mockAvatar = 'https://avatar.com/test.jpg'

      vi.mocked(InfuraProvider).mockImplementation(
        () =>
          ({
            lookupAddress: vi.fn().mockResolvedValue(mockEnsName),
            getAvatar: vi.fn().mockResolvedValue(mockAvatar)
          }) as any
      )

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

  describe('EthersAdapter - switchNetwork', () => {
    it('should switch network with WalletConnect provider', async () => {
      await adapter.switchNetwork({
        caipNetwork: mockCaipNetworks[0],
        provider: mockWalletConnectProvider,
        providerType: 'WALLET_CONNECT'
      })

      expect(mockWalletConnectProvider.setDefaultChain).toHaveBeenCalledWith('eip155:1')
    })

    it('should switch network with Auth provider', async () => {
      await adapter.switchNetwork({
        caipNetwork: mockCaipNetworks[0],
        provider: mockAuthProvider,
        providerType: 'AUTH'
      })

      expect(mockAuthProvider.switchNetwork).toHaveBeenCalledWith(1)
      expect(mockAuthProvider.connect).toHaveBeenCalledWith({ chainId: 1 })
    })
  })

  describe('EthersAdapter -getWalletConnectProvider', () => {
    it('should return WalletConnect provider', () => {
      Object.defineProperty(adapter, 'availableConnectors', {
        value: [
          {
            id: 'walletconnect',
            type: 'WALLET_CONNECT',
            provider: mockWalletConnectProvider,
            chain: 'eip155',
            chains: []
          }
        ]
      })

      const result = adapter.getWalletConnectProvider()
      expect(result).toBe(mockWalletConnectProvider)
    })
  })

  describe('EthersAdapter -parseUnits and formatUnits', () => {
    it('should parse units correctly', () => {
      const mockBigInt = BigInt('1500000000000000000')
      vi.mocked(EthersMethods.parseUnits).mockReturnValue(mockBigInt)

      const result = adapter.parseUnits({
        value: '1.5',
        decimals: 18
      })

      expect(result).toBe(mockBigInt)
    })

    it('should format units correctly', () => {
      vi.mocked(EthersMethods.formatUnits).mockReturnValue('1.5')

      const result = adapter.formatUnits({
        value: BigInt('1500000000000000000'),
        decimals: 18
      })

      expect(result).toBe('1.5')
    })
  })

  describe('EthersAdapter - Permissions', () => {
    const mockProvider = {
      request: vi.fn()
    } as unknown as UniversalProvider

    beforeEach(() => {
      vi.spyOn(ProviderUtil, 'getProvider').mockImplementation(() => mockProvider)
    })

    it('should call wallet_getCapabilities', async () => {
      await adapter.getCapabilities('eip155:1:0x123')

      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'wallet_getCapabilities',
        params: ['eip155:1:0x123']
      })
    })

    it('should call wallet_grantPermissions', async () => {
      const mockParams = {
        pci: 'test-pci',
        expiry: 1234567890,
        address: '0x123',
        permissions: ['eth_accounts']
      }

      await adapter.grantPermissions(mockParams)

      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'wallet_grantPermissions',
        params: mockParams
      })
    })

    it('should call wallet_revokePermissions', async () => {
      vi.mocked(mockProvider.request).mockImplementation(() =>
        Promise.resolve('0x123' as `0x${string}`)
      )

      const mockParams = {
        pci: 'test-pci',
        expiry: 1234567890,
        address: '0x123' as `0x${string}`,
        permissions: ['eth_accounts']
      }

      const result = await adapter.revokePermissions(mockParams)

      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'wallet_revokePermissions',
        params: [mockParams]
      })
      expect(result).toBe('0x123')
    })
  })
})
