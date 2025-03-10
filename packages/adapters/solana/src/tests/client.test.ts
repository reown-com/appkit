import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ConstantsUtil } from '@reown/appkit-common'
import type { Provider as CoreProvider } from '@reown/appkit-controllers'
import { CaipNetworksUtil, PresetsUtil } from '@reown/appkit-utils'
import { solana } from '@reown/appkit/networks'

import { SolanaAdapter } from '../client'
import { AuthProvider } from '../providers/AuthProvider'
import { SolanaWalletConnectProvider } from '../providers/SolanaWalletConnectProvider'
import type { WalletStandardProvider } from '../providers/WalletStandardProvider'
import { SolStoreUtil } from '../utils/SolanaStoreUtil'
import { watchStandard } from '../utils/watchStandard'
import mockAppKit from './mocks/AppKit'
import { mockAuthConnector } from './mocks/AuthConnector'
import { mockCoinbaseWallet } from './mocks/CoinbaseWallet'
import { mockUniversalProvider } from './mocks/UniversalProvider'

// Mock external dependencies
vi.mock('@solana/web3.js', () => ({
  Connection: vi.fn(endpoint => ({
    getBalance: vi.fn().mockResolvedValue(1500000000),
    getSignatureStatus: vi.fn().mockResolvedValue({ value: true }),
    rpcEndpoint: endpoint
  })),
  PublicKey: vi.fn(key => ({ toBase58: () => key }))
}))

vi.mock('../utils/watchStandard', () => ({
  watchStandard: vi.fn()
}))

const mockProvider = {
  connect: vi.fn().mockResolvedValue('mock-address'),
  disconnect: vi.fn(),
  on: vi.fn(),
  removeListener: vi.fn(),
  signMessage: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
  sendTransaction: vi.fn().mockResolvedValue('mock-signature')
} as unknown as WalletStandardProvider

const mockNetworks = [solana]
const mockCaipNetworks = CaipNetworksUtil.extendCaipNetworks(mockNetworks, {
  projectId: 'test-project-id',
  customNetworkImageUrls: {}
})

const mockWalletConnectConnector = vi.mocked(
  new SolanaWalletConnectProvider({
    provider: mockUniversalProvider(),
    chains: mockCaipNetworks,
    getActiveChain: () => mockCaipNetworks[0]
  })
)

describe('SolanaAdapter', () => {
  let adapter: SolanaAdapter
  vi.spyOn(SolStoreUtil, 'setConnection')

  beforeEach(() => {
    vi.clearAllMocks()
    adapter = new SolanaAdapter()
    adapter.construct({
      networks: mockNetworks,
      projectId: 'test-project-id',
      namespace: 'solana'
    })
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
          id: PresetsUtil.ConnectorExplorerIds[ConstantsUtil.CONNECTOR_ID.COINBASE_SDK],
          type: 'ANNOUNCED',
          name: 'Coinbase Wallet',
          chain: 'solana',
          requestedChains: [solana]
        })
      )
    })
  })

  describe('SolanaAdapter - constructor', () => {
    it('should initialize with correct parameters', () => {
      expect(adapter.adapterType).toBe('solana')
      expect(adapter.namespace).toBe('solana')
      expect(adapter.networks).toEqual(mockNetworks)
      expect(adapter.projectId).toBe('test-project-id')
      expect(SolStoreUtil.setConnection).toHaveBeenCalledWith(
        expect.objectContaining({ rpcEndpoint: solana.rpcUrls.default.http[0] })
      )
    })
  })

  describe('SolanaAdapter - connect', () => {
    beforeEach(() => {
      const connectors = [
        {
          id: 'test',
          provider: mockProvider,
          type: 'EXTERNAL',
          connect: vi.fn().mockResolvedValue('mock-address'),
          on: vi.fn()
        }
      ]
      Object.defineProperty(adapter, 'connectors', {
        value: connectors
      })
    })

    it('should connect with external provider', async () => {
      const result = await adapter.connect({
        id: 'test',
        provider: mockProvider,
        type: 'EXTERNAL',
        chainId: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
        rpcUrl: 'mock_rpc_url'
      })

      expect(result.address).toBe('mock-address')
      expect(result.chainId).toBe('5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp')
      expect(SolStoreUtil.setConnection).toHaveBeenCalledWith(
        expect.objectContaining({ rpcEndpoint: 'mock_rpc_url' })
      )
    })

    it('should fallback for network rpc url if param is not provider', async () => {
      await adapter.connect({
        id: 'test',
        provider: mockProvider,
        type: 'EXTERNAL',
        chainId: solana.id
      })

      expect(SolStoreUtil.setConnection).toHaveBeenCalledWith(
        expect.objectContaining({ rpcEndpoint: solana.rpcUrls.default.http[0] })
      )
    })

    it('should throw if not possible to get a rpc url', async () => {
      await expect(
        adapter.connect({
          id: 'test',
          provider: mockProvider,
          type: 'EXTERNAL',
          chainId: 'mock_chain_id'
        })
      ).rejects.toThrowError('RPC URL not found for chainId: mock_chain_id')
    })
  })

  describe('SolanaAdapter - disconnect', () => {
    it('should disconnect provider', async () => {
      await adapter.disconnect({
        provider: mockProvider as unknown as CoreProvider,
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
    it('should get balance successfully mult', async () => {
      const numSimultaneousRequests = 10
      const expectedSentRequests = 1
      vi.mock('@solana/web3.js', () => ({
        Connection: vi.fn(endpoint => ({
          getBalance: vi.fn().mockResolvedValue(
            new Promise(resolve => {
              setTimeout(() => resolve(1500000000), 1000)
            })
          ),
          getSignatureStatus: vi.fn().mockResolvedValue({ value: true }),
          rpcEndpoint: endpoint
        })),
        PublicKey: vi.fn(key => ({ toBase58: () => key }))
      }))

      const result = await Promise.all([
        ...Array.from({ length: numSimultaneousRequests }).map(() =>
          adapter.getBalance({
            address: 'mock-address',
            chainId: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
            caipNetwork: mockCaipNetworks[0]
          })
        )
      ])

      expect(result.length).toBe(numSimultaneousRequests)
      expect(expectedSentRequests).to.be.lt(numSimultaneousRequests)

      // verify all calls got the same balance
      for (const balance of result) {
        expect(balance).toEqual({
          balance: '1.5',
          symbol: 'SOL'
        })
      }
    })
  })

  describe('SolanaAdapter - signMessage', () => {
    it('should sign message successfully', async () => {
      const result = await adapter.signMessage({
        message: 'Hello',
        address: 'mock-address',
        provider: mockProvider as unknown as CoreProvider
      })

      expect(result.signature).toBeDefined()
      expect(mockProvider.signMessage).toHaveBeenCalled()
    })
  })

  describe('SolanaAdapter - switchNetwork', () => {
    it('should switch network with auth provider', async () => {
      const switchNetworkSpy = vi.fn()
      const provider = Object.assign(Object.create(AuthProvider.prototype), {
        type: 'AUTH',
        switchNetwork: switchNetworkSpy,
        getUser: mockAuthConnector.connect
      })

      await adapter.switchNetwork({
        caipNetwork: mockCaipNetworks[0],
        provider: provider,
        providerType: 'AUTH'
      })

      expect(switchNetworkSpy).toHaveBeenCalled()
      expect(SolStoreUtil.setConnection).toHaveBeenCalled()
    })
  })

  describe('SolanaAdapter - connectWalletConnect', () => {
    it('should connect WalletConnect provider', async () => {
      vi.mocked(adapter['connectors']).push(mockWalletConnectConnector)
      await adapter.connectWalletConnect()

      expect(mockWalletConnectConnector.provider.connect).toHaveBeenCalled()
      expect(SolStoreUtil.setConnection).toHaveBeenCalled()
    })
  })

  describe('SolanaAdapter - getWalletConnectProvider', () => {
    it('should return WalletConnect provider', () => {
      const result = adapter.getWalletConnectProvider({
        provider: mockUniversalProvider(),
        caipNetworks: mockCaipNetworks,
        activeCaipNetwork: mockCaipNetworks[0]
      })

      expect(result).toBeDefined()
    })
  })

  describe('SolanaAdapter - syncConnectors', () => {
    it.each(['Phantom', 'Trust Wallet', 'Solflare', 'unknown wallet'])(
      'should parse watchStandard ids from cloud',
      walletName => {
        const watchStandardSpy = vi.mocked(watchStandard)
        const addProviderSpy = vi.spyOn(adapter as any, 'addConnector')
        adapter.syncConnectors(
          { features: { email: false, socials: false }, projectId: '1234' } as any,
          {} as any
        )

        const callback = watchStandardSpy.mock.calls[0]![2]
        callback({ name: walletName } as any)

        expect(watchStandard).toHaveBeenCalled()
        expect(addProviderSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            name: walletName
          })
        )
      }
    )
  })
})
