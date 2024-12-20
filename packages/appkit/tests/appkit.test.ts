import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AppKit } from '../src/client'
import { base, mainnet, polygon, solana } from '../src/networks/index.js'
import {
  AccountController,
  ModalController,
  ThemeController,
  PublicStateController,
  SnackController,
  RouterController,
  OptionsController,
  BlockchainApiController,
  ConnectionController,
  EnsController,
  EventsController,
  type CombinedProvider,
  AssetUtil,
  ConnectorController,
  ChainController,
  type Connector,
  CoreHelperUtil,
  AlertController,
  StorageUtil,
  type ChainAdapter
} from '@reown/appkit-core'
import {
  SafeLocalStorage,
  SafeLocalStorageKeys,
  type AppKitNetwork,
  type CaipNetwork
} from '@reown/appkit-common'
import { mockOptions } from './mocks/Options'
import { UniversalAdapter } from '../src/universal-adapter/client'
import type { AdapterBlueprint } from '../src/adapters/ChainAdapterBlueprint'
import { ProviderUtil } from '../src/store'
import { CaipNetworksUtil, ErrorUtil } from '@reown/appkit-utils'
import mockUniversalAdapter from './mocks/Adapter'
import { UniversalProvider } from '@walletconnect/universal-provider'
import mockProvider from './mocks/UniversalProvider'
import { MockEmitter } from './mocks/Emitter'

// Mock all controllers and UniversalAdapterClient
vi.mock('@reown/appkit-core')
vi.mock('../src/universal-adapter/client')
vi.mock('../src/client.ts', async () => {
  const actual = await vi.importActual('../src/client.ts')

  return {
    ...actual,
    initOrContinue: vi.fn(),
    syncExistingConnection: vi.fn()
  }
})

vi.mocked(global).window = { location: { origin: '' } } as any
vi.mocked(global).document = {
  body: {
    injectAdjacentElement: vi.fn()
  } as any,
  createElement: vi.fn().mockReturnValue({ appendChild: vi.fn() }),
  getElementsByTagName: vi.fn().mockReturnValue([{ textContent: '' }]),
  querySelector: vi.fn()
} as any

describe('Base', () => {
  let appKit: AppKit

  beforeEach(() => {
    vi.resetAllMocks()

    vi.mocked(ChainController).state = {
      chains: new Map(),
      activeChain: 'eip155'
    } as any

    vi.mocked(ConnectorController).getConnectors = vi.fn().mockReturnValue([])
    vi.mocked(CaipNetworksUtil).extendCaipNetworks = vi.fn().mockReturnValue([])

    appKit = new AppKit(mockOptions)
  })

  describe('Base Initialization', () => {
    it('should initialize controllers', () => {
      const copyMockOptions = { ...mockOptions }

      delete copyMockOptions.adapters

      expect(EventsController.sendEvent).toHaveBeenCalledOnce()
      expect(EventsController.sendEvent).toHaveBeenCalledWith({
        type: 'track',
        event: 'INITIALIZE',
        properties: {
          ...copyMockOptions,
          networks: copyMockOptions.networks.map((n: AppKitNetwork) => n.id),
          siweConfig: {
            options: copyMockOptions.siweConfig?.options || {}
          }
        }
      })

      expect(ChainController.initialize).toHaveBeenCalledOnce()
      expect(ChainController.initialize).toHaveBeenCalledWith(mockOptions.adapters, [])
    })

    it('should set EIP6963 enabled by default', () => {
      new AppKit({
        ...mockOptions
      })

      expect(OptionsController.setEIP6963Enabled).toHaveBeenCalledWith(true)
    })

    it('should set EIP6963 disabled when option is disabled in config', () => {
      new AppKit({
        ...mockOptions,
        enableEIP6963: false
      })

      expect(OptionsController.setEIP6963Enabled).toHaveBeenCalledWith(false)
    })
  })

  describe('Base Public methods', () => {
    it('should open modal', async () => {
      await appKit.open()
      expect(ModalController.open).toHaveBeenCalled()
    })

    it('should close modal', async () => {
      await appKit.close()
      expect(ModalController.close).toHaveBeenCalled()
    })

    it('should set loading state', () => {
      appKit.setLoading(true)
      expect(ModalController.setLoading).toHaveBeenCalledWith(true)
    })

    it('should get theme mode', () => {
      vi.mocked(ThemeController).state = { themeMode: 'dark' } as any
      expect(appKit.getThemeMode()).toBe('dark')
    })

    it('should set theme mode', () => {
      appKit.setThemeMode('light')
      expect(ThemeController.setThemeMode).toHaveBeenCalledWith('light')
    })

    it('should get theme variables', () => {
      vi.mocked(ThemeController).state = {
        themeVariables: { '--w3m-accent': '#000' }
      } as any
      expect(appKit.getThemeVariables()).toEqual({ '--w3m-accent': '#000' })
    })

    it('should set theme variables', () => {
      const themeVariables = { '--w3m-accent': '#fff' }
      appKit.setThemeVariables(themeVariables)
      expect(ThemeController.setThemeVariables).toHaveBeenCalledWith(themeVariables)
    })

    it('should subscribe to theme changes', () => {
      const callback = vi.fn()
      appKit.subscribeTheme(callback)
      expect(ThemeController.subscribe).toHaveBeenCalledWith(callback)
    })

    it('should get wallet info', () => {
      vi.mocked(AccountController).state = { connectedWalletInfo: { name: 'Test Wallet' } } as any
      expect(appKit.getWalletInfo()).toEqual({ name: 'Test Wallet' })
    })

    it('should subscribe to wallet info changes', () => {
      const callback = vi.fn()
      appKit.subscribeWalletInfo(callback)
      expect(AccountController.subscribeKey).toHaveBeenCalledWith('connectedWalletInfo', callback)
    })

    it('should subscribe to address updates', () => {
      const callback = vi.fn()
      appKit.subscribeShouldUpdateToAddress(callback)
      expect(AccountController.subscribeKey).toHaveBeenCalledWith('shouldUpdateToAddress', callback)
    })

    it('should subscribe to CAIP network changes', () => {
      const callback = vi.fn()
      appKit.subscribeCaipNetworkChange(callback)
      expect(ChainController.subscribeKey).toHaveBeenCalledWith('activeCaipNetwork', callback)
    })

    it('should get state', () => {
      vi.mocked(PublicStateController).state = { isConnected: true } as any
      expect(appKit.getState()).toEqual({ isConnected: true })
    })

    it('should subscribe to state changes', () => {
      const callback = vi.fn()
      appKit.subscribeState(callback)
      expect(PublicStateController.subscribe).toHaveBeenCalledWith(callback)
    })

    it('should show error message', () => {
      appKit.showErrorMessage('Test error')
      expect(SnackController.showError).toHaveBeenCalledWith('Test error')
    })

    it('should show success message', () => {
      appKit.showSuccessMessage('Test success')
      expect(SnackController.showSuccess).toHaveBeenCalledWith('Test success')
    })

    it('should get event', () => {
      vi.mocked(EventsController).state = { name: 'test_event' } as any
      expect(appKit.getEvent()).toEqual({ name: 'test_event' })
    })

    it('should subscribe to events', () => {
      const callback = vi.fn()
      appKit.subscribeEvents(callback)
      expect(EventsController.subscribe).toHaveBeenCalledWith(callback)
    })

    it('should replace route', () => {
      appKit.replace('Connect')
      expect(RouterController.replace).toHaveBeenCalledWith('Connect')
    })

    it('should redirect to route', () => {
      appKit.redirect('Networks')
      expect(RouterController.push).toHaveBeenCalledWith('Networks')
    })

    it('should pop transaction stack', () => {
      appKit.popTransactionStack(true)
      expect(RouterController.popTransactionStack).toHaveBeenCalledWith(true)
    })

    it('should check if modal is open', () => {
      vi.mocked(ModalController).state = { open: true } as any
      expect(appKit.isOpen()).toBe(true)
    })

    it('should check if transaction stack is empty', () => {
      vi.mocked(RouterController).state = { transactionStack: [] } as any
      expect(appKit.isTransactionStackEmpty()).toBe(true)
    })

    it('should check if transaction should replace view', () => {
      vi.mocked(RouterController).state = { transactionStack: [{ replace: true }] } as any
      expect(appKit.isTransactionShouldReplaceView()).toBe(true)
    })

    it('should set status', () => {
      appKit.setStatus('connected', 'eip155')
      expect(AccountController.setStatus).toHaveBeenCalledWith('connected', 'eip155')
    })

    it('should set all accounts', () => {
      const evmAddresses = [
        { address: '0x1', namespace: 'eip155', type: 'eoa' } as const,
        { address: '0x2', namespace: 'eip155', type: 'smartAccount' } as const
      ]

      const solanaAddresses = [{ address: 'asdbjk', namespace: 'solana', type: 'eoa' } as const]

      const bip122Addresses = [
        { address: 'asdasd1', namespace: 'bip122', type: 'payment' } as const,
        { address: 'asdasd2', namespace: 'bip122', type: 'ordinal' } as const,
        { address: 'ASDASD3', namespace: 'bip122', type: 'stx' } as const
      ]

      appKit.setAllAccounts(evmAddresses, 'eip155')
      appKit.setAllAccounts(solanaAddresses, 'solana')
      appKit.setAllAccounts(bip122Addresses, 'bip122')
      expect(AccountController.setAllAccounts).toHaveBeenCalledWith(evmAddresses, 'eip155')
      expect(AccountController.setAllAccounts).toHaveBeenCalledWith(solanaAddresses, 'solana')
      expect(AccountController.setAllAccounts).toHaveBeenCalledWith(bip122Addresses, 'bip122')
      expect(OptionsController.setHasMultipleAddresses).toHaveBeenCalledWith(true)
    })

    it('should add address label', () => {
      appKit.addAddressLabel('0x123', 'eip155 Address', 'eip155')
      expect(AccountController.addAddressLabel).toHaveBeenCalledWith(
        '0x123',
        'eip155 Address',
        'eip155'
      )
    })

    it('should remove address label', () => {
      appKit.removeAddressLabel('0x123', 'eip155')
      expect(AccountController.removeAddressLabel).toHaveBeenCalledWith('0x123', 'eip155')
    })

    it('should get CAIP address', () => {
      vi.mocked(ChainController).state = {
        activeChain: 'eip155',
        activeCaipAddress: 'eip155:1:0x123',
        chains: new Map([['eip155', { namespace: 'eip155' }]])
      } as any
      expect(appKit.getCaipAddress()).toBe('eip155:1:0x123')
    })

    it('should get address', () => {
      vi.mocked(AccountController).state = { address: '0x123' } as any
      expect(appKit.getAddress()).toBe('0x123')
    })

    it('should get provider', () => {
      const mockProvider = { request: vi.fn() }
      vi.mocked(AccountController).state = { provider: mockProvider } as any
      expect(appKit.getProvider()).toBe(mockProvider)
    })

    it('should get preferred account type', () => {
      vi.mocked(AccountController).state = { preferredAccountType: 'eoa' } as any
      expect(appKit.getPreferredAccountType()).toBe('eoa')
    })

    it('should set CAIP address', () => {
      // First mock AccountController.setCaipAddress to update ChainController state
      vi.mocked(AccountController.setCaipAddress).mockImplementation(() => {
        vi.mocked(ChainController).state = {
          ...vi.mocked(ChainController).state,
          activeCaipAddress: 'eip155:1:0x123',
          chains: new Map([['eip155', { namespace: 'eip155' }]])
        } as any
      })

      appKit.setCaipAddress('eip155:1:0x123', 'eip155')
      expect(AccountController.setCaipAddress).toHaveBeenCalledWith('eip155:1:0x123', 'eip155')
      expect(appKit.getIsConnectedState()).toBe(true)
    })

    it('should set provider', () => {
      const mockProvider = {
        request: vi.fn()
      }
      appKit.setProvider(mockProvider as unknown as CombinedProvider, 'eip155')
      expect(AccountController.setProvider).toHaveBeenCalledWith(mockProvider, 'eip155')
    })

    it('should set balance', () => {
      appKit.setBalance('1.5', 'ETH', 'eip155')
      expect(AccountController.setBalance).toHaveBeenCalledWith('1.5', 'ETH', 'eip155')
    })

    it('should set profile name', () => {
      appKit.setProfileName('John Doe', 'eip155')
      expect(AccountController.setProfileName).toHaveBeenCalledWith('John Doe', 'eip155')
    })

    it('should set profile image', () => {
      appKit.setProfileImage('https://example.com/image.png', 'eip155')
      expect(AccountController.setProfileImage).toHaveBeenCalledWith(
        'https://example.com/image.png',
        'eip155'
      )
    })

    it('should reset account', () => {
      appKit.resetAccount('eip155')
      expect(AccountController.resetAccount).toHaveBeenCalledWith('eip155')
    })

    it('should set CAIP network', () => {
      const caipNetwork = { id: 'eip155:1', name: 'Ethereum' } as unknown as CaipNetwork
      appKit.setCaipNetwork(caipNetwork)
      expect(ChainController.setActiveCaipNetwork).toHaveBeenCalledWith(caipNetwork)
    })

    it('should get CAIP network', () => {
      vi.mocked(ChainController).state = {
        activeCaipNetwork: { id: 'eip155:1', name: 'Ethereum' },
        chains: new Map([['eip155', { namespace: 'eip155' }]])
      } as any
      expect(appKit.getCaipNetwork()).toEqual({ id: 'eip155:1', name: 'Ethereum' })
    })

    it('should set requested CAIP networks', () => {
      const requestedNetworks = [{ id: 'eip155:1', name: 'Ethereum' }] as unknown as CaipNetwork[]
      appKit.setRequestedCaipNetworks(requestedNetworks, 'eip155')
      expect(ChainController.setRequestedCaipNetworks).toHaveBeenCalledWith(
        requestedNetworks,
        'eip155'
      )
    })

    it('should set connectors', () => {
      const existingConnectors = [
        { id: 'phantom', name: 'Phantom', chain: 'eip155', type: 'INJECTED' }
      ] as Connector[]

      // Mock getConnectors to return existing connectors
      vi.mocked(ConnectorController.getConnectors).mockReturnValue(existingConnectors)

      const newConnectors = [
        { id: 'metamask', name: 'MetaMask', chain: 'eip155', type: 'INJECTED' }
      ] as Connector[]

      appKit.setConnectors(newConnectors)

      // Verify that setConnectors was called with combined array
      expect(ConnectorController.setConnectors).toHaveBeenCalledWith([
        ...existingConnectors,
        ...newConnectors
      ])
    })

    it('should add connector', () => {
      const connector = {
        id: 'metamask',
        name: 'MetaMask',
        chain: 'eip155',
        type: 'INJECTED'
      } as Connector
      appKit.addConnector(connector)
      expect(ConnectorController.addConnector).toHaveBeenCalledWith(connector)
    })

    it('should get connectors', () => {
      const mockConnectors = [
        { id: 'metamask', name: 'MetaMask', chain: 'eip155:1', type: 'INJECTED' as const }
      ] as any
      vi.mocked(ConnectorController.getConnectors).mockReturnValue(mockConnectors)
      expect(appKit.getConnectors()).toEqual(mockConnectors)
    })

    it('should get approved CAIP network IDs', () => {
      vi.mocked(ChainController.getAllApprovedCaipNetworkIds).mockReturnValue(['eip155:1'])
      expect(appKit.getApprovedCaipNetworkIds()).toEqual(['eip155:1'])
    })

    it('should set approved CAIP networks data', () => {
      appKit.setApprovedCaipNetworksData('eip155')
      expect(ChainController.setApprovedCaipNetworksData).toHaveBeenCalledWith('eip155')
    })

    it('should reset network', () => {
      appKit.resetNetwork('eip155')
      expect(ChainController.resetNetwork).toHaveBeenCalled()
    })

    it('should reset WC connection', () => {
      appKit.resetWcConnection()
      expect(ConnectionController.resetWcConnection).toHaveBeenCalled()
    })

    it('should fetch identity', async () => {
      const mockRequest = { caipChainId: 'eip155:1', address: '0x123' }
      vi.mocked(BlockchainApiController.fetchIdentity).mockResolvedValue({
        name: 'John Doe',
        avatar: null
      })
      const result = await appKit.fetchIdentity(mockRequest)
      expect(BlockchainApiController.fetchIdentity).toHaveBeenCalledWith(mockRequest)
      expect(result).toEqual({ name: 'John Doe', avatar: null })
    })

    it('should set address explorer URL', () => {
      appKit.setAddressExplorerUrl('https://etherscan.io/address/0x123', 'eip155')
      expect(AccountController.setAddressExplorerUrl).toHaveBeenCalledWith(
        'https://etherscan.io/address/0x123',
        'eip155'
      )
    })

    it('should set smart account deployed', () => {
      appKit.setSmartAccountDeployed(true, 'eip155')
      expect(AccountController.setSmartAccountDeployed).toHaveBeenCalledWith(true, 'eip155')
    })

    it('should set connected wallet info', () => {
      const walletInfo = { name: 'MetaMask', icon: 'icon-url' }
      appKit.setConnectedWalletInfo(walletInfo, 'eip155')
      expect(AccountController.setConnectedWalletInfo).toHaveBeenCalledWith(walletInfo, 'eip155')
    })

    it('should set smart account enabled networks', () => {
      const networks = [1, 137]
      appKit.setSmartAccountEnabledNetworks(networks, 'eip155')
      expect(ChainController.setSmartAccountEnabledNetworks).toHaveBeenCalledWith(
        networks,
        'eip155'
      )
    })

    it('should set preferred account type', () => {
      appKit.setPreferredAccountType('eoa', 'eip155')
      expect(AccountController.setPreferredAccountType).toHaveBeenCalledWith('eoa', 'eip155')
    })

    it('should create accounts with correct account types from user accounts', async () => {
      const mockUser = {
        address: '0x123',
        accounts: [
          { address: '0x1', type: 'eoa' },
          { address: '0x2', type: 'smartAccount' }
        ],
        preferredAccountType: 'eoa'
      }

      vi.mocked(ChainController).state = {
        activeChain: 'eip155',
        chains: new Map([['eip155', { namespace: 'eip155' }]])
      } as any

      vi.mocked(CoreHelperUtil.createAccount).mockImplementation((namespace, address, type) => {
        if (namespace === 'eip155') {
          return {
            address,
            type: type as 'eoa' | 'smartAccount',
            namespace: 'eip155' as const
          }
        }
        throw new Error('Unexpected namespace')
      })

      const mockAuthProvider = {
        onConnect: vi.fn(callback => callback(mockUser)),
        connect: vi.fn(),
        getSmartAccountEnabledNetworks: vi.fn(),
        onGetSmartAccountEnabledNetworks: vi.fn(),
        onSetPreferredAccount: vi.fn(),
        onRpcRequest: vi.fn(),
        onRpcError: vi.fn(),
        onRpcSuccess: vi.fn(),
        onNotConnected: vi.fn(),
        onIsConnected: vi.fn(),
        getLoginEmailUsed: vi.fn().mockReturnValue(false),
        isConnected: vi.fn().mockResolvedValue({ isConnected: false })
      }

      const appKitWithAuth = new AppKit({
        ...mockOptions,
        features: {
          email: true
        }
      })
      ;(appKitWithAuth as any).authProvider = mockAuthProvider

      await (appKitWithAuth as any).listenAuthConnector(mockAuthProvider)

      expect(CoreHelperUtil.createAccount).toHaveBeenCalledWith('eip155', '0x1', 'eoa')
      expect(CoreHelperUtil.createAccount).toHaveBeenCalledWith('eip155', '0x2', 'smartAccount')

      expect(AccountController.setAllAccounts).toHaveBeenCalledWith(
        [
          { address: '0x1', type: 'eoa', namespace: 'eip155' },
          { address: '0x2', type: 'smartAccount', namespace: 'eip155' }
        ],
        'eip155'
      )

      expect(AccountController.setPreferredAccountType).toHaveBeenCalledWith('eoa', 'eip155')
    })

    it('should get Reown name', async () => {
      vi.mocked(EnsController.getNamesForAddress).mockResolvedValue([
        {
          name: 'john.reown.id',
          addresses: { eip155: { address: '0x123', created: '0' } },
          attributes: [],
          registered: 0,
          updated: 0
        }
      ])
      const result = await appKit.getReownName('john.reown.id')
      expect(EnsController.getNamesForAddress).toHaveBeenCalledWith('john.reown.id')
      expect(result).toEqual([
        {
          name: 'john.reown.id',
          addresses: { eip155: { address: '0x123', created: '0' } },
          attributes: [],
          registered: 0,
          updated: 0
        }
      ])
    })

    it('should set EIP6963 enabled', () => {
      appKit.setEIP6963Enabled(true)
      expect(OptionsController.setEIP6963Enabled).toHaveBeenCalledWith(true)
    })

    it('should set client ID', () => {
      appKit.setClientId('client-123')
      expect(BlockchainApiController.setClientId).toHaveBeenCalledWith('client-123')
    })

    it('should get connector image', () => {
      vi.mocked(AssetUtil.getConnectorImage).mockReturnValue('connector-image-url')
      const result = appKit.getConnectorImage({ id: 'metamask', type: 'INJECTED', chain: 'eip155' })
      expect(AssetUtil.getConnectorImage).toHaveBeenCalledWith({
        id: 'metamask',
        type: 'INJECTED',
        chain: 'eip155'
      })
      expect(result).toBe('connector-image-url')
    })

    it('should switch network when requested', async () => {
      vi.mocked(CaipNetworksUtil).extendCaipNetworks = vi
        .fn()
        .mockReturnValue([{ id: mainnet.id, name: mainnet.name }])

      const mockAppKit = new AppKit(mockOptions)

      vi.mocked(ChainController.switchActiveNetwork).mockResolvedValue(undefined)

      await mockAppKit.switchNetwork(mainnet)

      expect(ChainController.switchActiveNetwork).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mainnet.id,
          name: mainnet.name
        })
      )

      await mockAppKit.switchNetwork(polygon)

      expect(ChainController.switchActiveNetwork).toHaveBeenCalledTimes(1)
    })

    it('should set connected wallet info when syncing account', async () => {
      // Mock the connector data
      const mockConnector = {
        id: 'test-wallet'
      } as Connector

      vi.mocked(ConnectorController.getConnectors).mockReturnValue([mockConnector])
      vi.mocked(StorageUtil.getActiveNetworkProps).mockReturnValue({
        namespace: 'eip155',
        chainId: '1',
        caipNetworkId: '1'
      })

      const mockAccountData = {
        address: '0x123',
        chainId: '1',
        chainNamespace: 'eip155' as const
      }

      vi.spyOn(StorageUtil, 'getConnectedConnectorId').mockReturnValue(mockConnector.id)

      await appKit['syncAccount'](mockAccountData)

      expect(AccountController.setConnectedWalletInfo).toHaveBeenCalledWith(
        expect.objectContaining({
          name: mockConnector.id
        }),
        'eip155'
      )
    })

    it('should sync identity only if address changed', async () => {
      const mockAccountData = {
        address: '0x123',
        chainId: '1',
        chainNamespace: 'eip155' as const
      }

      vi.mocked(StorageUtil.getActiveNetworkProps).mockReturnValue({
        namespace: 'eip155',
        chainId: '1',
        caipNetworkId: '1'
      })

      vi.mocked(BlockchainApiController.fetchIdentity).mockResolvedValue({
        name: 'John Doe',
        avatar: null
      })

      vi.mocked(AccountController).state = { address: '0x123' } as any

      await appKit['syncAccount'](mockAccountData)

      expect(BlockchainApiController.fetchIdentity).not.toHaveBeenCalled()

      await appKit['syncAccount']({ ...mockAccountData, address: '0x456' })

      expect(BlockchainApiController.fetchIdentity).toHaveBeenCalledOnce()
    })

    it('should disconnect correctly', async () => {
      vi.mocked(CaipNetworksUtil.extendCaipNetworks).mockReturnValue([
        { id: 'eip155:1', chainNamespace: 'eip155' } as CaipNetwork
      ])

      vi.mocked(ChainController).state = {
        chains: new Map([['eip155', { namespace: 'eip155' }]]),
        activeChain: 'eip155'
      } as any

      const mockRemoveItem = vi.fn()

      vi.spyOn(SafeLocalStorage, 'removeItem').mockImplementation(mockRemoveItem)

      const appKit = new AppKit({
        ...mockOptions,
        networks: [base],
        projectId: 'YOUR_PROJECT_ID',
        adapters: [mockUniversalAdapter]
      })

      await appKit.disconnect()

      expect(ChainController.disconnect).toHaveBeenCalled()
      expect(AccountController.setStatus).toHaveBeenCalledWith('disconnected', 'eip155')
    })

    it('should set unsupported chain when synced chainId is not supported', async () => {
      vi.mocked(StorageUtil.getConnectedConnectorId).mockReturnValue('EXTERNAL')
      vi.mocked(StorageUtil.getActiveNamespace).mockReturnValue('eip155')
      vi.mocked(ChainController).state = {
        chains: new Map([['eip155', { namespace: 'eip155' }]]),
        activeChain: 'eip155'
      } as any
      ;(appKit as any).caipNetworks = [{ id: 'eip155:1', chainNamespace: 'eip155' }]

      const overrideAdapter = {
        getAccounts: vi.fn().mockResolvedValue({ accounts: [{ address: '0x123', type: 'eoa' }] }),
        syncConnection: vi.fn().mockResolvedValue({
          chainId: 'eip155:999', // Unsupported chain
          address: '0x123'
        }),
        getBalance: vi.fn().mockResolvedValue({ balance: '0', symbol: 'ETH' }),
        getProfile: vi.fn().mockResolvedValue({}),
        on: vi.fn(),
        off: vi.fn(),
        emit: vi.fn()
      }

      vi.spyOn(appKit as any, 'getAdapter').mockReturnValueOnce(overrideAdapter)

      vi.spyOn(StorageUtil, 'setConnectedConnectorId').mockImplementation(vi.fn())

      vi.spyOn(appKit as any, 'syncAccount').mockImplementation(vi.fn())

      vi.spyOn(appKit as any, 'setUnsupportedNetwork').mockImplementation(vi.fn())

      vi.spyOn(SafeLocalStorage, 'getItem').mockImplementation((key: string) => {
        if (key === SafeLocalStorageKeys.CONNECTED_CONNECTOR_ID) {
          return 'test-wallet'
        }
        if (key === SafeLocalStorageKeys.ACTIVE_CAIP_NETWORK_ID) {
          return 'eip155:1'
        }
        return undefined
      })

      vi.mocked(ChainController.showUnsupportedChainUI).mockImplementation(vi.fn())

      await (appKit as any).syncExistingConnection()

      expect((appKit as any).setUnsupportedNetwork).toHaveBeenCalled()
    })

    it('should not show unsupported chain UI when allowUnsupportedChain is true', async () => {
      vi.mocked(ChainController).state = {
        chains: new Map([['eip155', { namespace: 'eip155' }]]),
        activeChain: 'eip155'
      } as any
      ;(appKit as any).caipNetworks = [{ id: 'eip155:1', chainNamespace: 'eip155' }]

      vi.mocked(OptionsController).state = {
        allowUnsupportedChain: true
      } as any

      const overrideAdapter = {
        getAccounts: vi.fn().mockResolvedValue({ accounts: [] }),
        syncConnection: vi.fn().mockResolvedValue({
          chainId: 'eip155:999', // Unsupported chain
          address: '0x123',
          accounts: [{ address: '0x123', type: 'eoa' }]
        }),
        getBalance: vi.fn().mockResolvedValue({ balance: '0', symbol: 'ETH' }),
        getProfile: vi.fn().mockResolvedValue({}),
        on: vi.fn(),
        off: vi.fn(),
        emit: vi.fn()
      }

      vi.spyOn(appKit as any, 'getAdapter').mockReturnValueOnce(overrideAdapter)

      vi.spyOn(appKit as any, 'setUnsupportedNetwork').mockImplementation(vi.fn())

      vi.spyOn(SafeLocalStorage, 'getItem').mockImplementation((key: string) => {
        if (key === SafeLocalStorageKeys.CONNECTED_CONNECTOR_ID) {
          return 'test-wallet'
        }
        if (key === SafeLocalStorageKeys.ACTIVE_CAIP_NETWORK_ID) {
          return 'eip155:1'
        }
        return undefined
      })

      vi.mocked(ChainController.showUnsupportedChainUI).mockImplementation(vi.fn())

      await (appKit as any).syncExistingConnection()

      expect(ChainController.showUnsupportedChainUI).not.toHaveBeenCalled()
    })

    it('should subscribe to providers', () => {
      const callback = vi.fn()
      const providers = {
        eip155: { provider: {} },
        solana: {},
        polkadot: {},
        bip122: {}
      }

      const mockSubscribeProviders = vi.fn().mockImplementation(cb => {
        cb(providers)
        return () => {}
      })

      // Mock the entire ProviderUtil
      vi.mocked(ProviderUtil).subscribeProviders = mockSubscribeProviders

      appKit.subscribeProviders(callback)

      expect(mockSubscribeProviders).toHaveBeenCalled()
      expect(callback).toHaveBeenCalledWith(providers)
    })
  })
  describe('syncExistingConnection', () => {
    it('should set status to "connecting" and sync the connection when a connector and namespace are present', async () => {
      vi.mocked(CoreHelperUtil.isClient).mockReturnValueOnce(true)
      vi.spyOn(StorageUtil, 'getActiveNamespace').mockReturnValue('eip155')
      vi.spyOn(StorageUtil, 'getConnectedConnectorId').mockReturnValue('test-connector')
      vi.mocked(StorageUtil.getActiveNetworkProps).mockReturnValue({
        namespace: 'eip155',
        chainId: '1',
        caipNetworkId: '1'
      })

      const mockAdapter = {
        getAccounts: vi.fn().mockResolvedValue({ accounts: [{ address: '0x123', type: 'eoa' }] }),
        syncConnection: vi.fn().mockResolvedValue({
          address: '0x123',
          chainId: '1',
          chainNamespace: 'eip155',
          accounts: [{ address: '0x123', type: 'eoa' }]
        }),
        on: vi.fn(),
        getBalance: vi.fn().mockResolvedValue({ balance: '0', symbol: 'ETH' })
      }
      vi.spyOn(appKit as any, 'getAdapter').mockReturnValueOnce(mockAdapter)

      await appKit['syncExistingConnection']()

      expect(mockAdapter.syncConnection).toHaveBeenCalled()
      expect(AccountController.setStatus).toHaveBeenCalledWith('connected', 'eip155')
      expect(AccountController.setStatus).toHaveBeenCalledWith('connecting', 'eip155')
    })

    it('should set status to "disconnected" when no connector is present', async () => {
      vi.mocked(CoreHelperUtil.isClient).mockReturnValueOnce(true)
      vi.spyOn(SafeLocalStorage, 'getItem').mockReturnValueOnce(undefined)

      await appKit['syncExistingConnection']()

      expect(AccountController.setStatus).toHaveBeenCalledWith('disconnected', 'eip155')
    })

    it('should set status to "disconnected" if the connector is set to "AUTH" and the adapter fails to sync', async () => {
      vi.mocked(CoreHelperUtil.isClient).mockReturnValueOnce(true)
      vi.spyOn(SafeLocalStorage, 'getItem').mockImplementation(key => {
        if (key === SafeLocalStorageKeys.CONNECTED_CONNECTOR_ID) {
          return 'AUTH'
        }
        if (key === SafeLocalStorageKeys.ACTIVE_CAIP_NETWORK_ID) {
          return 'eip155:1'
        }
        return undefined
      })

      const mockAdapter = {
        getAccounts: vi.fn().mockResolvedValue({ accounts: [] }),
        syncConnection: vi.fn().mockResolvedValue(null),
        on: vi.fn()
      }
      vi.spyOn(appKit as any, 'getAdapter').mockReturnValueOnce(mockAdapter)

      await appKit['syncExistingConnection']()

      expect(AccountController.setStatus).toHaveBeenCalledWith('disconnected', 'eip155')
    })
  })
  describe('Base Initialization', () => {
    let appKit: AppKit
    let mockAdapter: AdapterBlueprint
    let mockUniversalAdapter: any

    beforeEach(() => {
      vi.resetAllMocks()

      vi.mocked(ChainController).state = {
        chains: new Map(),
        activeChain: 'eip155'
      } as any

      vi.mocked(ConnectorController).getConnectors = vi.fn().mockReturnValue([])

      mockAdapter = {
        getAccounts: vi.fn().mockResolvedValue({ accounts: [] }),
        namespace: 'eip155',
        construct: vi.fn(),
        setUniversalProvider: vi.fn(),
        setAuthProvider: vi.fn(),
        syncConnectors: vi.fn(),
        connectors: [],
        on: vi.fn(),
        off: vi.fn(),
        emit: vi.fn()
      } as unknown as AdapterBlueprint

      vi.mocked(UniversalAdapter).mockImplementation(() => mockUniversalAdapter)

      appKit = new AppKit({
        ...mockOptions,
        adapters: [mockAdapter]
      })

      vi.spyOn(appKit as any, 'getUniversalProvider').mockResolvedValue({
        on: vi.fn(),
        off: vi.fn(),
        emit: vi.fn()
      })
    })

    it('should call syncConnectors when initializing adapters', async () => {
      vi.mocked(CaipNetworksUtil.extendCaipNetworks).mockReturnValue([
        { id: 'eip155:1', chainNamespace: 'eip155' } as CaipNetwork
      ])

      const appKit = new AppKit({
        ...mockOptions,
        networks: [base],
        projectId: 'YOUR_PROJECT_ID',
        adapters: [mockAdapter]
      })

      const initChainAdapters = (appKit as any).initChainAdapters.bind(appKit)

      vi.spyOn(appKit as any, 'createConnectorsForAdapter').mockResolvedValue(undefined)

      await initChainAdapters([mockAdapter])

      expect(mockAdapter.syncConnectors).toHaveBeenCalled()
    })

    it('should create UniversalAdapter when no blueprint is provided for namespace', async () => {
      vi.mocked(CaipNetworksUtil.extendCaipNetworks).mockReturnValue([
        { id: 'eip155:1', chainNamespace: 'eip155' } as CaipNetwork
      ])

      const appKit = new AppKit({
        ...mockOptions,
        networks: [mainnet],
        projectId: 'YOUR_PROJECT_ID',
        adapters: [mockAdapter]
      })

      const createAdapters = (appKit as any).createAdapters.bind(appKit)

      vi.spyOn(appKit as any, 'createUniversalProvider').mockResolvedValue(undefined)

      const mockUniversalAdapter = {
        setUniversalProvider: vi.fn(),
        setAuthProvider: vi.fn()
      }

      vi.mocked(UniversalAdapter).mockImplementation(() => mockUniversalAdapter as any)

      const adapters = await createAdapters([])

      expect(adapters.eip155).toBeDefined()

      expect(UniversalAdapter).toHaveBeenCalledWith({
        namespace: 'eip155',
        networks: [{ id: 'eip155:1', chainNamespace: 'eip155' } as CaipNetwork]
      })
    })

    it('should initialize UniversalProvider when not provided in options', () => {
      vi.mocked(CaipNetworksUtil.extendCaipNetworks).mockReturnValue([
        { id: 'eip155:1', chainNamespace: 'eip155' } as CaipNetwork
      ])
      vi.spyOn(CoreHelperUtil, 'isClient').mockReturnValue(true)

      const upSpy = vi.spyOn(UniversalProvider, 'init')

      new AppKit({
        ...mockOptions,
        projectId: '123',
        networks: [mainnet],
        adapters: [mockAdapter]
      })

      expect(OptionsController.setUsingInjectedUniversalProvider).toHaveBeenCalled()
      expect(upSpy).toHaveBeenCalled()
    })

    it('should not initialize UniversalProvider when provided in options', async () => {
      vi.mocked(CaipNetworksUtil.extendCaipNetworks).mockReturnValue([
        { id: 'eip155:1', chainNamespace: 'eip155' } as CaipNetwork
      ])
      vi.spyOn(CoreHelperUtil, 'isClient').mockReturnValue(true)

      const upSpy = vi.spyOn(UniversalProvider, 'init')

      new AppKit({
        ...mockOptions,
        projectId: 'test',
        networks: [mainnet],
        universalProvider: mockProvider,
        adapters: [mockAdapter]
      })

      expect(upSpy).not.toHaveBeenCalled()
      expect(OptionsController.setUsingInjectedUniversalProvider).toHaveBeenCalled()
    })

    it('should initialize multiple adapters for different namespaces', async () => {
      vi.mocked(CaipNetworksUtil.extendCaipNetworks).mockReturnValue([
        { id: '1', chainNamespace: 'eip155' } as CaipNetwork,
        { id: 'solana', chainNamespace: 'solana' } as CaipNetwork
      ])

      const mockSolanaAdapter = {
        namespace: 'solana',
        construct: vi.fn(),
        setUniversalProvider: vi.fn(),
        setAuthProvider: vi.fn(),
        syncConnectors: vi.fn(),
        connectors: [],
        on: vi.fn(),
        off: vi.fn(),
        emit: vi.fn()
      } as unknown as AdapterBlueprint

      const appKit = new AppKit({
        ...mockOptions,
        networks: [mainnet, solana],
        projectId: 'YOUR_PROJECT_ID',
        adapters: [mockSolanaAdapter, mockAdapter]
      })

      const createAdapters = (appKit as any).createAdapters.bind(appKit)

      vi.spyOn(appKit as any, 'createUniversalProvider').mockResolvedValue(undefined)

      const adapters = await createAdapters([mockAdapter, mockSolanaAdapter])

      expect(mockAdapter.syncConnectors).toHaveBeenCalled()
      expect(mockSolanaAdapter.syncConnectors).toHaveBeenCalled()
      expect(adapters.eip155).toBeDefined()
      expect(adapters.solana).toBeDefined()
    })

    it('should set universal provider and auth provider for each adapter', async () => {
      vi.mocked(CaipNetworksUtil.extendCaipNetworks).mockReturnValue([
        { id: '1', chainNamespace: 'eip155' } as CaipNetwork
      ])

      const appKit = new AppKit({
        ...mockOptions,
        networks: [mainnet],
        projectId: 'YOUR_PROJECT_ID',
        adapters: [mockAdapter]
      })

      const mockUniversalProvider = {
        on: vi.fn(),
        off: vi.fn(),
        emit: vi.fn()
      }

      vi.spyOn(appKit as any, 'initialize').mockResolvedValue(undefined)
      vi.spyOn(CoreHelperUtil, 'isClient').mockReturnValue(true)
      vi.spyOn(UniversalProvider, 'init').mockResolvedValue(mockUniversalProvider as any)

      const initChainAdapters = (appKit as any).initChainAdapters.bind(appKit)

      await initChainAdapters([mockAdapter])

      expect(mockAdapter.setUniversalProvider).toHaveBeenCalled()
      expect(mockAdapter.setAuthProvider).toHaveBeenCalled()
    })

    it('should update ChainController state with initialized adapters', async () => {
      vi.mocked(CaipNetworksUtil.extendCaipNetworks).mockReturnValue([
        { id: '1', chainNamespace: 'eip155' } as CaipNetwork
      ])

      const appKit = new AppKit({
        ...mockOptions,
        networks: [mainnet],
        projectId: 'YOUR_PROJECT_ID',
        adapters: [mockAdapter]
      })

      const createAdapters = (appKit as any).createAdapters.bind(appKit)

      vi.spyOn(appKit as any, 'createUniversalProvider').mockResolvedValue(undefined)

      await createAdapters([mockAdapter])

      expect(ChainController.state.chains.get('eip155')).toEqual(
        expect.objectContaining({
          namespace: 'eip155',
          connectionControllerClient: expect.any(Object),
          networkControllerClient: expect.any(Object),
          networkState: expect.any(Object),
          accountState: expect.any(Object),
          caipNetworks: expect.any(Array)
        })
      )
    })
  })

  describe('Alert Errors', () => {
    it('should handle alert errors based on error messages', () => {
      const errors = [
        {
          alert: ErrorUtil.ALERT_ERRORS.INVALID_APP_CONFIGURATION,
          message:
            'Error: WebSocket connection closed abnormally with code: 3000 (Unauthorized: origin not allowed)'
        },
        {
          alert: ErrorUtil.ALERT_ERRORS.JWT_TOKEN_NOT_VALID,
          message:
            'WebSocket connection closed abnormally with code: 3000 (JWT validation error: JWT Token is not yet valid:)'
        }
      ]

      for (const { alert, message } of errors) {
        // @ts-expect-error
        appKit.handleAlertError(new Error(message))
        expect(AlertController.open).toHaveBeenCalledWith(alert, 'error')
      }
    })
  })
})

describe('Listeners', () => {
  it('should set caip address, profile name and profile image on accountChanged event', async () => {
    vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
      address: '0x'
    } as unknown as typeof AccountController.state)
    vi.spyOn(CaipNetworksUtil, 'extendCaipNetworks').mockReturnValueOnce([
      { id: '1', chainNamespace: 'eip155' } as CaipNetwork
    ])
    vi.spyOn(StorageUtil, 'getActiveNetworkProps').mockReturnValueOnce({
      namespace: 'eip155',
      chainId: '1',
      caipNetworkId: '1'
    })

    const mockAccount = {
      address: '0x123',
      chainId: '1',
      chainNamespace: 'eip155'
    }

    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      activeChain: mockAccount.chainNamespace,
      activeCaipAddress: `${mockAccount.chainNamespace}:${mockAccount.chainId}:${mockAccount.address}`,
      chains: new Map([])
    } as unknown as typeof ChainController.state)

    const emitter = new MockEmitter()

    const mockAdapter = {
      namespace: 'eip155',
      construct: vi.fn(),
      syncConnectors: vi.fn(),
      getAccounts: vi.fn().mockResolvedValue({ accounts: [] }),
      syncConnection: vi.fn(),
      getBalance: vi.fn().mockResolvedValue({ balance: '0', symbol: 'ETH' }),
      getProfile: vi.fn(),
      on: emitter.on,
      emit: emitter.emit
    }

    // Initialize AppKit
    const appKit = new AppKit({
      ...mockOptions,
      networks: [mainnet],
      projectId: 'YOUR_PROJECT_ID',
      features: {
        email: false,
        socials: []
      },
      adapters: [mockAdapter as ChainAdapter]
    })

    const identity = { name: 'vitalik.eth', avatar: null } as const

    const setCaipAddressSpy = vi.spyOn(AccountController, 'setCaipAddress')
    const fetchIdentitySpy = vi
      .spyOn(BlockchainApiController, 'fetchIdentity')
      .mockResolvedValueOnce(identity)
    const setProfileNameSpy = vi.spyOn(appKit, 'setProfileName')
    const setProfileImageSpy = vi.spyOn(appKit, 'setProfileImage')

    emitter.emit('accountChanged', mockAccount)

    expect(setCaipAddressSpy).toHaveBeenCalledWith(
      `${mockAccount.chainNamespace}:${mockAccount.chainId}:${mockAccount.address}`,
      'eip155'
    )

    // Wait for the promise to fetchIdentity to resolve
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(fetchIdentitySpy).toHaveBeenCalledWith({ address: mockAccount.address })
    expect(setProfileNameSpy).toHaveBeenCalledWith(identity.name, 'eip155')
    expect(setProfileImageSpy).toHaveBeenCalledWith(identity.avatar, 'eip155')
  })
})
