import UniversalProvider from '@walletconnect/universal-provider'
import { InfuraProvider, JsonRpcProvider } from 'ethers'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { WcConstantsUtil } from '@reown/appkit'
import { ConstantsUtil as CommonConstantsUtil, Emitter } from '@reown/appkit-common'
import {
  AccountController,
  ChainController,
  type ConnectionControllerClient,
  type NetworkControllerClient,
  type Provider
} from '@reown/appkit-controllers'
import { CaipNetworksUtil } from '@reown/appkit-utils'
import { ProviderUtil } from '@reown/appkit-utils'
import type { W3mFrameProvider } from '@reown/appkit-wallet'
import { mainnet, polygon } from '@reown/appkit/networks'

import { EthersAdapter } from '../client'
import { EthersMethods } from '../utils/EthersMethods'

class ErrorWithCode extends Error {
  code: number

  constructor(message: string, code: number) {
    super(message)
    this.code = code
  }
}

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
    })),
    BrowserProvider: vi.fn(() => ({
      on: vi.fn((event, callback) => {
        if (event === 'pending') {
          callback()
        }
      })
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
  switchNetwork: vi.fn(),
  getUser: vi.fn()
} as unknown as W3mFrameProvider

const mockNetworks = [mainnet, polygon]
const mockCaipNetworks = CaipNetworksUtil.extendCaipNetworks(mockNetworks, {
  projectId: 'test-project-id',
  customNetworkImageUrls: {}
})

describe('EthersAdapter', () => {
  let adapter: EthersAdapter

  beforeAll(() => {})

  beforeEach(() => {
    vi.clearAllMocks()
    adapter = new EthersAdapter()
    ChainController.initialize([adapter], mockCaipNetworks, {
      connectionControllerClient: vi.fn() as unknown as ConnectionControllerClient,
      networkControllerClient: vi.fn() as unknown as NetworkControllerClient
    })
    ChainController.setRequestedCaipNetworks(mockCaipNetworks, 'eip155')
  })

  describe('EthersAdapter -constructor', () => {
    it('should set adapterType', () => {
      expect(adapter.adapterType).toEqual(CommonConstantsUtil.ADAPTER_TYPES.ETHERS)
    })

    it('should set namespace', () => {
      expect(adapter.namespace).toEqual(CommonConstantsUtil.CHAIN.EVM)
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
      vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
        ...AccountController.state,
        caipAddress: 'eip155:1:0x123'
      })
      const result = await adapter.sendTransaction({
        value: BigInt(1000),
        to: '0x456',
        data: '0x',
        gas: BigInt(21000),
        gasPrice: BigInt(2000000000),
        provider: mockProvider,
        caipNetwork: mockCaipNetworks[0]
      })

      expect(result.hash).toBe(mockTxHash)
    })

    it('should throw error when provider is undefined', async () => {
      vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
        ...AccountController.state,
        caipAddress: 'eip155:1:0x123'
      })
      await expect(
        adapter.sendTransaction({
          value: BigInt(1000),
          to: '0x456',
          data: '0x',
          gas: BigInt(21000),
          gasPrice: BigInt(2000000000)
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
        args: ['0x789', BigInt(1000)],
        tokenAddress: '0x789',
        provider: mockProvider,
        caipNetwork: mockCaipNetworks[0],
        chainNamespace: 'eip155'
      })

      expect(result.hash).toBe(mockTxHash)
    })
  })

  describe('EthersAdapter -connect', () => {
    it('should connect with external provider', async () => {
      vi.mocked(mockProvider.request).mockImplementation(request => {
        if (request.method === 'eth_requestAccounts') return Promise.resolve(['0x123'])
        if (request.method === 'eth_chainId') return Promise.resolve('0x1')
        if (request.method === 'wallet_switchEthereumChain') return Promise.resolve(null)
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

    it('should call switch network if wallet chain id is different than requested chain id', async () => {
      vi.mocked(mockProvider.request).mockImplementation(request => {
        if (request.method === 'eth_requestAccounts') return Promise.resolve(['0x123'])
        if (request.method === 'eth_chainId') return Promise.resolve('137') // Return a different chain id
        if (request.method === 'wallet_switchEthereumChain') return Promise.resolve(null)
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

      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1' }]
      })

      expect(result.address).toBe('0x123')
      expect(result.chainId).toBe(1)
    })

    it('should respect preferredAccountType when calling connect with AUTH provider', async () => {
      vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
        ...AccountController.state,
        preferredAccountTypes: {
          eip155: 'smartAccount'
        }
      })

      const ethersAdapter = new EthersAdapter()

      const connect = vi.fn().mockResolvedValue({ address: '0x123' })

      const mockAuthProviderWithConnect = {
        ...mockAuthProvider,
        connect
      } as unknown as W3mFrameProvider

      Object.defineProperty(ethersAdapter, 'connectors', {
        value: [
          {
            id: 'test',
            provider: mockAuthProviderWithConnect,
            chains: [1],
            type: 'AUTH',
            chain: 1
          }
        ]
      })

      await ethersAdapter.connect({
        id: 'test',
        type: 'AUTH',
        chainId: 1
      })

      expect(connect).toHaveBeenCalledWith({
        chainId: 1,
        preferredAccountType: 'smartAccount'
      })
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

    it('should call getBalance once even when multiple adapter requests are sent at the same time', async () => {
      const mockBalance = BigInt(1500000000000000000)
      // delay the response to simulate http request latency
      const latency = 1000
      const numSimultaneousRequests = 10
      const expectedSentRequests = 1
      let mockedImplementationCalls = 0
      vi.mocked(JsonRpcProvider).mockImplementation(
        () =>
          ({
            getBalance: vi.fn().mockResolvedValue(
              new Promise(resolve => {
                mockedImplementationCalls++
                setTimeout(() => resolve(mockBalance), latency)
              })
            )
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

      expect(mockedImplementationCalls).to.eql(expectedSentRequests)
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
    const errorCodes = [
      WcConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID,
      WcConstantsUtil.ERROR_INVALID_CHAIN_ID,
      WcConstantsUtil.ERROR_CODE_DEFAULT,
      { data: { originalError: { code: WcConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID } } }
    ]

    errorCodes.forEach(errorCode => {
      it(`should add Ethereum chain when switch fails with error code: ${JSON.stringify(
        errorCode
      )}`, async () => {
        // Mock request so that switchEthereumChain throws with the current error code
        vi.mocked(mockProvider.request).mockImplementation(request => {
          if (request.method === 'wallet_switchEthereumChain') {
            if (typeof errorCode === 'object') {
              const error = new Error('Chain switch failed')
              Object.assign(error, errorCode)
              throw error
            }
            throw new ErrorWithCode('Chain switch failed', errorCode)
          }
          return Promise.resolve(null)
        })

        const mockCaipNetwork = mockCaipNetworks[0]
        await adapter.switchNetwork({
          caipNetwork: mockCaipNetwork,
          provider: mockProvider,
          providerType: 'EXTERNAL'
        })

        expect(mockProvider.request).toHaveBeenCalledWith({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0x1',
              rpcUrls: [mockCaipNetwork.rpcUrls['chainDefault']?.http[0]],
              chainName: 'Ethereum',
              iconUrls: ['ba0ba0cd-17c6-4806-ad93-f9d174f17900'],
              nativeCurrency: {
                name: 'Ether',
                decimals: 18,
                symbol: 'ETH'
              },
              blockExplorerUrls: ['https://etherscan.io']
            }
          ]
        })
      })
    })

    it('should switch network with Auth provider', async () => {
      await adapter.switchNetwork({
        caipNetwork: mockCaipNetworks[0],
        provider: mockAuthProvider,
        providerType: 'AUTH'
      })

      expect(mockAuthProvider.switchNetwork).toHaveBeenCalledWith('eip155:1')
      expect(mockAuthProvider.getUser).toHaveBeenCalledWith({
        chainId: 'eip155:1',
        preferredAccountType: 'smartAccount'
      })
    })

    it('should add Ethereum chain with external provider and use chain default', async () => {
      // Mock request so that switchEthereumChain throws with code: WcConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID
      vi.mocked(mockProvider.request).mockImplementation(request => {
        if (request.method === 'wallet_switchEthereumChain') {
          throw new ErrorWithCode(
            'Chain switch failed',
            WcConstantsUtil.ERROR_CODE_UNRECOGNIZED_CHAIN_ID
          )
        }
        // Mock add chain to also fail
        if (request.method === 'wallet_addEthereumChain') {
          throw new Error('Chain is not supported')
        }
        return Promise.resolve(null)
      })

      const mockCaipNetwork = mockCaipNetworks[0]
      await expect(
        adapter.switchNetwork({
          caipNetwork: mockCaipNetwork,
          provider: mockProvider,
          providerType: 'EXTERNAL'
        })
      ).rejects.toThrow('Chain is not supported')
    })

    it('should call setDefaultChain and request from provider for WALLET_CONNECT', async () => {
      const adapter = new EthersAdapter()

      const mockProvider = {
        request: vi.fn(),
        setDefaultChain: vi.fn()
      } as unknown as UniversalProvider

      const params = {
        caipNetwork: {
          id: 1,
          caipNetworkId: 'eip155:1'
        },
        provider: mockProvider,
        providerType: 'WALLET_CONNECT'
      } as unknown as any

      await adapter.switchNetwork(params)

      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1' }]
      })
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

  describe('EthersAdapter - provider listener', () => {
    it('should disconnect if accountsChanged event emits no accounts', async () => {
      const emitter = new Emitter()

      const mockProvider = {
        connect: vi.fn(),
        request: vi.fn().mockResolvedValue(['0x123']),
        removeListener: vi.fn(),
        on: emitter.on.bind(emitter),
        off: emitter.off.bind(emitter),
        emit: emitter.emit.bind(emitter)
      } as unknown as Provider

      Object.defineProperty(adapter, 'connectors', {
        value: [{ id: 'test', provider: mockProvider }]
      })

      await adapter.connect({
        id: 'test',
        type: 'EXTERNAL',
        chainId: 1
      })

      const disconnect = vi.fn()

      adapter.on('disconnect', disconnect)

      mockProvider.emit('accountsChanged', [])

      expect(disconnect).toHaveBeenCalled()
      expect(mockProvider.removeListener).toHaveBeenCalledWith('disconnect', expect.any(Function))
    })
  })
})
