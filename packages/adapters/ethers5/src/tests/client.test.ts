import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { Ethers5Adapter } from '../client'
import type { EIP6963ProviderDetail } from '../client'
import { mockOptions } from './mocks/Options'
import { mockCreateEthersConfig } from './mocks/EthersConfig'
import mockAppKit from './mocks/AppKit'
import { mockAuthConnector } from './mocks/AuthConnector'
import { EthersHelpersUtil, type ProviderId, type ProviderType } from '@reown/appkit-utils/ethers'
import { ConstantsUtil } from '@reown/appkit-utils'
import { arbitrum, mainnet, polygon } from '@reown/appkit/networks'
import { ProviderUtil } from '@reown/appkit/store'
import { CaipNetworksUtil, SafeLocalStorage } from '@reown/appkit-common'
import { WcConstantsUtil, type BlockchainApiLookupEnsName } from '@reown/appkit'
import { ethers } from 'ethers5'
import type { CaipNetwork, ChainNamespace } from '@reown/appkit-common'

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

vi.mock('@reown/appkit-utils', () => {
  const INJECTED_CONNECTOR_ID = 'injected'
  const COINBASE_SDK_CONNECTOR_ID = 'coinbaseWallet'
  const EIP6963_CONNECTOR_ID = 'eip6963'
  const WALLET_CONNECT_CONNECTOR_ID = 'walletConnect'
  const AUTH_CONNECTOR_ID = 'w3mAuth'
  return {
    PresetsUtil: {
      ConnectorTypesMap: {
        [INJECTED_CONNECTOR_ID]: 'INJECTED',
        [COINBASE_SDK_CONNECTOR_ID]: 'EXTERNAL',
        [EIP6963_CONNECTOR_ID]: 'INJECTED'
      },
      ConnectorExplorerIds: {
        [INJECTED_CONNECTOR_ID]: 'injected-explorer',
        [COINBASE_SDK_CONNECTOR_ID]: 'coinbase-explorer',
        [EIP6963_CONNECTOR_ID]: 'eip6963-explorer'
      },
      ConnectorImageIds: {
        [INJECTED_CONNECTOR_ID]: 'injected-image',
        [COINBASE_SDK_CONNECTOR_ID]: 'coinbase-image',
        [EIP6963_CONNECTOR_ID]: 'eip6963-image'
      },
      ConnectorNamesMap: {
        [INJECTED_CONNECTOR_ID]: 'Injected',
        [COINBASE_SDK_CONNECTOR_ID]: 'Coinbase',
        [EIP6963_CONNECTOR_ID]: 'EIP6963'
      },
      WalletConnectRpcChainIds: [1, 137, 10, 42161, 56, 43114, 250, 25, 1313161554, 1284]
    },
    ConstantsUtil: {
      INJECTED_CONNECTOR_ID,
      COINBASE_SDK_CONNECTOR_ID,
      EIP6963_CONNECTOR_ID,
      WALLET_CONNECT_CONNECTOR_ID,
      AUTH_CONNECTOR_ID,
      EIP155: 'eip155'
    },
    HelpersUtil: {
      getCaipTokens: vi.fn().mockReturnValue([])
    }
  }
})

vi.mock('@reown/appkit/store', () => ({
  ProviderUtil: {
    setProvider: vi.fn(),
    setProviderId: vi.fn(),
    state: {
      providerIds: {}
    },
    getProvider: vi.fn()
  }
}))

vi.mock('ethers5', async () => {
  return {
    ethers: {
      providers: {
        InfuraProvider: vi.fn(),
        JsonRpcProvider: vi.fn()
      },
      utils: {
        formatEther: vi.fn().mockReturnValue('1.0'),
        parseUnits: vi.fn(),
        formatUnits: vi.fn()
      }
    }
  }
})

describe('EthersAdapter', () => {
  let client: Ethers5Adapter

  beforeEach(() => {
    vi.clearAllMocks()
    client = new Ethers5Adapter()
    const optionsWithEthersConfig = {
      ...mockOptions,
      ethersConfig: mockCreateEthersConfig()
    }
    client.construct(mockAppKit, optionsWithEthersConfig)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('EthersClient - Initialization', () => {
    it('should initialize with default values', () => {
      expect(client.chainNamespace).toBe('eip155')
      expect(client.adapterType).toBe('ethers')
    })

    it('should set caipNetworks to provided caipNetworks options', () => {
      expect(client.caipNetworks).toEqual(
        mockOptions.networks.map(n => ({
          ...n,
          rpcUrl: CaipNetworksUtil.extendRpcUrlWithProjectId(n.rpcUrl, mockOptions.projectId)
        }))
      )
    })

    it('should set defaultNetwork to first caipNetwork option', () => {
      expect(client.defaultCaipNetwork).toEqual(mockOptions.networks[0])
    })

    it('should create ethers config', () => {
      expect(client['ethersConfig']).toBeDefined()
    })
  })

  describe('EthersClient - Networks', () => {
    const mockProvider = {
      request: vi.fn(),
      on: vi.fn(),
      removeListener: vi.fn()
    }

    beforeEach(() => {
      vi.spyOn(ProviderUtil, 'getProvider').mockReturnValue(mockProvider)
      vi.spyOn(ProviderUtil.state, 'providerIds', 'get').mockReturnValue({
        eip155: 'injected',
        solana: undefined,
        polkadot: undefined
      })
    })

    it('should switch network for injected provider', async () => {
      const newNetwork = {
        id: 'eip155:137',
        name: 'Polygon',
        chainId: '137',
        rpcUrl: 'https://polygon-rpc.com'
      } as unknown as CaipNetwork

      mockProvider.request.mockResolvedValueOnce(null)

      await client.switchNetwork(newNetwork)

      expect(mockProvider.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'wallet_switchEthereumChain',
          params: expect.arrayContaining([
            expect.objectContaining({
              chainId: expect.stringMatching(/^0x/)
            })
          ])
        })
      )
      expect(mockAppKit.setCaipNetwork).toHaveBeenCalledWith(newNetwork)
    })

    it('should add network if not recognized by wallet', async () => {
      const newNetwork = {
        id: 'eip155:42161',
        name: 'Arbitrum One',
        chainId: '42161',
        rpcUrl: 'https://arb1.arbitrum.io/rpc'
      } as unknown as CaipNetwork

      const switchError = { code: 4902 }
      mockProvider.request.mockRejectedValueOnce(switchError)
      mockProvider.request.mockResolvedValueOnce(null)

      await client.switchNetwork(newNetwork)

      expect(mockProvider.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'wallet_addEthereumChain',
          params: expect.arrayContaining([
            expect.objectContaining({
              chainId: expect.stringMatching(/^0x/)
            })
          ])
        })
      )
    })

    it('should throw error if switching fails', async () => {
      const newNetwork = {
        id: 'eip155:56',
        name: 'Binance Smart Chain',
        chainId: '56',
        rpcUrl: 'https://bsc-dataseed.binance.org'
      } as unknown as CaipNetwork

      const switchError = new Error('User rejected the request')
      mockProvider.request.mockRejectedValueOnce(switchError)

      await expect(client.switchNetwork(newNetwork)).rejects.toThrow('Chain is not supported')
    })

    it('should use universal adapter for WalletConnect', async () => {
      vi.spyOn(ProviderUtil.state, 'providerIds', 'get').mockReturnValue({
        eip155: 'walletConnect',
        solana: undefined,
        polkadot: undefined
      })

      const newNetwork = {
        id: 'eip155:10',
        name: 'Optimism',
        chainId: '10',
        rpcUrl: 'https://mainnet.optimism.io'
      } as unknown as CaipNetwork

      await client.switchNetwork(newNetwork)

      expect(
        mockAppKit.universalAdapter?.networkControllerClient.switchCaipNetwork
      ).toHaveBeenCalledWith(newNetwork)
    })

    it('should set requested CAIP networks for each unique chain namespace', () => {
      const caipNetworks = [mainnet, arbitrum, polygon]

      client['syncRequestedNetworks'](caipNetworks)

      expect(mockAppKit.setRequestedCaipNetworks).toHaveBeenCalledWith(
        [mainnet, arbitrum, polygon],
        'eip155'
      )
    })
  })

  describe('EthersClient - Auth Connector', () => {
    it('should sync auth connector', async () => {
      const projectId = 'test-project-id'

      await client['syncAuthConnector'](projectId, true)

      expect(mockAppKit.addConnector).toHaveBeenCalledWith({
        id: ConstantsUtil.AUTH_CONNECTOR_ID,
        type: 'AUTH',
        name: 'Auth',
        provider: expect.any(Object),
        chain: 'eip155'
      })
      expect(mockAppKit.setLoading).toHaveBeenCalledWith(false)
    })

    describe('Auth Connector Handle Requests', () => {
      beforeEach(() => {
        client['appKit'] = mockAppKit
      })

      it.skip('should handle RPC request correctly when modal is closed', () => {
        vi.spyOn(mockAppKit, 'isOpen').mockReturnValue(false)
        mockAppKit['handleUnsafeRPCRequest']()
        expect(mockAppKit.open).toHaveBeenCalledWith({ view: 'ApproveTransaction' })
      })

      it.skip('should handle RPC request correctly when modal is open and transaction stack is not empty', () => {
        vi.spyOn(mockAppKit, 'isOpen').mockReturnValue(true)
        vi.spyOn(mockAppKit, 'isTransactionStackEmpty').mockReturnValue(false)
        vi.spyOn(mockAppKit, 'isTransactionShouldReplaceView').mockReturnValue(true)
        mockAppKit['handleUnsafeRPCRequest']()
        expect(mockAppKit.redirect).toHaveBeenCalledWith('ApproveTransaction')
      })

      it('should handle invalid auth request', () => {
        vi.useFakeTimers()
        client['handleInvalidAuthRequest']()
        expect(mockAppKit.open).toHaveBeenCalled()
        vi.advanceTimersByTime(300)
        expect(mockAppKit.showErrorMessage).toHaveBeenCalledWith('RPC method not allowed')
        vi.useRealTimers()
      })

      it('should handle auth RPC error when modal is open and transaction stack is empty', () => {
        vi.spyOn(mockAppKit, 'isOpen').mockReturnValue(true)
        vi.spyOn(mockAppKit, 'isTransactionStackEmpty').mockReturnValue(true)
        client['handleAuthRpcError']()
        expect(mockAppKit.close).toHaveBeenCalled()
      })

      it('should handle auth RPC error when modal is open and transaction stack is not empty', () => {
        vi.spyOn(mockAppKit, 'isOpen').mockReturnValue(true)
        vi.spyOn(mockAppKit, 'isTransactionStackEmpty').mockReturnValue(false)
        client['handleAuthRpcError']()
        expect(mockAppKit.popTransactionStack).toHaveBeenCalledWith(true)
      })

      it('should handle auth RPC success when transaction stack is empty', () => {
        vi.spyOn(mockAppKit, 'isTransactionStackEmpty').mockReturnValue(true)
        client['handleAuthRpcSuccess'](
          { type: '@w3m-frame/SWITCH_NETWORK_SUCCESS', payload: { chainId: '137' } },
          { method: 'eth_accounts' }
        )
        expect(mockAppKit.close).toHaveBeenCalled()
      })

      it('should handle auth RPC success when transaction stack is not empty', () => {
        vi.spyOn(mockAppKit, 'isTransactionStackEmpty').mockReturnValue(false)
        client['handleAuthRpcSuccess'](
          { type: '@w3m-frame/SWITCH_NETWORK_SUCCESS', payload: { chainId: '137' } },
          { method: 'eth_accounts' }
        )
        expect(mockAppKit.popTransactionStack).toHaveBeenCalledWith()
      })

      it('should handle auth not connected', () => {
        client['handleAuthNotConnected']()
        expect(mockAppKit.setCaipAddress).toHaveBeenCalledWith(undefined, 'eip155')
      })

      it('should handle auth is connected', () => {
        vi.spyOn(mockAppKit, 'getActiveChainNamespace').mockReturnValue('eip155')
        const preferredAccountType = 'eoa'
        client['handleAuthIsConnected'](preferredAccountType)
        expect(mockAppKit.setPreferredAccountType).toHaveBeenCalledWith(
          preferredAccountType,
          'eip155'
        )
      })

      it('should handle auth set preferred account', async () => {
        const address = '0x1234567890123456789012345678901234567890'
        const type = 'eoa'
        vi.spyOn(mockAppKit, 'getCaipNetwork').mockReturnValue(mainnet)
        client['caipNetworks'] = [mainnet]

        vi.spyOn(client as any, 'syncAccount').mockResolvedValue(undefined)

        await client['handleAuthSetPreferredAccount'](address, type)

        expect(mockAppKit.setLoading).toHaveBeenCalledWith(true)
        expect(mockAppKit.setCaipAddress).toHaveBeenCalledWith(`eip155:${1}:${address}`, 'eip155')
        expect(mockAppKit.setCaipNetwork).toHaveBeenCalled()
        expect(mockAppKit.setStatus).toHaveBeenCalledWith('connected', 'eip155')
        expect(mockAppKit.setPreferredAccountType).toHaveBeenCalledWith(type, 'eip155')

        await new Promise(resolve => setImmediate(resolve))

        expect(mockAppKit.setLoading).toHaveBeenLastCalledWith(false)
      })
    })

    describe('setAuthConnector', () => {
      beforeEach(() => {
        client['appKit'] = mockAppKit
        client['authProvider'] = mockAuthConnector as any

        vi.mocked(ProviderUtil.setProvider).mockClear()
        vi.mocked(ProviderUtil.setProviderId).mockClear()
      })

      it('should set auth provider and update appKit state', async () => {
        const mockAddress = '0x1234567890123456789012345678901234567890'
        const mockChainId = 1
        const mockSmartAccountDeployed = true
        const mockPreferredAccountType = 'eoa'

        mockAuthConnector.connect.mockResolvedValueOnce({
          address: mockAddress,
          chainId: mockChainId,
          smartAccountDeployed: mockSmartAccountDeployed,
          preferredAccountType: mockPreferredAccountType,
          accounts: []
        })

        mockAuthConnector.getSmartAccountEnabledNetworks.mockResolvedValueOnce({
          smartAccountEnabledNetworks: [1, 137]
        })

        await client['setAuthProvider']()

        expect(mockAppKit.setSmartAccountEnabledNetworks).toHaveBeenCalledWith([1, 137], 'eip155')
        expect(mockAppKit.setAllAccounts).toHaveBeenCalledWith(
          [{ address: mockAddress, type: mockPreferredAccountType }],
          'eip155'
        )
        expect(mockAppKit.setCaipNetwork).toHaveBeenCalled()
        expect(mockAppKit.setStatus).toHaveBeenCalledWith('connected', 'eip155')
        expect(mockAppKit.setCaipAddress).toHaveBeenCalledWith(
          `eip155:${mockChainId}:${mockAddress}`,
          'eip155'
        )
        expect(mockAppKit.setPreferredAccountType).toHaveBeenCalledWith(
          mockPreferredAccountType,
          'eip155'
        )
        expect(mockAppKit.setSmartAccountDeployed).toHaveBeenCalledWith(
          mockSmartAccountDeployed,
          'eip155'
        )
        expect(ProviderUtil.setProvider).toHaveBeenCalledWith('eip155', expect.any(Object))
        expect(ProviderUtil.setProviderId).toHaveBeenCalledWith(
          'eip155',
          ConstantsUtil.AUTH_CONNECTOR_ID
        )
      })
    })
  })

  describe('EthersClient - Sync Connectors', () => {
    it('should handle sync EIP-6963 connector', () => {
      const mockEIP6963Event: CustomEventInit<EIP6963ProviderDetail> = {
        detail: {
          info: {
            uuid: 'mock-uuid',
            name: 'MockWallet',
            icon: 'mock-icon-url',
            rdns: 'com.mockwallet'
          },
          provider: {
            request: vi.fn(),
            on: vi.fn(),
            removeListener: vi.fn(),
            emit: function (event: string): void {
              throw new Error(event)
            }
          }
        }
      }

      client['eip6963EventHandler'](mockEIP6963Event)

      expect(mockAppKit.addConnector).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'eip6963',
          name: 'MockWallet'
        })
      )
    })
    it('should sync injected connector when config.injected is true', () => {
      const config = { injected: true, coinbase: false, metadata: {} }
      client['syncConnectors'](config as unknown as ProviderType)

      expect(mockAppKit.setConnectors).toHaveBeenCalledWith([
        expect.objectContaining({
          id: 'injected',
          name: 'Injected',
          type: 'INJECTED',
          chain: 'eip155'
        })
      ])
    })

    it('should sync coinbase connector when config.coinbase is true', () => {
      const config = { injected: false, coinbase: true, metadata: {} }
      client['syncConnectors'](config as unknown as ProviderType)

      expect(mockAppKit.setConnectors).toHaveBeenCalledWith([
        expect.objectContaining({
          id: 'coinbaseWallet',
          name: 'Coinbase',
          type: 'EXTERNAL',
          chain: 'eip155'
        })
      ])
    })

    it('should sync both connectors when both are true in config', () => {
      const config = { injected: true, coinbase: true, metadata: {} }
      client['syncConnectors'](config as unknown as ProviderType)

      expect(mockAppKit.setConnectors).toHaveBeenCalledWith([
        expect.objectContaining({
          id: 'injected',
          name: 'Injected',
          type: 'INJECTED',
          chain: 'eip155'
        }),
        expect.objectContaining({
          id: 'coinbaseWallet',
          name: 'Coinbase',
          type: 'EXTERNAL',
          chain: 'eip155'
        })
      ])
    })

    it('should not sync any connectors when both are false in config', () => {
      const config = { injected: false, coinbase: false, metadata: {} }
      client['syncConnectors'](config as unknown as ProviderType)

      expect(mockAppKit.setConnectors).toHaveBeenCalledWith([])
    })
  })

  describe('EthersClient - State Subscription', () => {
    it('should subscribe to state changes', () => {
      const mockCallback = vi.fn()
      client.subscribeState(mockCallback)

      expect(mockAppKit.subscribeState).toHaveBeenCalled()
    })
  })

  describe('EthersClient - setProvider', () => {
    beforeEach(() => {
      vi.spyOn(SafeLocalStorage, 'setItem')
      vi.spyOn(EthersHelpersUtil, 'getUserInfo').mockResolvedValue({
        addresses: ['0x1234567890123456789012345678901234567890'],
        chainId: 1
      })
    })

    it('should set provider for non-auth providers', async () => {
      const mockProvider = { request: vi.fn() }
      await client['setProvider'](mockProvider as any, 'injected', 'MetaMask')

      expect(SafeLocalStorage.setItem).toHaveBeenCalledWith(WcConstantsUtil.WALLET_ID, 'injected')
      expect(SafeLocalStorage.setItem).toHaveBeenCalledWith(WcConstantsUtil.WALLET_NAME, 'MetaMask')
      expect(mockAppKit.setCaipNetwork).toHaveBeenCalled()
      expect(ProviderUtil.setProviderId).toHaveBeenCalledWith('eip155', 'injected')
      expect(ProviderUtil.setProvider).toHaveBeenCalledWith('eip155', mockProvider)
      expect(mockAppKit.setStatus).toHaveBeenCalledWith('connected', 'eip155')
      expect(mockAppKit.setAllAccounts).toHaveBeenCalled()
    })
  })

  describe('EthersClient - setupProviderListeners', () => {
    let mockProvider: any

    beforeEach(() => {
      mockProvider = {
        on: vi.fn(),
        removeListener: vi.fn()
      }
    })

    it('should set up listeners for non-auth providers', () => {
      client['setupProviderListeners'](mockProvider, 'injected')

      expect(mockProvider.on).toHaveBeenCalledWith('disconnect', expect.any(Function))
      expect(mockProvider.on).toHaveBeenCalledWith('accountsChanged', expect.any(Function))
      expect(mockProvider.on).toHaveBeenCalledWith('chainChanged', expect.any(Function))
    })

    it('should handle disconnect event', async () => {
      vi.spyOn(SafeLocalStorage, 'removeItem')
      client['setupProviderListeners'](mockProvider, 'injected')

      const disconnectHandler = mockProvider.on.mock.calls.find(
        (call: string[]) => call[0] === 'disconnect'
      )[1]
      await disconnectHandler()

      expect(SafeLocalStorage.removeItem).toHaveBeenCalledWith(WcConstantsUtil.WALLET_ID)
      expect(mockProvider.removeListener).toHaveBeenCalledTimes(3)
    })

    it('should handle accountsChanged event', async () => {
      client['setupProviderListeners'](mockProvider, 'injected')

      const accountsChangedHandler = mockProvider.on.mock.calls.find(
        (call: string[]) => call[0] === 'accountsChanged'
      )[1]
      await accountsChangedHandler(['0x1234567890123456789012345678901234567890'])

      expect(mockAppKit.setCaipAddress).toHaveBeenCalled()
    })

    it('should handle chainChanged event', async () => {
      client['setupProviderListeners'](mockProvider, 'injected')

      const chainChangedHandler = mockProvider.on.mock.calls.find(
        (call: string[]) => call[0] === 'chainChanged'
      )[1]
      await chainChangedHandler('0x1')

      expect(mockAppKit.setCaipNetwork).toHaveBeenCalled()
    })
  })

  describe('EthersClient - checkActiveProviders', () => {
    let mockInjectedProvider: any

    beforeEach(() => {
      mockInjectedProvider = {
        request: vi.fn(),
        on: vi.fn(),
        removeListener: vi.fn()
      }

      vi.spyOn(SafeLocalStorage, 'getItem').mockImplementation(key => {
        if (key === WcConstantsUtil.WALLET_ID) return ConstantsUtil.INJECTED_CONNECTOR_ID
        if (key === WcConstantsUtil.WALLET_NAME) return 'MetaMask'
        return null
      })

      vi.spyOn(client as any, 'setProvider').mockImplementation(() => Promise.resolve())
      vi.spyOn(client as any, 'setupProviderListeners').mockImplementation(() => {})
    })

    it('should check and set active provider for injected wallet', () => {
      const mockConfig = {
        injected: mockInjectedProvider,
        coinbase: undefined,
        metadata: {}
      }

      client['checkActiveProviders'](mockConfig as ProviderType)

      expect(SafeLocalStorage.getItem).toHaveBeenCalledWith(WcConstantsUtil.WALLET_ID)
      expect(client['setProvider']).toHaveBeenCalledWith(
        mockInjectedProvider,
        ConstantsUtil.INJECTED_CONNECTOR_ID
      )
      expect(client['setupProviderListeners']).toHaveBeenCalledWith(
        mockInjectedProvider,
        ConstantsUtil.INJECTED_CONNECTOR_ID
      )
    })

    it('should not set provider when wallet ID is not found', () => {
      vi.spyOn(SafeLocalStorage, 'getItem').mockReturnValue(null)

      const mockConfig = {
        injected: mockInjectedProvider,
        coinbase: undefined,
        metadata: {}
      }

      client['checkActiveProviders'](mockConfig as ProviderType)

      expect(SafeLocalStorage.getItem).toHaveBeenCalledWith(WcConstantsUtil.WALLET_ID)
      expect(client['setProvider']).not.toHaveBeenCalled()
      expect(client['setupProviderListeners']).not.toHaveBeenCalled()
    })

    it('should not set provider when injected provider is not available', () => {
      const mockConfig = {
        injected: undefined,
        coinbase: undefined,
        metadata: {}
      }

      client['checkActiveProviders'](mockConfig as ProviderType)

      expect(SafeLocalStorage.getItem).toHaveBeenCalledWith(WcConstantsUtil.WALLET_ID)
      expect(client['setProvider']).not.toHaveBeenCalled()
      expect(client['setupProviderListeners']).not.toHaveBeenCalled()
    })
  })

  describe('EthersClient - syncAccount', () => {
    beforeEach(() => {
      vi.spyOn(client as any, 'syncConnectedWalletInfo').mockImplementation(() => {})
      vi.spyOn(client as any, 'syncProfile').mockImplementation(() => Promise.resolve())
      vi.spyOn(client as any, 'syncBalance').mockImplementation(() => Promise.resolve())
    })

    it('should sync account when connected and address is provided', async () => {
      const mockAddress = '0x1234567890123456789012345678901234567890'
      const mockCaipNetwork = mainnet

      vi.spyOn(mockAppKit, 'getIsConnectedState').mockReturnValue(true)
      vi.spyOn(mockAppKit, 'getCaipNetwork').mockReturnValue(mockCaipNetwork)
      vi.spyOn(mockAppKit, 'getPreferredAccountType').mockReturnValue('eoa')

      await client['syncAccount']({ address: mockAddress })

      expect(mockAppKit.setPreferredAccountType).toHaveBeenCalledWith('eoa', 'eip155')
      expect(mockAppKit.setAddressExplorerUrl).toHaveBeenCalledWith(
        `https://etherscan.io/address/${mockAddress}`,
        'eip155'
      )
      expect(client['syncConnectedWalletInfo']).toHaveBeenCalled()
      expect(client['syncProfile']).toHaveBeenCalledWith(mockAddress)
      expect(mockAppKit.setApprovedCaipNetworksData).toHaveBeenCalledWith('eip155')
    })

    it('should reset connection when not connected', async () => {
      vi.spyOn(mockAppKit, 'getIsConnectedState').mockReturnValue(false)

      await client['syncAccount']({})

      expect(mockAppKit.resetWcConnection).toHaveBeenCalled()
      expect(mockAppKit.resetNetwork).toHaveBeenCalled()
      expect(mockAppKit.setAllAccounts).toHaveBeenCalledWith([], 'eip155')
    })
  })

  describe('EthersClient - syncProfile', () => {
    const mockAddress = '0x1234567890123456789012345678901234567890'

    beforeEach(() => {
      vi.spyOn(client as any, 'syncReownName').mockImplementation(() => Promise.resolve())
    })

    it('should set profile from fetchIdentity when successful', async () => {
      const mockIdentity = { name: 'Test Name', avatar: 'https://example.com/avatar.png' }
      vi.spyOn(mockAppKit, 'fetchIdentity').mockResolvedValue(mockIdentity)

      await client['syncProfile'](mockAddress)

      expect(mockAppKit.setProfileName).toHaveBeenCalledWith('Test Name', 'eip155')
      expect(mockAppKit.setProfileImage).toHaveBeenCalledWith(
        'https://example.com/avatar.png',
        'eip155'
      )
    })

    it('should use ENS for mainnet when fetchIdentity fails', async () => {
      vi.spyOn(mockAppKit, 'fetchIdentity').mockRejectedValue(new Error('Fetch failed'))
      vi.spyOn(mockAppKit, 'getCaipNetwork').mockReturnValue(mainnet)

      const mockEnsProvider = {
        lookupAddress: vi.fn().mockResolvedValue('test.eth'),
        getAvatar: vi.fn().mockResolvedValue('https://example.com/ens-avatar.png')
      }
      vi.mocked(ethers.providers.InfuraProvider).mockImplementation(() => mockEnsProvider as any)

      await client['syncProfile'](mockAddress)

      expect(mockAppKit.setProfileName).toHaveBeenCalledWith('test.eth', 'eip155')
      expect(mockAppKit.setProfileImage).toHaveBeenCalledWith(
        'https://example.com/ens-avatar.png',
        'eip155'
      )
    })

    it('should fallback to syncReownName for non-mainnet chains', async () => {
      vi.spyOn(mockAppKit, 'fetchIdentity').mockRejectedValue(new Error('Fetch failed'))
      vi.spyOn(mockAppKit, 'getCaipNetwork').mockReturnValue(polygon) // Polygon

      await client['syncProfile'](mockAddress)

      expect(client['syncReownName']).toHaveBeenCalledWith(mockAddress)
      expect(mockAppKit.setProfileImage).toHaveBeenCalledWith(null, 'eip155')
    })
  })

  describe('EthersClient - syncBalance', () => {
    const mockAddress = '0x1234567890123456789012345678901234567890'

    it.skip('should set balance when caipNetwork is available', async () => {
      vi.spyOn(mockAppKit, 'getCaipNetwork').mockReturnValue(mainnet)

      const mockJsonRpcProvider = {
        getBalance: vi.fn().mockResolvedValue(BigInt(1000000000000000000)) // 1 ETH in wei
      }
      vi.mocked(ethers.providers.JsonRpcProvider).mockImplementation(
        () => mockJsonRpcProvider as any
      )

      await client['syncBalance'](mockAddress, mainnet)

      expect(ethers.providers.JsonRpcProvider).toHaveBeenCalledWith(mainnet.rpcUrl, {
        chainId: 1,
        name: 'Ethereum'
      })
      expect(mockJsonRpcProvider.getBalance).toHaveBeenCalledWith(mockAddress)
      expect(mockAppKit.setBalance).toHaveBeenCalledWith('1.0', 'ETH', 'eip155')
    })

    it('should not set balance when caipNetwork is unavailable', async () => {
      vi.spyOn(mockAppKit, 'getCaipNetworks').mockReturnValue([])

      await client['syncBalance'](mockAddress, mainnet)

      expect(ethers.providers.JsonRpcProvider).not.toHaveBeenCalled()
      expect(mockAppKit.setBalance).not.toHaveBeenCalled()
    })
  })

  describe('EthersClient - syncReownName', () => {
    const mockAddress = '0x1234567890123456789012345678901234567890'

    it('should set profile name when WalletConnect name is available', async () => {
      const mockWcNames = [
        { name: 'WC Wallet', registered: 1, updated: 1234567890, addresses: [], attributes: {} }
      ] as unknown as BlockchainApiLookupEnsName[]
      vi.spyOn(mockAppKit, 'getReownName').mockResolvedValue(mockWcNames)

      await client['syncReownName'](mockAddress)

      expect(mockAppKit.getReownName).toHaveBeenCalledWith(mockAddress)
      expect(mockAppKit.setProfileName).toHaveBeenCalledWith('WC Wallet', 'eip155')
    })

    it('should set profile name to null when no WalletConnect name is available', async () => {
      vi.spyOn(mockAppKit, 'getReownName').mockResolvedValue([])

      await client['syncReownName'](mockAddress)

      expect(mockAppKit.getReownName).toHaveBeenCalledWith(mockAddress)
      expect(mockAppKit.setProfileName).toHaveBeenCalledWith(null, 'eip155')
    })

    it('should set profile name to null when getReownName throws an error', async () => {
      vi.spyOn(mockAppKit, 'getReownName').mockRejectedValue(new Error('API Error'))

      await client['syncReownName'](mockAddress)

      expect(mockAppKit.getReownName).toHaveBeenCalledWith(mockAddress)
      expect(mockAppKit.setProfileName).toHaveBeenCalledWith(null, 'eip155')
    })
  })

  describe('EthersClient - syncConnectedWalletInfo', () => {
    beforeEach(() => {
      vi.spyOn(SafeLocalStorage, 'getItem').mockReturnValue('MetaMask')
      vi.spyOn(ProviderUtil.state, 'providerIds', 'get').mockReturnValue({
        eip155: 'injected',
        solana: undefined,
        polkadot: undefined
      })
    })
    it('should set connected wallet info for EIP6963 provider', () => {
      vi.spyOn(ProviderUtil.state, 'providerIds', 'get').mockReturnValue({
        eip155: ConstantsUtil.EIP6963_CONNECTOR_ID,
        solana: undefined
      } as Record<ChainNamespace, ProviderId | undefined>)
      client['EIP6963Providers'] = [
        {
          info: { name: 'MetaMask', icon: 'icon-url', uuid: 'test-uuid', rdns: 'com.metamask' },
          provider: {} as any
        }
      ]

      client['syncConnectedWalletInfo']()

      expect(mockAppKit.setConnectedWalletInfo).toHaveBeenCalledWith(
        { name: 'MetaMask', icon: 'icon-url', uuid: 'test-uuid', rdns: 'com.metamask' },
        'eip155'
      )
    })

    it('should set connected wallet info for WalletConnect provider', () => {
      vi.spyOn(ProviderUtil.state, 'providerIds', 'get').mockReturnValue({
        eip155: ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID,
        solana: undefined
      } as Record<ChainNamespace, ProviderId | undefined>)
      const mockProvider = {
        session: {
          peer: {
            metadata: {
              name: 'WC Wallet',
              icons: ['wc-icon-url']
            }
          }
        }
      }
      vi.spyOn(ProviderUtil, 'getProvider').mockReturnValue(mockProvider as any)

      client['syncConnectedWalletInfo']()

      expect(mockAppKit.setConnectedWalletInfo).toHaveBeenCalledWith(
        {
          name: 'WC Wallet',
          icon: 'wc-icon-url',
          icons: ['wc-icon-url']
        },
        'eip155'
      )
    })

    it('should set connected wallet info for Coinbase provider', () => {
      vi.spyOn(ProviderUtil.state, 'providerIds', 'get').mockReturnValue({
        eip155: ConstantsUtil.COINBASE_SDK_CONNECTOR_ID,
        solana: undefined
      } as Record<ChainNamespace, ProviderId | undefined>)
      vi.spyOn(mockAppKit, 'getConnectors').mockReturnValue([
        {
          id: ConstantsUtil.COINBASE_SDK_CONNECTOR_ID,
          type: 'INJECTED',
          chain: 'eip155'
        }
      ])
      vi.spyOn(mockAppKit, 'getConnectorImage').mockReturnValue('coinbase-icon-url')

      client['syncConnectedWalletInfo']()

      expect(mockAppKit.setConnectedWalletInfo).toHaveBeenCalledWith(
        { name: 'Coinbase Wallet', icon: 'coinbase-icon-url' },
        'eip155'
      )
    })
  })
})
