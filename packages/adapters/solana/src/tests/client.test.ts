import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SolanaAdapter } from '../client'
import { CaipNetworksUtil } from '@reown/appkit-utils'
import { solana } from '@reown/appkit/networks'
import { type Provider } from '@reown/appkit-core'
import type { W3mFrameProvider } from '@reown/appkit-wallet'
import UniversalProvider from '@walletconnect/universal-provider'
import { SolStoreUtil } from '../utils/SolanaStoreUtil'
import type { WalletStandardProvider } from '../providers/WalletStandardProvider'
import mockAppKit from './mocks/AppKit'
import { mockCoinbaseWallet } from './mocks/CoinbaseWallet'

// Mock external dependencies
vi.mock('@solana/web3.js', () => ({
  Connection: vi.fn(() => ({
    getBalance: vi.fn().mockResolvedValue(1500000000),
    getSignatureStatus: vi.fn().mockResolvedValue({ value: true })
  })),
  PublicKey: vi.fn(key => ({ toBase58: () => key }))
}))

vi.mock('../utils/SolanaStoreUtil', () => ({
  SolStoreUtil: {
    state: {
      connection: null
    },
    setConnection: vi.fn()
  }
}))

const mockProvider = {
  connect: vi.fn().mockResolvedValue('mock-address'),
  disconnect: vi.fn(),
  on: vi.fn(),
  removeListener: vi.fn(),
  signMessage: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
  sendTransaction: vi.fn().mockResolvedValue('mock-signature')
} as unknown as WalletStandardProvider

const mockWalletConnectProvider = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  on: vi.fn(),
  removeListener: vi.fn(),
  session: true,
  setDefaultChain: vi.fn()
} as unknown as UniversalProvider

const mockAuthProvider = {
  id: 'auth',
  connect: vi.fn().mockResolvedValue('mock-auth-address'),
  disconnect: vi.fn(),
  switchNetwork: vi.fn(),
  getUser: vi.fn().mockResolvedValue({
    address: 'mock-auth-address',
    chainId: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'
  })
} as unknown as W3mFrameProvider

const mockNetworks = [solana]
const mockCaipNetworks = CaipNetworksUtil.extendCaipNetworks(mockNetworks, {
  projectId: 'test-project-id',
  customNetworkImageUrls: {}
})

vi.mock('@reown/appkit/adapters', () => {
  class AdapterBlueprintMock {
    addConnector = vi.fn()
    emit = vi.fn()
  }

  return { AdapterBlueprint: AdapterBlueprintMock }
})

describe('SolanaAdapter', () => {
  let adapter: SolanaAdapter

  beforeEach(() => {
    vi.clearAllMocks()
    adapter = new SolanaAdapter()
  })

  describe('SolanaAdapter - syncConnectors', () => {
    it('should not add coinbase connector if window.coinbaseSolana does not exist', async () => {
      const addConnectorSpy = vi.spyOn(adapter, 'addConnector' as any)
      adapter.syncConnectors(
        { networks: [solana], projectId: '123', features: { email: false } },
        mockAppKit
      )
      expect(addConnectorSpy).not.toHaveBeenCalled()
    })

    it('should add coinbase connector if window.coinbaseSolana exist', async () => {
      ;(window as any).coinbaseSolana = mockCoinbaseWallet()
      const addConnectorSpy = vi.spyOn(adapter, 'addConnector' as any)
      adapter.syncConnectors(
        { networks: [solana], projectId: '123', features: { email: false } },
        mockAppKit
      )
      expect(addConnectorSpy).toHaveBeenCalledOnce()
      expect(addConnectorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'coinbaseWallet',
          type: 'EXTERNAL',
          name: 'Coinbase Wallet',
          chain: 'solana',
          chains: []
        })
      )
    })
  })

  describe('SolanaAdapter - constructor', () => {
    it('should initialize with correct parameters', () => {
      expect(adapter.adapterType).toBe('solana')
      expect(adapter.namespace).toBe('solana')
    })
  })

  describe('SolanaAdapter - connect', () => {
    it('should connect with external provider', async () => {
      const connectors = [
        {
          id: 'test',
          provider: mockProvider,
          type: 'EXTERNAL'
        }
      ]
      Object.defineProperty(adapter, 'connectors', {
        value: connectors
      })

      const result = await adapter.connect({
        id: 'test',
        provider: mockProvider,
        type: 'EXTERNAL',
        chainId: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
        rpcUrl: 'https://api.mainnet-beta.solana.com'
      })

      expect(result.address).toBe('mock-address')
      expect(result.chainId).toBe('5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp')
      expect(SolStoreUtil.setConnection).toHaveBeenCalled()
    })
  })

  describe('SolanaAdapter - disconnect', () => {
    it('should disconnect provider', async () => {
      await adapter.disconnect({
        provider: mockProvider as unknown as Provider,
        providerType: 'EXTERNAL'
      })

      expect(mockProvider.disconnect).toHaveBeenCalled()
    })
  })

  describe('SolanaAdapter - getBalance', () => {
    it('should get balance successfully', async () => {
      const result = await adapter.getBalance({
        address: 'mock-address',
        chainId: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
        caipNetwork: mockCaipNetworks[0]
      })

      expect(result).toEqual({
        balance: '1.5',
        symbol: 'SOL'
      })
    })
  })

  describe('SolanaAdapter - signMessage', () => {
    it('should sign message successfully', async () => {
      const result = await adapter.signMessage({
        message: 'Hello',
        address: 'mock-address',
        provider: mockProvider as unknown as Provider
      })

      expect(result.signature).toBeDefined()
      expect(mockProvider.signMessage).toHaveBeenCalled()
    })
  })

  describe('SolanaAdapter - switchNetwork', () => {
    it('should switch network with auth provider', async () => {
      await adapter.switchNetwork({
        caipNetwork: mockCaipNetworks[0],
        provider: mockAuthProvider,
        providerType: 'ID_AUTH'
      })

      expect(mockAuthProvider.switchNetwork).toHaveBeenCalled()
      expect(SolStoreUtil.setConnection).toHaveBeenCalled()
    })
  })

  describe('SolanaAdapter - getWalletConnectProvider', () => {
    it('should return WalletConnect provider', () => {
      const result = adapter.getWalletConnectProvider({
        provider: mockWalletConnectProvider,
        caipNetworks: mockCaipNetworks,
        activeCaipNetwork: mockCaipNetworks[0]
      })

      expect(result).toBeDefined()
    })
  })
})
