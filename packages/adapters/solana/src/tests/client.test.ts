import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { SolanaAdapter } from '../client'
import { mockOptions } from './mocks/Options'
import mockAppKit from './mocks/AppKit'
import { mockAuthConnector } from './mocks/AuthConnector'
import { Connection } from '@solana/web3.js'
import { CaipNetworksUtil, SafeLocalStorage } from '@reown/appkit-common'
import { ProviderUtil } from '@reown/appkit/store'
import { SolHelpersUtil } from '@reown/appkit-utils/solana'
import { SolStoreUtil } from '../utils/SolanaStoreUtil.js'
import { WalletConnectProvider } from '../providers/WalletConnectProvider'
import UniversalProvider from '@walletconnect/universal-provider'
import { solana } from '@reown/appkit/networks'

vi.mock('@solana/web3.js', () => ({
  Connection: vi.fn(),
  PublicKey: vi.fn()
}))

vi.mock('@reown/appkit-wallet', () => ({
  W3mFrameProvider: vi.fn().mockImplementation(() => mockAuthConnector),
  W3mFrameHelpers: {
    checkIfRequestExists: vi.fn(),
    checkIfRequestIsSafe: vi.fn()
  },
  W3mFrameRpcConstants: {
    RPC_METHOD_NOT_ALLOWED_UI_MESSAGE: 'RPC method not allowed'
  }
}))

vi.mock('@reown/appkit/store', () => ({
  ProviderUtil: {
    setProvider: vi.fn(),
    setProviderId: vi.fn(),
    state: {
      providers: {}
    },
    getProvider: vi.fn(),
    subscribeProviders: vi.fn()
  }
}))

vi.mock('../utils/SolanaStoreUtil.js', () => ({
  SolStoreUtil: {
    setConnection: vi.fn(),
    state: {
      connection: null
    }
  }
}))

vi.mock('@reown/appkit-utils/solana', () => ({
  SolHelpersUtil: {
    getChainFromCaip: vi.fn(),
    detectRpcUrl: vi.fn()
  },
  SolConstantsUtil: {
    LAMPORTS_PER_SOL: 1_000_000_000
  }
}))

describe('SolanaAdapter', () => {
  let client: SolanaAdapter

  beforeEach(() => {
    vi.clearAllMocks()
    client = new SolanaAdapter({})
    client.construct(mockAppKit, mockOptions)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('SolanaAdapter - Initialization', () => {
    it('should initialize with default values', () => {
      expect(client.chainNamespace).toBe('solana')
      expect(client.adapterType).toBe('solana')
    })

    it('should set caipNetworks to provided caipNetworks options', () => {
      expect(client['caipNetworks']).toEqual(
        mockOptions.networks.map(n => ({
          ...n,
          rpcUrl: CaipNetworksUtil.extendRpcUrlWithProjectId(n.rpcUrl, mockOptions.projectId)
        }))
      )
    })

    it('should create network and connection controller clients', () => {
      expect(client.networkControllerClient).toBeDefined()
      expect(client.connectionControllerClient).toBeDefined()
    })
  })

  describe('SolanaAdapter - Network', () => {
    it('should switch network', async () => {
      vi.spyOn(SolStoreUtil.state, 'connection', 'get').mockReturnValue({
        getBalance: vi.fn()
      } as unknown as Connection)
      await client.switchNetwork(solana)

      expect(mockAppKit.setCaipNetwork).toHaveBeenCalledWith(solana)
    })

    it('should sync network', async () => {
      const mockAddress = 'DjPi1LtwrXJMAh2AUvuUMajCpMJEKg8N1J1PbLGjCH5B'
      vi.spyOn(mockAppKit, 'getCaipNetwork').mockReturnValue(solana)
      vi.spyOn(mockAppKit, 'getAddress').mockReturnValue(mockAddress)
      vi.spyOn(client as any, 'syncBalance')

      await client['syncNetwork']({ address: mockAddress })

      expect(mockAppKit.setAddressExplorerUrl).toHaveBeenCalledWith(
        `${solana.explorerUrl}/account/${mockAddress}`,
        'solana'
      )
      expect(client['syncBalance']).toHaveBeenCalledWith(mockAddress)
    })
  })

  describe('SolanaAdapter - Account', () => {
    it('should sync account', async () => {
      const mockAddress = 'DjPi1LtwrXJMAh2AUvuUMajCpMJEKg8N1J1PbLGjCH5B'
      vi.spyOn(mockAppKit, 'getAddress').mockReturnValue(mockAddress)
      vi.spyOn(mockAppKit, 'getCaipNetwork').mockReturnValue(solana)
      vi.spyOn(mockAppKit, 'getIsConnectedState').mockReturnValue(true)
      vi.spyOn(client as any, 'syncBalance').mockResolvedValue(undefined)

      await client['syncAccount']({ address: mockAddress })

      expect(SolStoreUtil.setConnection).toHaveBeenCalled()
      expect(client['syncBalance']).toHaveBeenCalledWith(mockAddress)
    })

    it('should sync balance', async () => {
      const mockAddress = 'DjPi1LtwrXJMAh2AUvuUMajCpMJEKg8N1J1PbLGjCH5B'
      const mockBalance = 1000000000
      vi.spyOn(SolStoreUtil.state, 'connection', 'get').mockReturnValue({
        getBalance: vi.fn().mockResolvedValue(mockBalance)
      } as unknown as Connection)
      vi.spyOn(mockAppKit, 'getCaipNetwork').mockReturnValue(solana)

      await client['syncBalance'](mockAddress)

      expect(mockAppKit.setBalance).toHaveBeenCalledWith('1', 'SOL', 'solana')
    })
  })

  describe('SolanaAdapter - Provider', () => {
    it('should set provider', async () => {
      const mockProvider = {
        connect: vi.fn().mockResolvedValue('DjPi1LtwrXJMAh2AUvuUMajCpMJEKg8N1J1PbLGjCH5B'),
        name: 'MockProvider',
        on: vi.fn(),
        chains: [{ chainId: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp' }]
      }
      vi.spyOn(SafeLocalStorage, 'getItem').mockReturnValue(
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'
      )
      vi.spyOn(SolHelpersUtil, 'getChainFromCaip').mockReturnValue(solana)

      await client['setProvider'](mockProvider as any)

      expect(mockAppKit.setCaipAddress).toHaveBeenCalledWith(
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:DjPi1LtwrXJMAh2AUvuUMajCpMJEKg8N1J1PbLGjCH5B',
        'solana'
      )
      expect(ProviderUtil.setProvider).toHaveBeenCalledWith('solana', mockProvider)
      expect(ProviderUtil.setProviderId).toHaveBeenCalledWith('solana', 'injected')
    })

    it('should add provider', () => {
      const mockProvider = {
        name: 'MockProvider',
        type: 'INJECTED',
        icon: 'mock-icon',
        chains: [{ chainId: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp' }]
      }
      client['addProvider'](mockProvider as any)

      expect(client['availableProviders']).toContain(mockProvider)
      expect(mockAppKit.setConnectors).toHaveBeenCalled()
    })
  })

  describe('SolanaAdapter - GetWalletConnectProvider', () => {
    it('should get Solana WalletConnect provider', () => {
      const mockUniversalProvider = {} as UniversalProvider
      const result = client['getSolanaWalletConnectProvider'](mockUniversalProvider)

      expect(result).toBeInstanceOf(WalletConnectProvider)
    })
  })

  describe('SolanaAdapter - Events', () => {
    it('should set up provider event listeners', () => {
      const mockProvider = {
        on: vi.fn(),
        removeListener: vi.fn()
      }

      client['watchProvider'](mockProvider as any)

      expect(mockProvider.on).toHaveBeenCalledWith('disconnect', expect.any(Function))
      expect(mockProvider.on).toHaveBeenCalledWith('accountsChanged', expect.any(Function))
      expect(mockProvider.on).toHaveBeenCalledWith('connect', expect.any(Function))
      expect(mockProvider.on).toHaveBeenCalledWith('auth_rpcRequest', expect.any(Function))
      expect(mockProvider.on).toHaveBeenCalledWith('auth_rpcSuccess', expect.any(Function))
      expect(mockProvider.on).toHaveBeenCalledWith('auth_rpcError', expect.any(Function))
    })
  })
})
