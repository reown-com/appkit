import UniversalProvider from '@walletconnect/universal-provider'
import { type Mocked, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  type AppKitNetwork,
  type Balance,
  type CaipNetwork,
  type CaipNetworkId,
  type ChainNamespace,
  Emitter,
  NetworkUtil,
  SafeLocalStorage,
  SafeLocalStorageKeys,
  getSafeConnectorIdKey
} from '@reown/appkit-common'
import {
  AccountController,
  AlertController,
  AssetUtil,
  BlockchainApiController,
  type ChainAdapter,
  ChainController,
  type ChainControllerState,
  ConnectionController,
  type Connector,
  ConnectorController,
  ConstantsUtil,
  CoreHelperUtil,
  EnsController,
  EventsController,
  ModalController,
  OptionsController,
  PublicStateController,
  RouterController,
  SnackController,
  StorageUtil,
  ThemeController
} from '@reown/appkit-core'
import { CaipNetworksUtil, ErrorUtil } from '@reown/appkit-utils'

import type { AdapterBlueprint } from '../src/adapters/ChainAdapterBlueprint'
import { AppKit } from '../src/client'
import {
  base as baseNetwork,
  mainnet as mainnetNetwork,
  polygon as polygonNetwork,
  sepolia as sepoliaNetwork,
  solana as solanaNetwork
} from '../src/networks/index.js'
import { ProviderUtil } from '../src/store'
import { UniversalAdapter } from '../src/universal-adapter/client'
import mockUniversalAdapter from './mocks/Adapter'
import { mockOptions } from './mocks/Options'
import mockProvider from './mocks/UniversalProvider'

// Extend networks as CAIP networks
const [base, mainnet, polygon, sepolia, solana] = CaipNetworksUtil.extendCaipNetworks(
  [baseNetwork, mainnetNetwork, polygonNetwork, sepoliaNetwork, solanaNetwork],
  { customNetworkImageUrls: {}, projectId: 'test-project-id' }
) as [CaipNetwork, CaipNetwork, CaipNetwork, CaipNetwork, CaipNetwork]

// Mock all controllers and UniversalAdapterClient
vi.mock('@reown/appkit-core')
vi.mock('../src/universal-adapter/client')
vi.mock('../src/client.ts', async () => {
  const actual = await vi.importActual('../src/client.ts')

  return {
    ...actual,
    injectModalUi: vi.fn(),
    syncExistingConnection: vi.fn()
  }
})

vi.mocked(global).window = { location: { origin: '' } } as any
vi.mocked(global).document = {
  body: {
    insertAdjacentElement: vi.fn()
  } as any,
  createElement: vi.fn().mockReturnValue({ appendChild: vi.fn() }),
  getElementsByTagName: vi.fn().mockReturnValue([{ textContent: '' }]),
  querySelector: vi.fn()
} as any

describe('Base', () => {
  let appKit: AppKit

  beforeEach(() => {
    vi.mocked(ConnectorController).getConnectors = vi.fn().mockReturnValue([])
    vi.spyOn(ConstantsUtil, 'BALANCE_SUPPORTED_CHAINS', 'get').mockReturnValue(['eip155', 'solana'])
    appKit = new AppKit(mockOptions)

    vi.spyOn(OptionsController, 'getSnapshot').mockReturnValue({ ...OptionsController.state })
    vi.spyOn(ThemeController, 'getSnapshot').mockReturnValue({ ...ThemeController.state })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Base Initialization', () => {
    it('should initialize controllers', async () => {
      const copyMockOptions = { ...mockOptions }

      delete copyMockOptions.adapters

      await new Promise(resolve => setTimeout(resolve, 100))

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
      expect(ChainController.initialize).toHaveBeenCalledWith(
        mockOptions.adapters,
        [mainnet, sepolia, solana],
        {
          connectionControllerClient: expect.any(Object),
          networkControllerClient: expect.any(Object)
        }
      )
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

    it('should set partially defaultAccountType', () => {
      new AppKit({
        ...mockOptions,
        defaultAccountTypes: {
          eip155: 'eoa',
          bip122: 'ordinal'
        }
      })

      expect(OptionsController.setDefaultAccountTypes).toHaveBeenCalledWith({
        eip155: 'eoa',
        bip122: 'ordinal'
      })
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
      vi.spyOn(ThemeController.state, 'themeMode', 'get').mockReturnValueOnce('dark')
      expect(appKit.getThemeMode()).toBe('dark')
    })

    it('should set theme mode', () => {
      appKit.setThemeMode('light')
      expect(ThemeController.setThemeMode).toHaveBeenCalledWith('light')
    })

    it('should get theme variables', () => {
      vi.spyOn(ThemeController.state, 'themeVariables', 'get').mockReturnValueOnce({
        '--w3m-accent': '#000'
      })
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
      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        activeChain: 'eip155',
        activeCaipAddress: 'eip155:1:0x123',
        chains: new Map([['eip155', { namespace: 'eip155' }]])
      } as any)
      expect(appKit.getCaipAddress()).toBe('eip155:1:0x123')
    })

    it('should get address', () => {
      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        chains: new Map(),
        activeChain: 'eip155'
      } as any)
      vi.mocked(AccountController).state = { address: '0x123' } as any
      expect(appKit.getAddress()).toBe('0x123')
    })

    it('should get provider', () => {
      const mockProvider = vi.fn()
      vi.mocked(ProviderUtil.state).providers = { eip155: mockProvider } as any
      vi.mocked(ProviderUtil.state).providerIds = { eip155: 'INJECTED' } as any

      expect(appKit.getProvider<any>('eip155')).toBe(mockProvider)
    })

    it('should get preferred account type', () => {
      vi.mocked(AccountController).state = { preferredAccountType: 'eoa' } as any
      expect(appKit.getPreferredAccountType()).toBe('eoa')
    })

    it('should set CAIP address', () => {
      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        ...ChainController.state,
        activeChain: 'eip155',
        activeCaipAddress: 'eip155:1:0x123',
        chains: new Map([['eip155', { namespace: 'eip155' }]])
      } as unknown as ChainControllerState)

      appKit.setCaipAddress('eip155:1:0x123', 'eip155')
      expect(AccountController.setCaipAddress).toHaveBeenCalledWith('eip155:1:0x123', 'eip155')
      expect(appKit.getIsConnectedState()).toBe(true)
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
      const caipNetwork = mainnet
      appKit.setCaipNetwork(caipNetwork)
      expect(ChainController.setActiveCaipNetwork).toHaveBeenCalledWith(caipNetwork)
    })

    it('should get CAIP network', () => {
      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        activeCaipNetwork: mainnet,
        chains: new Map([['eip155', { namespace: 'eip155' }]])
      } as any)
      expect(appKit.getCaipNetwork()).toEqual(mainnet)
    })

    it('should set requested CAIP networks', () => {
      const requestedNetworks = [mainnet] as unknown as CaipNetwork[]
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
        preferredAccountType: 'eoa',
        user: {
          email: 'email@test.com',
          username: 'test'
        }
      }

      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        activeChain: 'eip155',
        chains: new Map([['eip155', { namespace: 'eip155' }]])
      } as any)

      vi.spyOn(CoreHelperUtil, 'createAccount').mockImplementation((namespace, address, type) => {
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
        isConnected: vi.fn().mockResolvedValue({ isConnected: false }),
        getEmail: vi.fn().mockReturnValue('email@email.com'),
        getUsername: vi.fn().mockReturnValue('test'),
        onSocialConnected: vi.fn(),
        syncDappData: vi.fn(),
        syncTheme: vi.fn()
      }

      const appKitWithAuth = new AppKit({
        ...mockOptions,
        features: {
          email: true
        }
      })
      ;(appKitWithAuth as any).authProvider = mockAuthProvider

      await (appKitWithAuth as any).syncAuthConnector(mockAuthProvider)

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
      const result = appKit.getConnectorImage({
        id: 'metamask',
        type: 'INJECTED',
        chain: 'eip155',
        name: 'Metamask'
      })
      expect(AssetUtil.getConnectorImage).toHaveBeenCalledWith({
        id: 'metamask',
        type: 'INJECTED',
        chain: 'eip155',
        name: 'Metamask'
      })
      expect(result).toBe('connector-image-url')
    })

    it('should switch network when requested', async () => {
      const mockAppKit = new AppKit(mockOptions)

      vi.mocked(ChainController.switchActiveNetwork).mockResolvedValue(undefined)

      mockAppKit.switchNetwork(mainnet)

      expect(ChainController.switchActiveNetwork).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mainnet.id,
          name: mainnet.name
        })
      )

      mockAppKit.switchNetwork(polygon)

      expect(ChainController.switchActiveNetwork).toHaveBeenCalledTimes(1)
    })

    it('should use the correct network when syncing account if is does not allow all networks and network is not allowed', async () => {
      vi.spyOn(AccountController, 'fetchTokenBalance').mockResolvedValue([
        {
          quantity: { numeric: '0.00', decimals: '18' },
          chainId: 'eip155:1',
          symbol: 'ETH'
        } as Balance
      ])
      vi.mocked(ChainController.getAllApprovedCaipNetworkIds).mockReturnValue([
        'eip155:1',
        'eip155:11155111'
      ])
      vi.spyOn(ChainController, 'getNetworkProp').mockReturnValue(false)
      vi.spyOn(ChainController.state, 'activeChain', 'get').mockReturnValueOnce('eip155')
      vi.spyOn(StorageUtil, 'getActiveNetworkProps').mockReturnValueOnce({
        namespace: mainnet.chainNamespace,
        chainId: mainnet.id,
        caipNetworkId: mainnet.caipNetworkId
      })
      vi.spyOn(OptionsController, 'state', 'get').mockReturnValueOnce({
        allowUnsupportedChain: false
      } as any)
      const mockAccountData = {
        address: '0x123',
        chainId: '2',
        chainNamespace: 'eip155' as const
      }

      await appKit['syncAccount'](mockAccountData)

      expect(ChainController.getNetworkProp).toHaveBeenCalledWith('supportsAllNetworks', 'eip155')
      expect(ChainController.setActiveCaipNetwork).toHaveBeenCalledWith(mainnet)
    })

    it('should set connected wallet info when syncing account', async () => {
      vi.spyOn(NetworkUtil, 'getNetworksByNamespace').mockReturnValue([
        {
          ...sepolia,
          nativeCurrency: { symbol: 'ETH' },
          chainNamespace: 'eip155'
        } as unknown as CaipNetwork
      ])
      vi.spyOn(AccountController, 'fetchTokenBalance').mockResolvedValue([
        {
          quantity: { numeric: '0.00', decimals: '18' },
          chainId: 'eip155:1',
          symbol: 'ETH'
        } as Balance
      ])
      vi.spyOn(ChainController, 'getAllApprovedCaipNetworkIds').mockReturnValue(['eip155:1'])
      vi.mocked(appKit as any).caipNetworks = [mainnet]
      // Mock the connector data
      const mockConnector = {
        id: 'test-wallet',
        name: 'Test Wallet',
        imageUrl: 'test-wallet-icon'
      } as Connector

      vi.mocked(ConnectorController.getConnectors).mockReturnValue([mockConnector])
      vi.mocked(StorageUtil.getActiveNetworkProps).mockReturnValue({
        namespace: mainnet.chainNamespace,
        chainId: mainnet.id,
        caipNetworkId: mainnet.caipNetworkId
      })

      const mockAccountData = {
        address: '0x123',
        chainId: mainnet.id,
        chainNamespace: mainnet.chainNamespace
      }

      vi.spyOn(StorageUtil, 'getConnectedConnectorId').mockReturnValue(mockConnector.id)

      await appKit['syncAccount'](mockAccountData)

      expect(AccountController.setConnectedWalletInfo).toHaveBeenCalledWith(
        expect.objectContaining({
          name: mockConnector.name,
          icon: mockConnector.imageUrl
        }),
        'eip155'
      )
    })

    it('should sync identity only if address changed', async () => {
      vi.spyOn(NetworkUtil, 'getNetworksByNamespace').mockReturnValue([
        {
          ...mainnet,
          nativeCurrency: { symbol: 'ETH' },
          chainNamespace: 'eip155'
        } as unknown as CaipNetwork
      ])
      vi.spyOn(AccountController, 'fetchTokenBalance').mockResolvedValue([
        {
          quantity: { numeric: '0.00', decimals: '18' },
          chainId: 'eip155:1',
          symbol: 'ETH'
        } as Balance
      ])
      vi.spyOn(ChainController, 'getAllApprovedCaipNetworkIds').mockReturnValue(['eip155:1'])
      vi.mocked(appKit as any).caipNetworks = [mainnet]
      const mockAccountData = {
        address: '0x123',
        chainId: mainnet.id,
        chainNamespace: mainnet.chainNamespace
      }

      vi.spyOn(StorageUtil, 'getActiveNetworkProps').mockReturnValue({
        namespace: mainnet.chainNamespace,
        chainId: mainnet.id,
        caipNetworkId: mainnet.caipNetworkId
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

    it('should not sync identity on non-evm network', async () => {
      vi.spyOn(NetworkUtil, 'getNetworksByNamespace').mockReturnValue([
        {
          ...solana,
          nativeCurrency: { symbol: 'SOL' },
          chainNamespace: 'solana'
        } as unknown as CaipNetwork
      ])
      vi.spyOn(AccountController, 'fetchTokenBalance').mockResolvedValue([
        {
          quantity: { numeric: '0.00', decimals: '18' },
          chainId: 'solana:1',
          symbol: 'SOL'
        } as Balance
      ])
      vi.spyOn(ChainController, 'getAllApprovedCaipNetworkIds').mockReturnValue(['solana:1'])
      vi.mocked(appKit as any).caipNetworks = [solana]
      const mockAccountData = {
        address: '0x123',
        chainId: solana.id,
        chainNamespace: solana.chainNamespace
      }
      vi.spyOn(StorageUtil, 'getActiveNetworkProps').mockReturnValueOnce({
        namespace: solana.chainNamespace,
        chainId: solana.id,
        caipNetworkId: solana.caipNetworkId
      })

      await appKit['syncAccount'](mockAccountData)

      expect(BlockchainApiController.fetchIdentity).not.toHaveBeenCalled()
    })

    it('should not sync identity on a test network', async () => {
      vi.spyOn(NetworkUtil, 'getNetworksByNamespace').mockReturnValue([
        {
          ...sepolia,
          nativeCurrency: { symbol: 'sETH' },
          chainNamespace: 'eip155'
        } as unknown as CaipNetwork
      ])
      vi.spyOn(AccountController, 'fetchTokenBalance').mockResolvedValue([
        {
          quantity: { numeric: '0.00', decimals: '18' },
          chainId: 'eip155:11155111',
          symbol: 'sETH'
        } as Balance
      ])
      vi.spyOn(ChainController, 'getAllApprovedCaipNetworkIds').mockReturnValue(['eip155:11155111'])
      vi.mocked(appKit as any).caipNetworks = [sepolia]
      const mockAccountData = {
        address: '0x123',
        chainId: '11155111',
        chainNamespace: 'eip155' as const
      }

      vi.spyOn(StorageUtil, 'getActiveNetworkProps').mockReturnValueOnce({
        namespace: 'eip155',
        chainId: '11155111',
        caipNetworkId: 'eip155:11155111'
      })

      await appKit['syncAccount'](mockAccountData)

      expect(BlockchainApiController.fetchIdentity).not.toHaveBeenCalled()
    })

    it('should  sync balance correctly', async () => {
      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        chains: new Map([['eip155', { namespace: 'eip155' }]]),
        activeChain: 'eip155',
        activeCaipNetwork: mainnet
      } as any)
      vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
        address: '0x123'
      } as any)

      vi.spyOn(NetworkUtil, 'getNetworksByNamespace').mockReturnValue([
        mainnet as unknown as CaipNetwork
      ])

      vi.spyOn(AccountController, 'fetchTokenBalance').mockResolvedValue([
        {
          quantity: { numeric: '0.00', decimals: '18' },
          chainId: 'eip155:1',
          symbol: 'ETH'
        } as Balance
      ])
      vi.spyOn(ChainController, 'getAllApprovedCaipNetworkIds').mockReturnValue(['eip155:1'])
      vi.spyOn(StorageUtil, 'getActiveNetworkProps').mockReturnValueOnce({
        namespace: mainnet.chainNamespace,
        chainId: mainnet.id,
        caipNetworkId: mainnet.caipNetworkId
      })

      const mockAccountData = {
        address: '0x123',
        chainId: mainnet.id,
        chainNamespace: mainnet.chainNamespace
      }

      vi.spyOn(AccountController, 'state', 'get').mockReturnValue(mockAccountData as any)

      appKit = new AppKit({ ...mockOptions })
      const adapter = { getBalance: vi.fn().mockResolvedValue({ balance: '0.00', symbol: 'ETH' }) }

      vi.mocked(appKit as any).getAdapter = vi.fn().mockReturnValue(adapter)

      await appKit['syncAccount']({ ...mockAccountData, address: '0x1234' })
      expect(adapter.getBalance).toHaveBeenCalled()
    })

    it('should not sync balance on testnets', async () => {
      vi.spyOn(NetworkUtil, 'getNetworksByNamespace').mockReturnValue([
        {
          ...sepolia,
          nativeCurrency: { symbol: 'sETH' },
          chainNamespace: 'eip155'
        } as unknown as CaipNetwork
      ])
      vi.spyOn(AccountController, 'fetchTokenBalance').mockResolvedValue([
        {
          quantity: { numeric: '0.00', decimals: '18' },
          chainId: 'eip155:11155111',
          symbol: 'sETH'
        } as Balance
      ])
      vi.spyOn(ChainController, 'getAllApprovedCaipNetworkIds').mockReturnValue(['eip155:11155111'])
      const mockAccountData = {
        address: '0x123',
        chainId: '11155111',
        chainNamespace: 'eip155' as const
      }

      vi.spyOn(StorageUtil, 'getActiveNetworkProps').mockReturnValueOnce({
        namespace: 'eip155',
        chainId: '11155111',
        caipNetworkId: 'eip155:11155111'
      })

      vi.spyOn(CaipNetworksUtil, 'extendCaipNetworks').mockReturnValueOnce([
        {
          id: '11155111',
          chainNamespace: 'eip155',
          caipNetworkId: 'eip155:11155111' as CaipNetworkId,
          testnet: true,
          nativeCurrency: { symbol: 'ETH' }
        } as CaipNetwork
      ])

      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        chains: new Map([['eip155', { namespace: 'eip155' }]]),
        activeChain: 'eip155'
      } as any)

      vi.spyOn(AccountController, 'state', 'get').mockReturnValue(mockAccountData as any)
      appKit = new AppKit({ ...mockOptions })

      const mockAdapter = {
        getBalance: vi.fn().mockResolvedValue({ balance: '0.00', symbol: 'sETH' })
      } as unknown as AdapterBlueprint

      vi.mocked(appKit as any).getAdapter = vi.fn().mockReturnValue(mockAdapter)
      await appKit['syncAccount'](mockAccountData)

      expect(AccountController.fetchTokenBalance).not.toHaveBeenCalled()
      expect(AccountController.setBalance).toHaveBeenCalledWith('0.00', 'sETH', 'eip155')
    })

    it('should disconnect correctly', async () => {
      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        chains: new Map([['eip155', { namespace: 'eip155' }]]),
        activeChain: 'eip155'
      } as any)

      const mockRemoveItem = vi.fn()

      vi.spyOn(SafeLocalStorage, 'removeItem').mockImplementation(mockRemoveItem)

      const appKit = new AppKit({
        ...mockOptions,
        networks: [base],
        adapters: [mockUniversalAdapter]
      })

      await appKit.disconnect()

      expect(ConnectionController.disconnect).toHaveBeenCalled()
      // TODO: Unmock all of this file and check for AccountController hooks called from ChainController
    })

    it('should not show unsupported chain UI when allowUnsupportedChain is true', async () => {
      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        chains: new Map([['eip155', { namespace: 'eip155' }]]),
        activeChain: 'eip155'
      } as any)
      ;(appKit as any).caipNetworks = [mainnet]

      OptionsController.state.allowUnsupportedChain = undefined
      vi.spyOn(OptionsController.state, 'allowUnsupportedChain', 'get').mockResolvedValueOnce(true)

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
        const connectorKey = getSafeConnectorIdKey('eip155')
        if (key === connectorKey) {
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
      vi.spyOn(AccountController, 'state', 'get').mockReturnValueOnce({
        currentTab: 0,
        addressLabels: new Map(),
        allAccounts: []
      })
      vi.mocked(CoreHelperUtil.isClient).mockReturnValueOnce(true)
      vi.spyOn(StorageUtil, 'getActiveNamespace').mockReturnValue('eip155')
      vi.spyOn(StorageUtil, 'getConnectedConnectorId').mockReturnValue('test-connector')
      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        activeCaipNetwork: { id: 'eip155:1', chainNamespace: 'eip155' } as CaipNetwork
      } as ChainControllerState)
      vi.mocked(StorageUtil.getActiveNetworkProps).mockReturnValue({
        namespace: mainnet.chainNamespace,
        chainId: mainnet.id,
        caipNetworkId: mainnet.caipNetworkId
      })

      const mockAdapter = {
        getAccounts: vi.fn().mockResolvedValue({ accounts: [{ address: '0x123', type: 'eoa' }] }),
        syncConnection: vi.fn().mockResolvedValue({
          address: '0x123',
          chainId: mainnet.id,
          chainNamespace: mainnet.chainNamespace,
          accounts: [{ address: '0x123', type: 'eoa' }]
        }),
        on: vi.fn(),
        getBalance: vi.fn().mockResolvedValue({ balance: '0', symbol: 'ETH' })
      }
      vi.spyOn(appKit as any, 'getAdapter').mockReturnValueOnce(mockAdapter)
      vi.mocked(appKit).chainNamespaces = ['eip155']

      await appKit['syncExistingConnection']()

      expect(mockAdapter.syncConnection).toHaveBeenCalled()
      expect(AccountController.setStatus).toHaveBeenCalledWith('connecting', 'eip155')
      expect(AccountController.setStatus).toHaveBeenCalledWith('connected', 'eip155')
    })

    it('should set status to "disconnected" when no connector is present', async () => {
      vi.mocked(CoreHelperUtil.isClient).mockReturnValueOnce(true)
      vi.spyOn(StorageUtil, 'getConnectedConnectorId').mockReturnValueOnce(undefined)
      vi.mocked(appKit).chainNamespaces = ['eip155']

      await appKit['syncExistingConnection']()

      expect(AccountController.setStatus).toHaveBeenCalledWith('disconnected', 'eip155')
    })

    it('should set status to "disconnected" if the connector is set to "AUTH" and the adapter fails to sync', async () => {
      vi.mocked(CoreHelperUtil.isClient).mockReturnValueOnce(true)
      vi.spyOn(SafeLocalStorage, 'getItem').mockImplementation(key => {
        const connectorKey = getSafeConnectorIdKey('eip155')
        if (key === connectorKey) {
          return 'AUTH'
        }
        if (key === SafeLocalStorageKeys.ACTIVE_CAIP_NETWORK_ID) {
          return 'eip155:1'
        }
        return undefined
      })
      vi.mocked(appKit).chainNamespaces = ['eip155']

      const mockAdapter = {
        getAccounts: vi.fn().mockResolvedValue({ accounts: [] }),
        syncConnection: vi.fn().mockResolvedValue(null),
        on: vi.fn()
      }
      vi.spyOn(appKit as any, 'getAdapter').mockReturnValueOnce(mockAdapter)

      await appKit['syncExistingConnection']()

      expect(AccountController.setStatus).toHaveBeenCalledWith('disconnected', 'eip155')
    })

    it('should reconnect to multiple namespaces if previously connected', async () => {
      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        chains: new Map(),
        activeChain: 'eip155'
      } as any)
      vi.spyOn(ProviderUtil, 'setProviderId').mockImplementation(vi.fn())
      vi.spyOn(StorageUtil, 'getActiveNetworkProps').mockReturnValue({
        namespace: 'eip155',
        chainId: mainnet.id,
        caipNetworkId: mainnet.caipNetworkId
      })
      vi.spyOn(StorageUtil, 'getConnectedNamespaces').mockReturnValueOnce(['eip155', 'solana'])
      vi.spyOn(StorageUtil, 'getConnectedConnectorId').mockImplementation(namespace => {
        if (namespace === 'eip155') {
          return 'evm-connector'
        }
        return 'solana-connector'
      })

      const mockEvmAdapter = {
        getAccounts: vi.fn().mockResolvedValue({ accounts: [{ address: '0x123', type: 'eoa' }] }),
        syncConnection: vi.fn().mockResolvedValue({
          address: '0x123',
          chainId: mainnet.id,
          chainNamespace: mainnet.chainNamespace,
          accounts: [{ address: '0x123', type: 'eoa' }],
          type: 'EXTERNAL',
          id: 'evm-connector'
        }),
        on: vi.fn()
      }

      const mockSolanaAdapter = {
        getAccounts: vi.fn().mockResolvedValue({ accounts: [{ address: 'Hgbsh1', type: 'eoa' }] }),
        syncConnection: vi.fn().mockResolvedValue({
          address: 'Hgbsh1',
          chainId: solana.id,
          chainNamespace: solana.chainNamespace,
          accounts: [{ address: 'Hgbsh1', type: 'eoa' }],
          type: 'EXTERNAL',
          id: 'solana-connector'
        }),
        on: vi.fn()
      }

      vi.spyOn(appKit as any, 'getAdapter').mockImplementation(namespace => {
        if (namespace === 'eip155') {
          return mockEvmAdapter
        }
        return mockSolanaAdapter
      })

      vi.mocked(appKit).chainNamespaces = ['eip155', 'solana']

      await appKit['syncExistingConnection']()

      expect(mockEvmAdapter.syncConnection).toHaveBeenCalled()
      expect(mockSolanaAdapter.syncConnection).toHaveBeenCalled()

      expect(mockEvmAdapter.getAccounts).toHaveBeenCalled()
      expect(mockSolanaAdapter.getAccounts).toHaveBeenCalled()

      expect(ProviderUtil.setProviderId).toHaveBeenCalledWith('eip155', 'EXTERNAL')
      expect(ProviderUtil.setProviderId).toHaveBeenCalledWith('solana', 'EXTERNAL')
      expect(StorageUtil.setConnectedConnectorId).toHaveBeenCalledWith('eip155', 'evm-connector')
      expect(StorageUtil.setConnectedConnectorId).toHaveBeenCalledWith('solana', 'solana-connector')
    })
  })
  describe('Base Initialization', () => {
    let appKit: AppKit
    let mockAdapter: AdapterBlueprint
    let mockUniversalAdapter: any

    beforeEach(() => {
      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        chains: new Map(),
        activeChain: 'eip155'
      } as any)

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
        emit: vi.fn(),
        removeAllEventListeners: vi.fn()
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
      const appKit = new AppKit({
        ...mockOptions,
        networks: [base],
        adapters: [mockAdapter]
      })

      const initChainAdapters = (appKit as any).initChainAdapters.bind(appKit)

      vi.spyOn(appKit as any, 'createUniversalProviderForAdapter').mockResolvedValueOnce(undefined)
      vi.spyOn(appKit as any, 'createAuthProviderForAdapter').mockReturnValueOnce(undefined)

      await initChainAdapters([mockAdapter])

      expect(mockAdapter.syncConnectors).toHaveBeenCalled()
    })

    it('should create UniversalAdapter when no blueprint is provided for namespace', async () => {
      const appKit = new AppKit({
        ...mockOptions,
        networks: [mainnetNetwork],
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
        networks: [mainnet]
      })
    })

    it('should initialize UniversalProvider when not provided in options', async () => {
      vi.spyOn(CoreHelperUtil, 'isClient').mockReturnValue(true)

      const upSpy = vi.spyOn(UniversalProvider, 'init')

      new AppKit({
        ...mockOptions,
        projectId: '123',
        networks: [mainnet],
        adapters: [mockAdapter]
      })

      // Wait for the promise to fetchIdentity to resolve
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(OptionsController.setUsingInjectedUniversalProvider).toHaveBeenCalled()
      expect(upSpy).toHaveBeenCalled()
    })

    it('should not initialize UniversalProvider when provided in options', async () => {
      vi.spyOn(CoreHelperUtil, 'isClient').mockReturnValue(true)

      const upSpy = vi.spyOn(UniversalProvider, 'init')

      new AppKit({
        ...mockOptions,
        projectId: 'test',
        networks: [mainnet],
        universalProvider: mockProvider,
        adapters: [mockAdapter]
      })

      // Wait for the promise to fetchIdentity to resolve
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(upSpy).not.toHaveBeenCalled()
      expect(OptionsController.setUsingInjectedUniversalProvider).toHaveBeenCalled()
    })

    it('should initialize multiple adapters for different namespaces', async () => {
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
      const appKit = new AppKit({
        ...mockOptions,
        networks: [mainnet],
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
        },
        {
          alert: ErrorUtil.ALERT_ERRORS.INVALID_PROJECT_ID,
          message:
            'Uncaught Error: WebSocket connection closed abnormally with code: 3000 (Unauthorized: invalid key)'
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
    vi.spyOn(NetworkUtil, 'getNetworksByNamespace').mockReturnValue([
      {
        ...sepolia,
        nativeCurrency: { symbol: 'sETH' },
        chainNamespace: 'eip155'
      } as unknown as CaipNetwork
    ])
    vi.spyOn(AccountController, 'fetchTokenBalance').mockResolvedValue([
      {
        quantity: { numeric: '0.00', decimals: '18' },
        chainId: 'eip155:11155111',
        symbol: 'sETH'
      } as Balance
    ])
    vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
      address: '0x'
    } as unknown as typeof AccountController.state)
    vi.spyOn(StorageUtil, 'getActiveNetworkProps').mockReturnValueOnce({
      namespace: mainnet.chainNamespace,
      chainId: mainnet.id,
      caipNetworkId: mainnet.caipNetworkId
    })

    const mockAccount = {
      address: '0x123',
      chainId: mainnet.id,
      chainNamespace: mainnet.chainNamespace
    }

    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      activeChain: mockAccount.chainNamespace,
      activeCaipAddress: `${mockAccount.chainNamespace}:${mockAccount.chainId}:${mockAccount.address}`,
      chains: new Map([])
    } as unknown as typeof ChainController.state)

    const emitter = new Emitter()

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

describe('Adapter Management', () => {
  let appKit: AppKit
  let mockAdapter: AdapterBlueprint

  beforeEach(() => {
    vi.spyOn(OptionsController, 'getSnapshot').mockReturnValue({ ...OptionsController.state })
    vi.spyOn(ThemeController, 'getSnapshot').mockReturnValue({ ...ThemeController.state })

    mockAdapter = {
      namespace: 'eip155',
      construct: vi.fn(),
      setUniversalProvider: vi.fn(),
      setAuthProvider: vi.fn(),
      syncConnectors: vi.fn(),
      connectors: [],
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
      removeAllEventListeners: vi.fn()
    } as unknown as AdapterBlueprint

    appKit = new AppKit({
      ...mockOptions,
      networks: [mainnet],
      adapters: [mockAdapter]
    })

    // Mock the clients needed for adapter operations
    ;(appKit as any).connectionControllerClient = {}
    ;(appKit as any).networkControllerClient = {}
  })

  describe('addAdapter', () => {
    it('should add a new adapter successfully', () => {
      const newAdapter = {
        namespace: 'solana',
        construct: vi.fn(),
        setUniversalProvider: vi.fn(),
        setAuthProvider: vi.fn(),
        syncConnectors: vi.fn(),
        connectors: [],
        on: vi.fn(),
        off: vi.fn(),
        emit: vi.fn()
      } as unknown as ChainAdapter

      appKit.addAdapter(newAdapter, [solana])

      expect(appKit.chainAdapters?.solana).toBeDefined()
      expect(appKit.chainNamespaces).toContain('solana')
      expect(ChainController.addAdapter).toHaveBeenCalledWith(
        newAdapter,
        {
          connectionControllerClient: expect.any(Object),
          networkControllerClient: expect.any(Object)
        },
        expect.any(Array)
      )
    })

    it('should not add adapter if clients are not initialized', () => {
      const newAdapter = {
        namespace: 'solana'
      } as unknown as ChainAdapter

      // Remove clients
      ;(appKit as any).connectionControllerClient = undefined
      ;(appKit as any).networkControllerClient = undefined

      appKit.addAdapter(newAdapter, [solana])

      expect(appKit.chainAdapters?.solana).toBeUndefined()
    })

    it('should not add adapter if chainAdapters is not initialized', () => {
      vi.spyOn(appKit as any, 'createAdapter').mockImplementation(() => {})
      vi.spyOn(appKit as any, 'initChainAdapter').mockImplementation(() => {})
      vi.spyOn(ChainController, 'addAdapter').mockImplementation(() => {})

      const newAdapter = {
        namespace: 'solana'
      } as unknown as ChainAdapter

      // Remove chainAdapters
      ;(appKit as any).chainAdapters = undefined

      appKit.addAdapter(newAdapter, [solana])

      expect((appKit as any).createAdapter).not.toHaveBeenCalled()
      expect((appKit as any).initChainAdapter).not.toHaveBeenCalled()
      expect(ChainController.addAdapter).not.toHaveBeenCalled()
    })
  })

  describe('removeAdapter', () => {
    it('should remove an existing adapter successfully', () => {
      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        activeCaipAddress: undefined
      } as any)

      appKit.removeAdapter('eip155')

      expect(appKit.chainAdapters?.eip155).toBeUndefined()
      expect(appKit.chainNamespaces).not.toContain('eip155')
      expect(mockAdapter.removeAllEventListeners).toHaveBeenCalled()
      expect(ChainController.removeAdapter).toHaveBeenCalledWith('eip155')
      expect(ConnectorController.removeAdapter).toHaveBeenCalledWith('eip155')
    })

    it('should not remove adapter if user is connected', () => {
      vi.spyOn(ChainController, 'removeAdapter').mockImplementation(() => {})
      vi.spyOn(ConnectorController, 'removeAdapter').mockImplementation(() => {})

      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        activeCaipAddress: 'eip155:1:0x123'
      } as any)

      appKit.removeAdapter('eip155')

      expect(appKit.chainAdapters?.eip155).toBeDefined()
      expect(appKit.chainNamespaces).toContain('eip155')
      expect(mockAdapter.removeAllEventListeners).not.toHaveBeenCalled()
      expect(ChainController.removeAdapter).not.toHaveBeenCalled()
      expect(ConnectorController.removeAdapter).not.toHaveBeenCalled()
    })

    it('should not remove adapter if adapter does not exist', () => {
      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        activeCaipAddress: undefined
      } as any)

      appKit.removeAdapter('polkadot' as ChainNamespace)

      expect(ChainController.removeAdapter).not.toHaveBeenCalled()
      expect(ConnectorController.removeAdapter).not.toHaveBeenCalled()
    })

    it('should not remove adapter if chainAdapters is not initialized', () => {
      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        activeCaipAddress: undefined
      } as any)

      // Remove chainAdapters
      ;(appKit as any).chainAdapters = undefined

      appKit.removeAdapter('eip155')

      expect(ChainController.removeAdapter).not.toHaveBeenCalled()
      expect(ConnectorController.removeAdapter).not.toHaveBeenCalled()
    })
  })
})

describe('Balance sync', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.spyOn(ConstantsUtil, 'BALANCE_SUPPORTED_CHAINS', 'get').mockReturnValue(['eip155', 'solana'])
    vi.spyOn(OptionsController, 'getSnapshot').mockReturnValue({ ...OptionsController.state })
    vi.spyOn(ThemeController, 'getSnapshot').mockReturnValue({ ...ThemeController.state })
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({ ...ChainController.state })
  })

  it('should not sync balance if theres no matching caipNetwork', async () => {
    const appKit = new AppKit({
      ...mockOptions,
      networks: [mainnet]
    })

    vi.spyOn(NetworkUtil, 'getNetworksByNamespace').mockReturnValue([])

    await appKit['syncBalance']({
      address: '0x123',
      chainId: sepolia.id,
      chainNamespace: sepolia.chainNamespace
    })

    expect(NetworkUtil.getNetworksByNamespace).toHaveBeenCalled()
    expect(AccountController.fetchTokenBalance).not.toHaveBeenCalled()
    expect(AccountController.setBalance).not.toHaveBeenCalled()
  })

  it('should fetch native balance on testnet', async () => {
    vi.spyOn(NetworkUtil, 'getNetworksByNamespace').mockReturnValue([
      { ...sepolia, caipNetworkId: 'eip155:11155111', chainNamespace: 'eip155' }
    ])

    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      chains: new Map([['eip155', { namespace: 'eip155' }]]),
      activeChain: 'eip155'
    } as any)

    vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
      address: '0x123'
    } as any)

    const mockAdapter = {
      ...mockUniversalAdapter,
      getBalance: vi.fn().mockResolvedValue({ balance: '1.00', symbol: 'sETH' })
    }

    const appKit = new AppKit({
      ...mockOptions,
      adapters: [mockAdapter],
      networks: [sepolia]
    })

    await appKit['syncBalance']({
      address: '0x123',
      chainId: sepolia.id,
      chainNamespace: 'eip155' as const
    })

    expect(NetworkUtil.getNetworksByNamespace).toHaveBeenCalled()
    expect(AccountController.fetchTokenBalance).not.toHaveBeenCalled()
    expect(AccountController.setBalance).toHaveBeenCalledWith('1.00', 'sETH', 'eip155')
  })

  it('should set the correct native token balance', async () => {
    vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
      address: '0x123'
    } as any)

    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      chains: new Map([['eip155', { namespace: 'eip155' }]]),
      activeChain: 'eip155',
      activeCaipNetwork: mainnet
    } as any)

    vi.spyOn(NetworkUtil, 'getNetworksByNamespace').mockReturnValue([
      { ...mainnet, caipNetworkId: 'eip155:1', chainNamespace: 'eip155' }
    ])

    vi.spyOn(AccountController, 'fetchTokenBalance').mockResolvedValue([
      {
        quantity: { numeric: '1.00', decimals: '18' },
        chainId: 'eip155:1',
        symbol: 'ETH'
      },
      {
        quantity: { numeric: '0.00', decimals: '18' },
        chainId: 'eip155:137',
        symbol: 'POL'
      },
      {
        quantity: { numeric: '0.00', decimals: '18' },
        chainId: 'eip155:1',
        symbol: 'USDC'
      }
    ] as Balance[])

    const appKit = new AppKit({
      ...mockOptions,
      networks: [mainnet]
    })

    const mockAdapter = {
      ...mockUniversalAdapter,
      getBalance: vi.fn().mockResolvedValue({ balance: '1.00', symbol: 'ETH' })
    }

    vi.mocked(appKit as any).getAdapter = vi.fn().mockReturnValue(mockAdapter)

    await appKit['syncBalance']({
      address: '0x123',
      chainId: mainnet.id,
      chainNamespace: 'eip155' as const
    })

    expect(NetworkUtil.getNetworksByNamespace).toHaveBeenCalled()
    expect(mockAdapter.getBalance).toHaveBeenCalled()
    expect(AccountController.setBalance).toHaveBeenCalledWith(
      '1.00',
      mainnet.nativeCurrency.symbol,
      'eip155'
    )
  })
})

describe('WalletConnect Events', () => {
  let appkit: AppKit
  let universalProvider: Mocked<Pick<UniversalProvider, 'on'>>

  let chainChangedCallback: (chainId: string | number) => void
  let displayUriCallback: (uri: string) => void

  beforeEach(async () => {
    appkit = new AppKit({
      ...mockOptions,
      adapters: [],
      networks: [mainnet]
    })

    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({} as any)

    universalProvider = { on: vi.fn() }
    appkit['universalProvider'] = universalProvider as any
    appkit['caipNetworks'] = mockOptions.networks as any
    appkit['listenWalletConnect']()

    chainChangedCallback = universalProvider.on.mock.calls.find(
      ([event]) => event === 'chainChanged'
    )?.[1]
    displayUriCallback = universalProvider.on.mock.calls.find(
      ([event]) => event === 'display_uri'
    )?.[1]
  })

  describe('chainChanged', () => {
    it('should call setUnsupportedNetwork', () => {
      const setUnsupportedNetworkSpy = vi.spyOn(appkit as any, 'setUnsupportedNetwork')

      chainChangedCallback('unknown_chain_id')
      expect(setUnsupportedNetworkSpy).toHaveBeenCalledWith('unknown_chain_id')
    })

    it('should call setCaipNetwork', () => {
      const setCaipNetworkSpy = vi.spyOn(appkit as any, 'setCaipNetwork')

      const newChain = mockOptions.networks[0]!

      // should accept as number
      chainChangedCallback(newChain.id)
      expect(setCaipNetworkSpy).toHaveBeenNthCalledWith(1, newChain)

      // should accept as string
      ChainController.state.activeCaipNetwork = undefined
      chainChangedCallback(newChain.id.toString())
      expect(setCaipNetworkSpy).toHaveBeenNthCalledWith(2, newChain)
    })
  })

  describe('open', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      vi.spyOn(OptionsController, 'getSnapshot').mockReturnValue({ ...OptionsController.state })
      vi.spyOn(ThemeController, 'getSnapshot').mockReturnValue({ ...ThemeController.state })
    })

    it('should open different views', async () => {
      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        ...ChainController.state,
        activeCaipNetwork: mainnet
      })
      const openSpy = vi.spyOn(ModalController, 'open')

      const views = [
        'Account',
        'Connect',
        'Networks',
        'ApproveTransaction',
        'OnRampProviders',
        'ConnectingWalletConnectBasic',
        'Swap',
        'WhatIsAWallet',
        'WhatIsANetwork',
        'AllWallets',
        'WalletSend'
      ] as const

      const appkit = new AppKit({
        ...mockOptions,
        adapters: [],
        networks: [mainnet]
      })

      for (const view of views) {
        await appkit.open({ view })
        expect(openSpy).toHaveBeenCalledWith({ view })
      }
    })

    it('should filter connectors by namespace when opening modal', async () => {
      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        ...ChainController.state,
        activeCaipNetwork: mainnet
      })
      const openSpy = vi.spyOn(ModalController, 'open')
      const setFilterByNamespaceSpy = vi.spyOn(ConnectorController, 'setFilterByNamespace')

      const appkit = new AppKit({
        ...mockOptions,
        adapters: [],
        networks: [mainnet]
      })

      await appkit.open({ view: 'Connect', namespace: 'eip155' })

      expect(openSpy).toHaveBeenCalled()
      expect(setFilterByNamespaceSpy).toHaveBeenCalledWith('eip155')
    })
  })

  describe('display_uri', () => {
    it('should call openUri', () => {
      displayUriCallback('mock_uri')
      expect(ConnectionController.setUri).toHaveBeenCalledWith('mock_uri')
    })
  })
})
