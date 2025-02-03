import UniversalProvider from '@walletconnect/universal-provider'
import { type Mocked, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type { AccountControllerState } from '@reown/appkit'
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
import { ProviderUtil } from '../src/store'
import { UniversalAdapter } from '../src/universal-adapter/client'
import mockUniversalAdapter from './mocks/Adapter'
import {
  base,
  mainnet,
  mockEvmAdapter,
  mockOptions,
  mockSolanaAdapter,
  polygon,
  sepolia,
  solana
} from './mocks/Options'
import mockProvider from './mocks/UniversalProvider'

// Mock all controllers and UniversalAdapterClient
vi.mock('../src/universal-adapter/client')

vi.mocked(global).window = { location: { origin: '' } } as any
vi.mocked(global).document = {
  body: {
    insertAdjacentElement: vi.fn()
  } as any,
  createElement: vi.fn().mockReturnValue({ appendChild: vi.fn() }),
  getElementsByTagName: vi.fn().mockReturnValue([{ textContent: '' }]),
  querySelector: vi.fn()
} as any

vi.mocked(BlockchainApiController).getSupportedNetworks = vi.fn().mockResolvedValue({
  http: ['eip155:1', 'eip155:137'],
  ws: ['eip155:1', 'eip155:137']
})
vi.mocked(StorageUtil).getActiveNetworkProps = vi.fn().mockReturnValue({
  namespace: 'eip155',
  caipNetworkId: 'eip155:1',
  chainId: 1
})

describe('Base', () => {
  let appKit: AppKit

  describe('Base Initialization', () => {
    it('should initialize controllers', async () => {
      const sendEvent = vi.spyOn(EventsController, 'sendEvent')
      const initialize = vi.spyOn(ChainController, 'initialize')

      appKit = new AppKit(mockOptions)

      const options = { ...mockOptions }
      delete options.adapters

      expect(sendEvent).toHaveBeenCalled()
      expect(sendEvent).toHaveBeenCalledWith({
        type: 'track',
        event: 'INITIALIZE',
        properties: {
          ...options,
          networks: options.networks.map((n: AppKitNetwork) => n.id),
          siweConfig: {
            options: options.siweConfig?.options || {}
          }
        }
      })

      expect(initialize).toHaveBeenCalledOnce()
      expect(initialize).toHaveBeenCalledWith(mockOptions.adapters, [mainnet, sepolia, solana], {
        connectionControllerClient: expect.any(Object),
        networkControllerClient: expect.any(Object)
      })
    })

    it('should set EIP6963 enabled by default', () => {
      const setEIP6963Enabled = vi.spyOn(OptionsController, 'setEIP6963Enabled')

      appKit = new AppKit(mockOptions)

      expect(setEIP6963Enabled).toHaveBeenCalledWith(true)
    })

    it('should set EIP6963 disabled when option is disabled in config', () => {
      const setEIP6963Enabled = vi.spyOn(OptionsController, 'setEIP6963Enabled')

      appKit = new AppKit({
        ...mockOptions,
        enableEIP6963: false
      })

      expect(setEIP6963Enabled).toHaveBeenCalledWith(false)
    })

    it('should set partially defaultAccountType', () => {
      const setDefaultAccountTypes = vi.spyOn(OptionsController, 'setDefaultAccountTypes')

      new AppKit({
        ...mockOptions,
        defaultAccountTypes: {
          eip155: 'eoa',
          bip122: 'ordinal'
        }
      })

      expect(setDefaultAccountTypes).toHaveBeenCalledWith({
        eip155: 'eoa',
        bip122: 'ordinal'
      })
    })
  })

  describe('Base Public methods', () => {
    beforeAll(() => {
      appKit = new AppKit(mockOptions)
    })

    it('should open modal', async () => {
      const open = vi.spyOn(ModalController, 'open')

      await appKit.open()
      expect(open).toHaveBeenCalled()
    })

    it('should close modal', async () => {
      const close = vi.spyOn(ModalController, 'close')

      await appKit.close()
      expect(close).toHaveBeenCalled()
    })

    it('should set loading state', () => {
      const setLoading = vi.spyOn(ModalController, 'setLoading')

      appKit.setLoading(true)
      expect(setLoading).toHaveBeenCalledWith(true)
    })

    it('should get theme mode', () => {
      vi.spyOn(ThemeController.state, 'themeMode', 'get').mockReturnValueOnce('dark')
      expect(appKit.getThemeMode()).toBe('dark')
    })

    it('should set theme mode', () => {
      const setThemeMode = vi.spyOn(ThemeController, 'setThemeMode')

      appKit.setThemeMode('light')

      expect(setThemeMode).toHaveBeenCalledWith('light')
    })

    it('should get theme variables', () => {
      vi.spyOn(ThemeController.state, 'themeVariables', 'get').mockReturnValueOnce({
        '--w3m-accent': '#000'
      })
      expect(appKit.getThemeVariables()).toEqual({ '--w3m-accent': '#000' })
    })

    it('should set theme variables', () => {
      const setThemeVariables = vi.spyOn(ThemeController, 'setThemeVariables')

      const themeVariables = { '--w3m-accent': '#fff' }
      appKit.setThemeVariables(themeVariables)
      expect(setThemeVariables).toHaveBeenCalledWith(themeVariables)
    })

    it('should subscribe to theme changes', () => {
      const subscribe = vi.spyOn(ThemeController, 'subscribe')

      const callback = vi.fn()
      appKit.subscribeTheme(callback)
      expect(subscribe).toHaveBeenCalledWith(callback)
    })

    it('should get wallet info', () => {
      vi.mocked(AccountController).state = { connectedWalletInfo: { name: 'Test Wallet' } } as any
      expect(appKit.getWalletInfo()).toEqual({ name: 'Test Wallet' })
    })

    it('should subscribe to wallet info changes', () => {
      const subscribe = vi.spyOn(AccountController, 'subscribeKey')

      const callback = vi.fn()
      appKit.subscribeWalletInfo(callback)
      expect(subscribe).toHaveBeenCalledWith('connectedWalletInfo', callback)
    })

    it('should subscribe to address updates', () => {
      const subscribe = vi.spyOn(AccountController, 'subscribeKey')

      const callback = vi.fn()
      appKit.subscribeShouldUpdateToAddress(callback)
      expect(subscribe).toHaveBeenCalledWith('shouldUpdateToAddress', callback)
    })

    it('should subscribe to CAIP network changes', () => {
      const subscribeKey = vi.spyOn(ChainController, 'subscribeKey')

      const callback = vi.fn()
      appKit.subscribeCaipNetworkChange(callback)
      expect(subscribeKey).toHaveBeenCalledWith('activeCaipNetwork', callback)
    })

    it('should get state', () => {
      vi.mocked(PublicStateController).state = { isConnected: true } as any
      expect(appKit.getState()).toEqual({ isConnected: true })
    })

    it('should subscribe to state changes', () => {
      const subscribe = vi.spyOn(PublicStateController, 'subscribe')

      const callback = vi.fn()
      appKit.subscribeState(callback)
      expect(subscribe).toHaveBeenCalledWith(callback)
    })

    it('should show error message', () => {
      const showError = vi.spyOn(SnackController, 'showError')

      appKit.showErrorMessage('Test error')
      expect(showError).toHaveBeenCalledWith('Test error')
    })

    it('should show success message', () => {
      const showSuccess = vi.spyOn(SnackController, 'showSuccess')

      appKit.showSuccessMessage('Test success')
      expect(showSuccess).toHaveBeenCalledWith('Test success')
    })

    it('should get event', () => {
      vi.mocked(EventsController).state = { name: 'test_event' } as any
      expect(appKit.getEvent()).toEqual({ name: 'test_event' })
    })

    it('should subscribe to events', () => {
      const subscribe = vi.spyOn(EventsController, 'subscribe')

      const callback = vi.fn()
      appKit.subscribeEvents(callback)
      expect(subscribe).toHaveBeenCalledWith(callback)
    })

    it('should replace route', () => {
      const replace = vi.spyOn(RouterController, 'replace')

      appKit.replace('Connect')
      expect(replace).toHaveBeenCalledWith('Connect')
    })

    it('should redirect to route', () => {
      const push = vi.spyOn(RouterController, 'push')

      appKit.redirect('Networks')
      expect(push).toHaveBeenCalledWith('Networks')
    })

    it('should pop transaction stack', () => {
      const popTransactionStack = vi.spyOn(RouterController, 'popTransactionStack')

      appKit.popTransactionStack(true)
      expect(popTransactionStack).toHaveBeenCalledWith(true)
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
      const setStatus = vi.spyOn(AccountController, 'setStatus')

      appKit.setStatus('connected', 'eip155')
      expect(setStatus).toHaveBeenCalledWith('connected', 'eip155')
    })

    it('should set all accounts', () => {
      const setAllAccounts = vi.spyOn(AccountController, 'setAllAccounts')
      const setHasMultipleAddresses = vi.spyOn(OptionsController, 'setHasMultipleAddresses')
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
      expect(setAllAccounts).toHaveBeenCalledWith(evmAddresses, 'eip155')
      expect(setAllAccounts).toHaveBeenCalledWith(solanaAddresses, 'solana')
      expect(setAllAccounts).toHaveBeenCalledWith(bip122Addresses, 'bip122')
      expect(setHasMultipleAddresses).toHaveBeenCalledWith(true)
    })

    it('should add address label', () => {
      const addAddressLabel = vi.spyOn(AccountController, 'addAddressLabel')

      appKit.addAddressLabel('0x123', 'eip155 Address', 'eip155')
      expect(addAddressLabel).toHaveBeenCalledWith('0x123', 'eip155 Address', 'eip155')
    })

    it('should remove address label', () => {
      const removeAddressLabel = vi.spyOn(AccountController, 'removeAddressLabel')

      appKit.removeAddressLabel('0x123', 'eip155')
      expect(removeAddressLabel).toHaveBeenCalledWith('0x123', 'eip155')
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
      const setCaipAddress = vi.spyOn(AccountController, 'setCaipAddress')

      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        ...ChainController.state,
        activeChain: 'eip155',
        activeCaipAddress: 'eip155:1:0x123',
        chains: new Map([['eip155', { namespace: 'eip155' }]])
      } as unknown as ChainControllerState)

      appKit.setCaipAddress('eip155:1:0x123', 'eip155')
      expect(setCaipAddress).toHaveBeenCalledWith('eip155:1:0x123', 'eip155')
      expect(appKit.getIsConnectedState()).toBe(true)
    })

    it('should set balance', () => {
      const setBalance = vi.spyOn(AccountController, 'setBalance')

      appKit.setBalance('1.5', 'ETH', 'eip155')
      expect(setBalance).toHaveBeenCalledWith('1.5', 'ETH', 'eip155')
    })

    it('should set profile name', () => {
      const setProfileName = vi.spyOn(AccountController, 'setProfileName')

      appKit.setProfileName('John Doe', 'eip155')
      expect(setProfileName).toHaveBeenCalledWith('John Doe', 'eip155')
    })

    it('should set profile image', () => {
      const setProfileImage = vi.spyOn(AccountController, 'setProfileImage')

      appKit.setProfileImage('https://example.com/image.png', 'eip155')
      expect(setProfileImage).toHaveBeenCalledWith('https://example.com/image.png', 'eip155')
    })

    it('should reset account', () => {
      const resetAccount = vi.spyOn(AccountController, 'resetAccount')

      appKit.resetAccount('eip155')
      expect(resetAccount).toHaveBeenCalledWith('eip155')
    })

    it('should set CAIP network', () => {
      const setActiveCaipNetwork = vi.spyOn(ChainController, 'setActiveCaipNetwork')
      const caipNetwork = mainnet

      appKit.setCaipNetwork(caipNetwork)

      expect(setActiveCaipNetwork).toHaveBeenCalledWith(caipNetwork)
    })

    it('should get CAIP network', () => {
      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        activeCaipNetwork: mainnet,
        chains: new Map([['eip155', { namespace: 'eip155' }]])
      } as any)
      expect(appKit.getCaipNetwork()).toEqual(mainnet)
    })

    it('should set requested CAIP networks', () => {
      const setRequestedCaipNetworks = vi.spyOn(ChainController, 'setRequestedCaipNetworks')
      const requestedNetworks = [mainnet] as unknown as CaipNetwork[]

      appKit.setRequestedCaipNetworks(requestedNetworks, 'eip155')

      expect(setRequestedCaipNetworks).toHaveBeenCalledWith(requestedNetworks, 'eip155')
    })

    it('should set connectors', () => {
      const getConnectors = vi.spyOn(ConnectorController, 'getConnectors')
      const setConnectors = vi.spyOn(ConnectorController, 'setConnectors')
      const existingConnectors = [
        { id: 'phantom', name: 'Phantom', chain: 'eip155', type: 'INJECTED' }
      ] as Connector[]

      // Mock getConnectors to return existing connectors
      vi.mocked(getConnectors).mockReturnValue(existingConnectors)

      const newConnectors = [
        { id: 'metamask', name: 'MetaMask', chain: 'eip155', type: 'INJECTED' }
      ] as Connector[]

      appKit.setConnectors(newConnectors)

      // Verify that setConnectors was called with combined array
      expect(setConnectors).toHaveBeenCalledWith([...existingConnectors, ...newConnectors])
    })

    it('should add connector', () => {
      const addConnector = vi.spyOn(ConnectorController, 'addConnector')
      const connector = {
        id: 'metamask',
        name: 'MetaMask',
        chain: 'eip155',
        type: 'INJECTED'
      } as Connector

      appKit.addConnector(connector)

      expect(addConnector).toHaveBeenCalledWith(connector)
    })

    it('should get connectors', () => {
      const getConnectors = vi.spyOn(ConnectorController, 'getConnectors')
      const mockConnectors = [
        { id: 'metamask', name: 'MetaMask', chain: 'eip155:1', type: 'INJECTED' as const }
      ] as any
      vi.mocked(getConnectors).mockReturnValue(mockConnectors)

      expect(appKit.getConnectors()).toEqual(mockConnectors)
    })

    it('should get approved CAIP network IDs', () => {
      const getAllApprovedCaipNetworkIds = vi.spyOn(ChainController, 'getAllApprovedCaipNetworkIds')
      getAllApprovedCaipNetworkIds.mockReturnValueOnce(['eip155:1'])

      expect(appKit.getApprovedCaipNetworkIds()).toEqual(['eip155:1'])
    })

    it('should set approved CAIP networks data', () => {
      const setApprovedCaipNetworksData = vi.spyOn(ChainController, 'setApprovedCaipNetworksData')

      appKit.setApprovedCaipNetworksData('eip155')

      expect(setApprovedCaipNetworksData).toHaveBeenCalledWith('eip155')
    })

    it('should reset network', () => {
      const resetNetwork = vi.spyOn(ChainController, 'resetNetwork')

      appKit.resetNetwork('eip155')

      expect(resetNetwork).toHaveBeenCalled()
    })

    it('should reset WC connection', () => {
      const resetWcConnection = vi.spyOn(ConnectionController, 'resetWcConnection')

      appKit.resetWcConnection()

      expect(resetWcConnection).toHaveBeenCalled()
    })

    it('should fetch identity', async () => {
      const mockRequest = { caipChainId: 'eip155:1', address: '0x123' }
      const fetchIdentity = vi.spyOn(BlockchainApiController, 'fetchIdentity')
      fetchIdentity.mockResolvedValue({
        name: 'John Doe',
        avatar: null
      })

      const result = await appKit.fetchIdentity(mockRequest)

      expect(fetchIdentity).toHaveBeenCalledWith(mockRequest)
      expect(result).toEqual({ name: 'John Doe', avatar: null })
    })

    it('should set address explorer URL', () => {
      const setAddressExplorerUrl = vi.spyOn(AccountController, 'setAddressExplorerUrl')

      appKit.setAddressExplorerUrl('https://etherscan.io/address/0x123', 'eip155')

      expect(setAddressExplorerUrl).toHaveBeenCalledWith(
        'https://etherscan.io/address/0x123',
        'eip155'
      )
    })

    it('should set smart account deployed', () => {
      const setSmartAccountDeployed = vi.spyOn(AccountController, 'setSmartAccountDeployed')

      appKit.setSmartAccountDeployed(true, 'eip155')

      expect(setSmartAccountDeployed).toHaveBeenCalledWith(true, 'eip155')
    })

    it('should set connected wallet info', () => {
      const walletInfo = { name: 'MetaMask', icon: 'icon-url' }
      const setConnectedWalletInfo = vi.spyOn(AccountController, 'setConnectedWalletInfo')

      appKit.setConnectedWalletInfo(walletInfo, 'eip155')

      expect(setConnectedWalletInfo).toHaveBeenCalledWith(walletInfo, 'eip155')
    })

    it('should set smart account enabled networks', () => {
      const networks = [1, 137]
      const setSmartAccountEnabledNetworks = vi.spyOn(
        ChainController,
        'setSmartAccountEnabledNetworks'
      )

      appKit.setSmartAccountEnabledNetworks(networks, 'eip155')

      expect(setSmartAccountEnabledNetworks).toHaveBeenCalledWith(networks, 'eip155')
    })

    it('should set preferred account type', () => {
      const setPreferredAccountType = vi.spyOn(AccountController, 'setPreferredAccountType')

      appKit.setPreferredAccountType('eoa', 'eip155')

      expect(setPreferredAccountType).toHaveBeenCalledWith('eoa', 'eip155')
    })

    it('should create accounts with correct account types from user accounts', async () => {
      const createAccount = vi.spyOn(CoreHelperUtil, 'createAccount')
      const setAllAccounts = vi.spyOn(AccountController, 'setAllAccounts')
      const setPreferredAccountType = vi.spyOn(AccountController, 'setPreferredAccountType')

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

      expect(createAccount).toHaveBeenCalledWith('eip155', '0x1', 'eoa')
      expect(createAccount).toHaveBeenCalledWith('eip155', '0x2', 'smartAccount')
      expect(setAllAccounts).toHaveBeenCalledWith(
        [
          { address: '0x1', type: 'eoa', namespace: 'eip155' },
          { address: '0x2', type: 'smartAccount', namespace: 'eip155' }
        ],
        'eip155'
      )
      expect(setPreferredAccountType).toHaveBeenCalledWith('eoa', 'eip155')
    })

    it('should get Reown name', async () => {
      const getNamesForAddress = vi.spyOn(EnsController, 'getNamesForAddress')
      getNamesForAddress.mockResolvedValue([
        {
          name: 'john.reown.id',
          addresses: { eip155: { address: '0x123', created: '0' } },
          attributes: [],
          registered: 0,
          updated: 0
        }
      ])
      const result = await appKit.getReownName('john.reown.id')

      expect(getNamesForAddress).toHaveBeenCalledWith('john.reown.id')
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
      const setEIP6963Enabled = vi.spyOn(OptionsController, 'setEIP6963Enabled')

      appKit.setEIP6963Enabled(true)

      expect(setEIP6963Enabled).toHaveBeenCalledWith(true)
    })

    it('should set client ID', () => {
      const setClientId = vi.spyOn(BlockchainApiController, 'setClientId')

      appKit.setClientId('client-123')

      expect(setClientId).toHaveBeenCalledWith('client-123')
    })

    it('should get connector image', () => {
      const getConnectorImage = vi.spyOn(AssetUtil, 'getConnectorImage')
      getConnectorImage.mockReturnValue('connector-image-url')

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
      const switchActiveNetwork = vi.spyOn(ChainController, 'switchActiveNetwork')
      vi.mocked(ChainController.switchActiveNetwork).mockResolvedValueOnce(undefined)

      mockAppKit.switchNetwork(mainnet)

      expect(switchActiveNetwork).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mainnet.id,
          name: mainnet.name
        })
      )

      mockAppKit.switchNetwork(polygon)

      expect(switchActiveNetwork).toHaveBeenCalledTimes(1)
    })

    it.only('should use the correct network when syncing account if is does not allow all networks and network is not allowed', async () => {
      const setActiveCaipNetwork = vi.spyOn(ChainController, 'setActiveCaipNetwork')
      const fetchTokenBalance = vi.spyOn(AccountController, 'fetchTokenBalance')
      const getActiveNetworkProps = vi.spyOn(StorageUtil, 'getActiveNetworkProps')

      appKit = new AppKit({
        ...mockOptions,
        adapters: [mockEvmAdapter],
        networks: [mainnet, sepolia]
      })

      fetchTokenBalance.mockResolvedValue([
        {
          quantity: { numeric: '0.00', decimals: '18' },
          chainId: mainnet.caipNetworkId,
          symbol: 'ETH'
        } as Balance,
        {
          quantity: { numeric: '0.00', decimals: '18' },
          chainId: sepolia.caipNetworkId,
          symbol: 'sETH'
        } as Balance
      ])

      getActiveNetworkProps.mockReturnValueOnce({
        namespace: mainnet.chainNamespace,
        chainId: mainnet.id,
        caipNetworkId: mainnet.caipNetworkId
      })

      vi.spyOn(ChainController.state, 'activeChain', 'get').mockReturnValueOnce('eip155')

      const mockAccountData = {
        address: '0x123',
        chainId: '2',
        chainNamespace: 'eip155' as const
      }

      await appKit['syncAccount'](mockAccountData)

      console.log('>>> mainnet', mainnet?.rpcUrls?.chainDefault?.http?.[0])
      expect(setActiveCaipNetwork).toHaveBeenCalledWith(mainnet)
    })

    it('should set connected wallet info when syncing account', async () => {
      const setConnectedWalletInfo = vi.spyOn(AccountController, 'setConnectedWalletInfo')
      const getConnectors = vi.spyOn(ConnectorController, 'getConnectors')
      const getActiveNetworkProps = vi.spyOn(StorageUtil, 'getActiveNetworkProps')
      const fetchTokenBalance = vi.spyOn(AccountController, 'fetchTokenBalance')
      const getConnectedConnectorId = vi.spyOn(StorageUtil, 'getConnectedConnectorId')
      const mockConnector = {
        id: 'test-wallet',
        name: 'Test Wallet',
        imageUrl: 'test-wallet-icon'
      } as Connector
      const mockAccountData = {
        address: '0x123',
        chainId: mainnet.id,
        chainNamespace: mainnet.chainNamespace
      }

      fetchTokenBalance.mockResolvedValueOnce([
        {
          quantity: { numeric: '0.00', decimals: '18' },
          chainId: 'eip155:1',
          symbol: 'ETH'
        } as Balance
      ])
      getConnectors.mockReturnValueOnce([mockConnector])
      getActiveNetworkProps.mockReturnValueOnce({
        namespace: mainnet.chainNamespace,
        chainId: mainnet.id,
        caipNetworkId: mainnet.caipNetworkId
      })
      getConnectedConnectorId.mockReturnValueOnce(mockConnector.id)

      await appKit['syncAccount'](mockAccountData)

      expect(setConnectedWalletInfo).toHaveBeenCalledWith(
        expect.objectContaining({
          name: mockConnector.name,
          icon: mockConnector.imageUrl
        }),
        'eip155'
      )
    })

    it('should sync identity only if address changed', async () => {
      const fetchIdentity = vi.spyOn(BlockchainApiController, 'fetchIdentity')
      const mockAccountData = {
        address: '0x123',
        chainId: mainnet.id,
        chainNamespace: mainnet.chainNamespace
      }
      vi.spyOn(AccountController, 'fetchTokenBalance').mockResolvedValue([
        {
          quantity: { numeric: '0.00', decimals: '18' },
          chainId: 'eip155:1',
          symbol: 'ETH'
        } as Balance
      ])
      vi.spyOn(StorageUtil, 'getActiveNetworkProps').mockReturnValueOnce({
        namespace: mainnet.chainNamespace,
        chainId: mainnet.id,
        caipNetworkId: mainnet.caipNetworkId
      })
      vi.mocked(BlockchainApiController.fetchIdentity).mockResolvedValue({
        name: 'John Doe',
        avatar: null
      })
      vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
        address: '0x123'
      } as AccountControllerState)

      await appKit['syncAccount'](mockAccountData)

      expect(fetchIdentity).not.toHaveBeenCalled()

      await appKit['syncAccount']({ ...mockAccountData, address: '0x456' })

      expect(fetchIdentity).toHaveBeenCalledOnce()
    })

    it('should not sync identity on non-evm network', async () => {
      const fetchIdentity = vi.spyOn(BlockchainApiController, 'fetchIdentity')

      appKit = new AppKit({
        ...mockOptions,
        adapters: [mockSolanaAdapter],
        networks: [solana]
      })

      vi.spyOn(AccountController, 'fetchTokenBalance').mockResolvedValue([
        {
          quantity: { numeric: '0.00', decimals: '18' },
          chainId: 'solana:1',
          symbol: 'SOL'
        } as Balance
      ])
      const mockAccountData = {
        address: '7y523k4jsh90d',
        chainId: solana.id,
        chainNamespace: solana.chainNamespace
      }
      vi.spyOn(StorageUtil, 'getActiveNetworkProps').mockReturnValueOnce({
        namespace: solana.chainNamespace,
        chainId: solana.id,
        caipNetworkId: solana.caipNetworkId
      })

      await appKit['syncAccount'](mockAccountData)

      expect(fetchIdentity).not.toHaveBeenCalled()
    })

    it('should not sync identity on a test network', async () => {
      const fetchIdentity = vi.spyOn(BlockchainApiController, 'fetchIdentity')

      const mockAdapter = {
        ...mockEvmAdapter,
        getBalance: vi.fn().mockResolvedValue({ balance: '1.00', symbol: 'sETH' })
      }
      const mockAccountData = {
        address: '0x123',
        chainId: sepolia.id,
        chainNamespace: sepolia.chainNamespace
      }

      appKit = new AppKit({
        ...mockOptions,
        adapters: [mockEvmAdapter],
        networks: [sepolia]
      })

      /**
       * Caution: Even though real getAdapter returning mocked adapter, it's not returning the getBalance as expected, it's returning undefined
       * So we need to mock the getBalance here specifically
       */
      vi.spyOn(appKit as any, 'getAdapter').mockReturnValue(mockAdapter)
      vi.spyOn(AccountController, 'fetchTokenBalance').mockResolvedValue([
        {
          quantity: { numeric: '0.00', decimals: '18' },
          chainId: sepolia.id,
          symbol: 'sETH'
        } as Balance
      ])
      vi.spyOn(StorageUtil, 'getActiveNetworkProps').mockReturnValueOnce({
        namespace: sepolia.chainNamespace,
        chainId: sepolia.id,
        caipNetworkId: sepolia.caipNetworkId
      })

      await appKit['syncAccount'](mockAccountData)

      expect(fetchIdentity).not.toHaveBeenCalled()
    })

    it('should sync balance correctly', async () => {
      appKit = new AppKit({
        ...mockOptions,
        adapters: [mockEvmAdapter],
        networks: [mainnet]
      })

      vi.spyOn(AccountController, 'fetchTokenBalance').mockResolvedValue([
        {
          quantity: { numeric: '0.00', decimals: '18' },
          chainId: 'eip155:1',
          symbol: 'ETH'
        } as Balance
      ])
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

      vi.spyOn(AccountController, 'state', 'get').mockReturnValueOnce(mockAccountData as any)

      appKit = new AppKit({ ...mockOptions })

      await appKit['syncAccount']({ ...mockAccountData, address: '0x1234' })

      expect(AccountController.fetchTokenBalance).toHaveBeenCalled()
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

      vi.spyOn(AccountController, 'state', 'get').mockReturnValueOnce(mockAccountData as any)
      appKit = new AppKit({ ...mockOptions })

      await appKit['syncAccount'](mockAccountData)

      expect(AccountController.fetchTokenBalance).not.toHaveBeenCalled()
      expect(AccountController.setBalance).toHaveBeenCalledWith('0.00', 'sETH', 'eip155')
    })

    it('should disconnect correctly', async () => {
      const disconnect = vi.spyOn(ConnectionController, 'disconnect')

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

      expect(disconnect).toHaveBeenCalled()
      // TODO: Unmock all of this file and check for AccountController hooks called from ChainController
    })

    it('should not show unsupported chain UI when allowUnsupportedChain is true', async () => {
      const showUnsupportedChainUI = vi.spyOn(ChainController, 'showUnsupportedChainUI')
      showUnsupportedChainUI.mockImplementationOnce(vi.fn())

      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        chains: new Map([['eip155', { namespace: 'eip155' }]]),
        activeChain: 'eip155'
      } as any)
      vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
        allowUnsupportedChain: true
      } as any)

      appKit = new AppKit(mockOptions)

      const overrideAdapter = {
        ...mockEvmAdapter,
        getAccounts: vi.fn().mockResolvedValue({ accounts: [] }),
        syncConnection: vi.fn().mockResolvedValue({
          chainId: 'eip155:999', // Unsupported chain
          address: '0x123',
          accounts: [{ address: '0x123', type: 'eoa' }]
        })
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

      await (appKit as any).syncExistingConnection()

      expect(showUnsupportedChainUI).not.toHaveBeenCalled()
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

  describe.skip('syncExistingConnection', () => {
    it('should set status to "connecting" and sync the connection when a connector and namespace are present', async () => {
      vi.spyOn(AccountController, 'state', 'get').mockReturnValueOnce({
        currentTab: 0,
        addressLabels: new Map(),
        allAccounts: []
      })
      vi.mocked(CoreHelperUtil.isClient).mockReturnValueOnce(true)
      vi.spyOn(StorageUtil, 'getActiveNamespace').mockReturnValueOnce('eip155')
      vi.spyOn(StorageUtil, 'getConnectedConnectorId').mockReturnValueOnce('test-connector')
      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        activeCaipNetwork: { id: 'eip155:1', chainNamespace: 'eip155' } as CaipNetwork
      } as ChainControllerState)
      vi.mocked(StorageUtil.getActiveNetworkProps).mockReturnValueOnce({
        namespace: mainnet.chainNamespace,
        chainId: mainnet.id,
        caipNetworkId: mainnet.caipNetworkId
      })

      vi.mocked(appKit).chainNamespaces = ['eip155']

      await appKit['syncExistingConnection']()

      expect(mockEvmAdapter.syncConnection).toHaveBeenCalled()
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
      vi.spyOn(StorageUtil, 'getActiveNetworkProps').mockReturnValueOnce({
        namespace: 'eip155',
        chainId: mainnet.id,
        caipNetworkId: mainnet.caipNetworkId
      })
      vi.spyOn(StorageUtil, 'getConnectedNamespaces').mockReturnValueOnce(['eip155', 'solana'])
      vi.spyOn(StorageUtil, 'getConnectedConnectorId').mockImplementationOnce(namespace => {
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

  describe.skip('Base Initialization', () => {
    let appKit: AppKit
    let mockAdapter: AdapterBlueprint
    let mockUniversalAdapter: any

    beforeEach(() => {
      vi.spyOn(ChainController, 'state', 'get').mockReturnValueOnce({
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
        networks: [mainnet],
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

  describe.skip('Alert Errors', () => {
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

describe.skip('Listeners', () => {
  it('should set caip address, profile name and profile image on accountChanged event', async () => {
    vi.spyOn(NetworkUtil, 'getNetworksByNamespace').mockReturnValue([
      {
        ...sepolia,
        nativeCurrency: { symbol: 'sETH' },
        chainNamespace: 'eip155'
      } as unknown as CaipNetwork
    ])
    vi.spyOn(AccountController, 'fetchTokenBalance').mockResolvedValueOnce([
      {
        quantity: { numeric: '0.00', decimals: '18' },
        chainId: 'eip155:11155111',
        symbol: 'sETH'
      } as Balance
    ])
    vi.spyOn(AccountController, 'state', 'get').mockReturnValueOnce({
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

    vi.spyOn(ChainController, 'state', 'get').mockReturnValueOnce({
      activeChain: mockAccount.chainNamespace,
      activeCaipAddress: `${mockAccount.chainNamespace}:${mockAccount.chainId}:${mockAccount.address}`,
      chains: new Map([])
    } as unknown as typeof ChainController.state)

    const emitter = new Emitter()

    const appKit = new AppKit({
      ...mockOptions,
      adapters: [mockEvmAdapter],
      networks: [mainnet],
      features: {
        email: false,
        socials: []
      }
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

describe.skip('Adapter Management', () => {
  describe('addAdapter', () => {
    it('should add a new adapter successfully', () => {
      const appKit = new AppKit(mockOptions)

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
      const appKit = new AppKit(mockOptions)

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
      const appKit = new AppKit(mockOptions)
      vi.spyOn(appKit as any, 'createAdapter').mockImplementation(() => {})
      vi.spyOn(appKit as any, 'initChainAdapter').mockImplementation(() => {})
      vi.spyOn(ChainController, 'addAdapter').mockImplementationOnce(() => {})

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
      const appKit = new AppKit(mockOptions)

      vi.spyOn(ChainController, 'state', 'get').mockReturnValueOnce({
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
      const appKit = new AppKit(mockOptions)

      vi.spyOn(ChainController, 'removeAdapter').mockImplementationOnce(() => {})
      vi.spyOn(ConnectorController, 'removeAdapter').mockImplementationOnce(() => {})
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
      const appKit = new AppKit(mockOptions)

      vi.spyOn(ChainController, 'state', 'get').mockReturnValueOnce({
        activeCaipAddress: undefined
      } as any)

      appKit.removeAdapter('polkadot' as ChainNamespace)

      expect(ChainController.removeAdapter).not.toHaveBeenCalled()
      expect(ConnectorController.removeAdapter).not.toHaveBeenCalled()
    })

    it('should not remove adapter if chainAdapters is not initialized', () => {
      const appKit = new AppKit(mockOptions)

      vi.spyOn(ChainController, 'state', 'get').mockReturnValueOnce({
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

describe.skip('Balance sync', () => {
  beforeEach(() => {
    vi.spyOn(ConstantsUtil, 'BALANCE_SUPPORTED_CHAINS', 'get').mockReturnValue(['eip155', 'solana'])
  })

  afterEach(() => {
    vi.spyOn(AccountController, 'state', 'get').mockRestore()
    vi.spyOn(StorageUtil, 'getActiveNetworkProps').mockRestore()
    vi.spyOn(NetworkUtil, 'getNetworksByNamespace').mockRestore()
  })

  it('should not sync balance if theres no matching caipNetwork', async () => {
    const appKit = new AppKit(mockOptions)

    const getNetworksByNamespaceSpy = vi.spyOn(NetworkUtil, 'getNetworksByNamespace')
    const fetchTokenBalanceSpy = vi.spyOn(AccountController, 'fetchTokenBalance')
    const setBalanceSpy = vi.spyOn(AccountController, 'setBalance')

    await appKit['syncBalance']({
      address: '0x123',
      chainId: sepolia.id,
      chainNamespace: sepolia.chainNamespace
    })

    expect(getNetworksByNamespaceSpy).toHaveBeenCalled()
    expect(fetchTokenBalanceSpy).not.toHaveBeenCalled()
    expect(setBalanceSpy).not.toHaveBeenCalled()
  })

  it('should fetch native balance on testnet', async () => {
    vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
      address: '0x123'
    } as any)
    const getNetworksByNamespaceSpy = vi.spyOn(NetworkUtil, 'getNetworksByNamespace')
    const fetchTokenBalanceSpy = vi.spyOn(AccountController, 'fetchTokenBalance')
    const setBalanceSpy = vi.spyOn(AccountController, 'setBalance')

    const mockAdapter = {
      ...mockEvmAdapter,
      getBalance: vi.fn().mockResolvedValueOnce({ balance: '1.00', symbol: 'sETH' })
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

    expect(getNetworksByNamespaceSpy).toHaveBeenCalled()
    expect(fetchTokenBalanceSpy).not.toHaveBeenCalled()
    expect(setBalanceSpy).toHaveBeenCalledWith('1.00', 'sETH', 'eip155')
  })

  it('should set the correct native token balance', async () => {
    vi.spyOn(StorageUtil, 'getActiveNetworkProps').mockReturnValueOnce({
      namespace: 'eip155',
      chainId: mainnet.id,
      caipNetworkId: 'eip155:1'
    })
    vi.spyOn(NetworkUtil, 'getNetworksByNamespace').mockReturnValueOnce([
      { ...mainnet, caipNetworkId: 'eip155:1', chainNamespace: 'eip155' }
    ])
    vi.spyOn(AccountController, 'fetchTokenBalance').mockResolvedValueOnce([
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

    const appKit = new AppKit(mockOptions)

    const getNetworksByNamespaceSpy = vi.spyOn(NetworkUtil, 'getNetworksByNamespace')
    const fetchTokenBalanceSpy = vi.spyOn(AccountController, 'fetchTokenBalance')
    const setBalanceSpy = vi.spyOn(AccountController, 'setBalance')

    await appKit['syncBalance']({
      address: '0x123',
      chainId: mainnet.id,
      chainNamespace: 'eip155' as const
    })

    expect(getNetworksByNamespaceSpy).toHaveBeenCalled()
    expect(fetchTokenBalanceSpy).toHaveBeenCalled()
    expect(setBalanceSpy).toHaveBeenCalledWith('1.00', mainnet.nativeCurrency.symbol, 'eip155')
  })
})

describe.skip('WalletConnect Events', () => {
  let appkit: AppKit
  let universalProvider: Mocked<Pick<UniversalProvider, 'on'>>

  let chainChangedCallback: (chainId: string | number) => void
  let displayUriCallback: (uri: string) => void

  beforeEach(async () => {
    appkit = new AppKit(mockOptions)

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

  describe.skip('chainChanged', () => {
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
      chainChangedCallback(newChain.id.toString())
      expect(setCaipNetworkSpy).toHaveBeenNthCalledWith(2, newChain)
    })
  })

  describe('open', () => {
    it('should open different views', async () => {
      const appkit = new AppKit(mockOptions)
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

  describe.skip('display_uri', () => {
    it('should call openUri', () => {
      const setUriSpy = vi.spyOn(ConnectionController, 'setUri')

      displayUriCallback('mock_uri')
      expect(setUriSpy).toHaveBeenCalledWith('mock_uri')
    })
  })
})
