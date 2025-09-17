import type UniversalProvider from '@walletconnect/universal-provider'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type {
  AdapterNetworkState,
  AuthConnector,
  Connector,
  ConnectorType,
  SIWXConfig,
  SocialProvider
} from '@reown/appkit'
import {
  type Balance,
  type CaipNetwork,
  ConstantsUtil,
  SafeLocalStorage,
  SafeLocalStorageKeys,
  getSafeConnectorIdKey
} from '@reown/appkit-common'
import {
  ApiController,
  AssetUtil,
  BlockchainApiController,
  ChainController,
  ConnectionController,
  ConnectorController,
  CoreHelperUtil,
  EnsController,
  EventsController,
  ModalController,
  OptionsController,
  ProviderController,
  PublicStateController,
  RouterController,
  SnackController,
  StorageUtil,
  ThemeController
} from '@reown/appkit-controllers'
import { CaipNetworksUtil, ConstantsUtil as UtilConstantsUtil } from '@reown/appkit-utils'

import { AppKit } from '../../src/client/appkit.js'
import { mockUser, mockUserBalance } from '../mocks/Account.js'
import { mockEvmAdapter, mockUniversalAdapter } from '../mocks/Adapter.js'
import { base, bitcoin, mainnet, polygon, sepolia } from '../mocks/Networks.js'
import { mockOptions } from '../mocks/Options.js'
import { mockProvider, mockUniversalProvider } from '../mocks/Providers.js'
import {
  mockBlockchainApiController,
  mockRemoteFeatures,
  mockStorageUtil,
  mockWindowAndDocument
} from '../test-utils.js'

describe('Base Public methods', () => {
  beforeEach(() => {
    mockWindowAndDocument()
    mockStorageUtil()
    mockBlockchainApiController()
    mockRemoteFeatures()
    vi.spyOn(ApiController, 'fetchAllowedOrigins').mockResolvedValue(['http://localhost:3000'])
  })

  it('should open modal', async () => {
    const prefetch = vi.spyOn(ApiController, 'prefetch').mockResolvedValueOnce([])
    const open = vi.spyOn(ModalController, 'open')

    const appKit = new AppKit(mockOptions)

    await appKit.open()

    expect(open).toHaveBeenCalled()
    expect(prefetch).toHaveBeenCalled()
  })

  it('should open different views', async () => {
    const modelOpen = vi.spyOn(ModalController, 'open')

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

    const appkit = new AppKit(mockOptions)

    for (const view of views) {
      await appkit.open({ view })
      expect(modelOpen).toHaveBeenCalledWith(expect.objectContaining({ view }))
    }
  })

  it.each([
    {
      view: 'Swap',
      viewArguments: { fromToken: 'USDC', toToken: 'ETH', amount: '100' },
      data: { swap: { fromToken: 'USDC', toToken: 'ETH', amount: '100' } }
    }
  ] as const)('should open swap view with arguments', async ({ view, viewArguments, data }) => {
    const open = vi.spyOn(ModalController, 'open')

    const appkit = new AppKit(mockOptions)
    await appkit.open({
      view,
      arguments: viewArguments
    })

    expect(open).toHaveBeenCalledWith(
      expect.objectContaining({
        view,
        data
      })
    )
  })

  it('should filter connectors by namespace when opening modal', async () => {
    const openSpy = vi.spyOn(ModalController, 'open')
    const setFilterByNamespaceSpy = vi.spyOn(ConnectorController, 'setFilterByNamespace')

    const appKit = new AppKit(mockOptions)

    await appKit.open({ view: 'Connect', namespace: 'eip155' })

    expect(openSpy).toHaveBeenCalled()
    expect(setFilterByNamespaceSpy).toHaveBeenCalledWith('eip155')
  })

  it('should close modal', async () => {
    const close = vi.spyOn(ModalController, 'close')

    const appKit = new AppKit(mockOptions)
    await appKit.close()

    expect(close).toHaveBeenCalled()
  })

  it('should set loading state', () => {
    const setLoading = vi.spyOn(ModalController, 'setLoading')

    const appKit = new AppKit(mockOptions)
    appKit.setLoading(true)

    expect(setLoading).toHaveBeenCalledWith(true, undefined)
  })

  it('should get theme mode', () => {
    vi.spyOn(ThemeController.state, 'themeMode', 'get').mockReturnValueOnce('dark')

    const appKit = new AppKit(mockOptions)

    expect(appKit.getThemeMode()).toBe('dark')
  })

  it('should set theme mode', () => {
    const setThemeMode = vi.spyOn(ThemeController, 'setThemeMode')

    const appKit = new AppKit(mockOptions)
    appKit.setThemeMode('light')

    expect(setThemeMode).toHaveBeenCalledWith('light')
  })

  it('should get theme variables', () => {
    vi.spyOn(ThemeController.state, 'themeVariables', 'get').mockReturnValueOnce({
      '--w3m-accent': '#000'
    })

    const appKit = new AppKit(mockOptions)

    expect(appKit.getThemeVariables()).toEqual({ '--w3m-accent': '#000' })
  })

  it('should set theme variables', () => {
    const setThemeVariables = vi.spyOn(ThemeController, 'setThemeVariables')

    const appKit = new AppKit(mockOptions)
    const themeVariables = { '--w3m-accent': '#fff' }
    appKit.setThemeVariables(themeVariables)

    expect(setThemeVariables).toHaveBeenCalledWith(themeVariables)
  })

  it('should subscribe to theme changes', () => {
    const subscribe = vi.spyOn(ThemeController, 'subscribe')
    const callback = vi.fn()

    const appKit = new AppKit(mockOptions)
    appKit.subscribeTheme(callback)

    expect(subscribe).toHaveBeenCalledWith(callback)
  })

  it('should get wallet info', () => {
    const appKit = new AppKit(mockOptions)
    appKit.setConnectedWalletInfo({ name: 'Test Wallet' }, 'eip155')

    expect(appKit.getWalletInfo()).toEqual({ name: 'Test Wallet' })
  })

  it('should get wallet info with namespace', () => {
    const appKit = new AppKit(mockOptions)
    appKit.setConnectedWalletInfo({ name: 'Test Wallet' }, 'eip155')

    expect(appKit.getWalletInfo('eip155')).toEqual({ name: 'Test Wallet' })
    expect(appKit.getWalletInfo('solana')).toEqual(undefined)

    appKit.setConnectedWalletInfo({ name: 'Test Wallet' }, 'solana')
    expect(appKit.getWalletInfo('solana')).toEqual({ name: 'Test Wallet' })
  })

  it('should subscribe to wallet info changes', () => {
    const subscribe = vi.spyOn(ChainController, 'subscribeChainProp')
    const callback = vi.fn()

    const appKit = new AppKit(mockOptions)
    appKit.subscribeWalletInfo(callback)

    expect(subscribe).toHaveBeenCalledWith('accountState', expect.any(Function))
  })

  it('should subscribe to address updates', () => {
    const subscribe = vi.spyOn(ChainController, 'subscribeChainProp')
    const callback = vi.fn()

    const appKit = new AppKit(mockOptions)
    appKit.subscribeShouldUpdateToAddress(callback)

    expect(subscribe).toHaveBeenCalledWith('accountState', expect.any(Function))
  })

  it('should subscribe to CAIP network changes', () => {
    const subscribeKey = vi.spyOn(ChainController, 'subscribeKey')
    const callback = vi.fn()

    const appKit = new AppKit(mockOptions)
    appKit.subscribeCaipNetworkChange(callback)

    expect(subscribeKey).toHaveBeenCalledWith('activeCaipNetwork', callback)
  })

  it('should subscribe to state changes', () => {
    const subscribe = vi.spyOn(PublicStateController, 'subscribe')
    const callback = vi.fn()

    const appKit = new AppKit(mockOptions)
    appKit.subscribeState(callback)

    expect(subscribe).toHaveBeenCalledWith(callback)
  })

  it('should show error message', () => {
    const showError = vi.spyOn(SnackController, 'showError')

    const appKit = new AppKit(mockOptions)
    appKit.showErrorMessage('Test error')

    expect(showError).toHaveBeenCalledWith('Test error')
  })

  it('should show success message', () => {
    const showSuccess = vi.spyOn(SnackController, 'showSuccess')

    const appKit = new AppKit(mockOptions)
    appKit.showSuccessMessage('Test success')

    expect(showSuccess).toHaveBeenCalledWith('Test success')
  })

  it('should get event', () => {
    const appKit = new AppKit(mockOptions)

    expect(appKit.getEvent()).toEqual(EventsController.state)
  })

  it('should subscribe to events', () => {
    const subscribe = vi.spyOn(EventsController, 'subscribe')
    const callback = vi.fn()

    const appKit = new AppKit(mockOptions)
    appKit.subscribeEvents(callback)

    expect(subscribe).toHaveBeenCalledWith(callback)
  })

  it('should replace route', () => {
    const replace = vi.spyOn(RouterController, 'replace')

    const appKit = new AppKit(mockOptions)
    appKit.replace('Connect')

    expect(replace).toHaveBeenCalledWith('Connect')
  })

  it('should redirect to route', () => {
    const push = vi.spyOn(RouterController, 'push')

    const appKit = new AppKit(mockOptions)
    appKit.redirect('Networks')

    expect(push).toHaveBeenCalledWith('Networks')
  })

  it('should pop transaction stack', () => {
    const popTransactionStack = vi.spyOn(RouterController, 'popTransactionStack')

    const appKit = new AppKit(mockOptions)
    appKit.popTransactionStack('success')

    expect(popTransactionStack).toHaveBeenCalledWith('success')
  })

  it('should check if modal is open', async () => {
    vi.spyOn(AppKit.prototype as any, 'injectModalUi').mockResolvedValueOnce(vi.fn())

    const appKit = new AppKit(mockOptions)
    await appKit.open()

    expect(appKit.isOpen()).toBe(true)
  })

  it('should check if transaction stack is empty', () => {
    const appKit = new AppKit(mockOptions)

    expect(appKit.isTransactionStackEmpty()).toBe(true)
  })

  it('should set status', () => {
    const chainSpy = vi.spyOn(ChainController, 'setAccountProp')

    const appKit = new AppKit(mockOptions)
    appKit.setStatus('connected', 'eip155')

    expect(chainSpy).toHaveBeenCalledWith('status', 'connected', 'eip155')
  })

  it('should add address label', () => {
    const chainSpy = vi.spyOn(ChainController, 'setAccountProp')

    const appKit = new AppKit(mockOptions)
    appKit.addAddressLabel('0x123', 'eip155 Address', 'eip155')

    expect(chainSpy).toHaveBeenCalledWith('addressLabels', { '0x123': 'eip155 Address' }, 'eip155')
  })

  it('should remove address label', () => {
    const chainSpy = vi.spyOn(ChainController, 'setAccountProp')

    const appKit = new AppKit(mockOptions)
    appKit.removeAddressLabel('0x123', 'eip155')

    expect(chainSpy).toHaveBeenCalledWith('addressLabels', { '0x123': undefined }, 'eip155')
  })

  it('should get address and CAIP address', async () => {
    const mockAccountData = {
      address: '0x123',
      chainId: mainnet.id,
      chainNamespace: mainnet.chainNamespace
    }

    const appKit = new AppKit(mockOptions)
    await appKit.ready()
    await appKit['syncAccount'](mockAccountData)

    expect(appKit.getAddress()).toBe('0x123')
    expect(appKit.getCaipAddress()).toBe('eip155:1:0x123')
  })

  it('should get provider', () => {
    vi.spyOn(ProviderController, 'getProvider').mockReturnValue(mockProvider)
    const appKit = new AppKit(mockOptions)

    expect(appKit.getProvider<any>('eip155')).toBe(mockProvider)

    vi.spyOn(ProviderController, 'getProvider').mockClear()
  })

  it('should get preferred account type', () => {
    const appKit = new AppKit(mockOptions)
    appKit.setPreferredAccountType('eoa', mainnet.chainNamespace)

    expect(appKit.getPreferredAccountType(mainnet.chainNamespace)).toBe('eoa')
  })

  it('should set CAIP address', () => {
    const setCaipAddress = vi.spyOn(ChainController, 'setAccountProp')

    const appKit = new AppKit(mockOptions)
    appKit.setCaipAddress('eip155:1:0x123', 'eip155')

    expect(setCaipAddress).toHaveBeenCalledWith('caipAddress', 'eip155:1:0x123', 'eip155', false)
    expect(setCaipAddress).toHaveBeenCalledWith('address', '0x123', 'eip155', false)
    expect(appKit.getIsConnectedState()).toBe(true)
  })

  it('should set balance', () => {
    const chainSpy = vi.spyOn(ChainController, 'setAccountProp')

    const appKit = new AppKit(mockOptions)
    appKit.setBalance('1.5', 'ETH', 'eip155')

    expect(chainSpy).toHaveBeenCalledWith('balance', '1.5', 'eip155')
    expect(chainSpy).toHaveBeenCalledWith('balanceSymbol', 'ETH', 'eip155')
  })

  it('should set profile name', () => {
    const setProfileName = vi.spyOn(ChainController, 'setAccountProp')

    const appKit = new AppKit(mockOptions)
    appKit.setProfileName('John Doe', 'eip155')

    expect(setProfileName).toHaveBeenCalledWith('profileName', 'John Doe', 'eip155')
  })

  it('should set profile image', () => {
    const setProfileImage = vi.spyOn(ChainController, 'setAccountProp')

    const appKit = new AppKit(mockOptions)
    appKit.setProfileImage('https://example.com/image.png', 'eip155')

    expect(setProfileImage).toHaveBeenCalledWith(
      'profileImage',
      'https://example.com/image.png',
      'eip155'
    )
  })

  it('should reset account', () => {
    const resetAccount = vi.spyOn(ChainController, 'resetAccount')

    const appKit = new AppKit(mockOptions)
    appKit.resetAccount('eip155')

    expect(resetAccount).toHaveBeenCalledWith('eip155')
  })

  it('should set CAIP network', () => {
    const setActiveCaipNetwork = vi.spyOn(ChainController, 'setActiveCaipNetwork')

    const appKit = new AppKit(mockOptions)
    appKit.setCaipNetwork(mainnet)

    expect(setActiveCaipNetwork).toHaveBeenCalledWith(mainnet)
  })

  it('should get CAIP network', () => {
    const appKit = new AppKit(mockOptions)

    expect(appKit.getCaipNetwork()).toEqual(mainnet)
  })

  it('should set requested CAIP networks', () => {
    const setRequestedCaipNetworks = vi.spyOn(ChainController, 'setRequestedCaipNetworks')
    const requestedNetworks = [mainnet] as unknown as CaipNetwork[]

    const appKit = new AppKit(mockOptions)
    appKit.setRequestedCaipNetworks(requestedNetworks, mainnet.chainNamespace)

    expect(setRequestedCaipNetworks).toHaveBeenCalledWith(requestedNetworks, mainnet.chainNamespace)
  })

  it('should set connectors', () => {
    const existingConnectors = [
      { id: 'phantom', name: 'Phantom', chain: 'eip155', type: 'INJECTED' }
    ] as Connector[]
    const newConnectors = [
      { id: 'metamask', name: 'MetaMask', chain: 'eip155', type: 'INJECTED' }
    ] as Connector[]

    const combinedConnectors = [...existingConnectors, ...newConnectors]

    const appKit = new AppKit(mockOptions)
    appKit.setConnectors(combinedConnectors)

    expect(ConnectorController.state.connectors).toEqual(combinedConnectors)
    expect(ConnectorController.state.allConnectors).toEqual(combinedConnectors)
  })

  it('should set multichain connectors', () => {
    // Reset connectors state
    ConnectorController.state.allConnectors = []
    ConnectorController.state.connectors = []

    const ethConnector = {
      id: 'mock',
      name: 'Mock',
      type: 'INJECTED',
      chain: 'eip155'
    } as unknown as Connector

    const solConnector = {
      id: 'mock',
      name: 'Mock',
      type: 'INJECTED',
      chain: 'solana'
    } as unknown as Connector

    const appKit = new AppKit(mockOptions)

    appKit.setConnectors([ethConnector])

    expect(ConnectorController.state.allConnectors).toEqual([ethConnector])

    appKit.setConnectors([solConnector])

    expect(ConnectorController.state.allConnectors).toEqual([ethConnector, solConnector])
    expect(ConnectorController.state.connectors.length).toEqual(1)

    // Handle merged connectors
    const hasMergedConnectorFromAllConnectors = ConnectorController.state.allConnectors.some(
      c => c.connectors && c.connectors.length > 0
    )
    const hasMergedConnectorFromConnectors = ConnectorController.state.connectors.some(
      c => c.connectors && c.connectors.length > 0
    )

    expect(hasMergedConnectorFromAllConnectors).toBe(false)
    expect(hasMergedConnectorFromConnectors).toBe(true)
  })

  it('should add connector', () => {
    const addConnector = vi.spyOn(ConnectorController, 'addConnector')
    const connector = {
      id: 'metamask',
      name: 'MetaMask',
      chain: 'eip155',
      type: 'INJECTED'
    } as Connector

    const appKit = new AppKit(mockOptions)
    appKit.addConnector(connector)

    expect(addConnector).toHaveBeenCalledWith(connector)
  })

  it('should get connectors', () => {
    const getConnectors = vi.spyOn(ConnectorController, 'getConnectors')
    const mockConnectors = [
      { id: 'metamask', name: 'MetaMask', chain: 'eip155:1', type: 'INJECTED' as const }
    ] as any
    vi.mocked(getConnectors).mockReturnValue(mockConnectors)

    const appKit = new AppKit(mockOptions)

    expect(appKit.getConnectors()).toEqual(mockConnectors)
  })

  it('should get approved CAIP network IDs', () => {
    const getAllApprovedCaipNetworkIds = vi.spyOn(ChainController, 'getAllApprovedCaipNetworkIds')
    getAllApprovedCaipNetworkIds.mockReturnValueOnce([mainnet.caipNetworkId])

    const appKit = new AppKit(mockOptions)

    expect(appKit.getApprovedCaipNetworkIds()).toEqual(['eip155:1'])
  })

  it('should set approved CAIP networks data', () => {
    const setApprovedCaipNetworksData = vi.spyOn(ChainController, 'setApprovedCaipNetworksData')

    const appKit = new AppKit(mockOptions)
    appKit.setApprovedCaipNetworksData('eip155')

    expect(setApprovedCaipNetworksData).toHaveBeenCalledWith('eip155')
  })

  it('should reset network', () => {
    const resetNetwork = vi.spyOn(ChainController, 'resetNetwork')

    const appKit = new AppKit(mockOptions)
    appKit.resetNetwork(mainnet.chainNamespace)

    expect(resetNetwork).toHaveBeenCalled()
  })

  it('should reset WC connection', () => {
    const resetWcConnection = vi.spyOn(ConnectionController, 'resetWcConnection')

    const appKit = new AppKit(mockOptions)
    appKit.resetWcConnection()

    expect(resetWcConnection).toHaveBeenCalled()
  })

  it('should fetch identity', async () => {
    const mockRequest = {
      caipNetworkId: mainnet.caipNetworkId,
      address: '0x123'
    }
    const fetchIdentity = vi.spyOn(BlockchainApiController, 'fetchIdentity')
    fetchIdentity.mockResolvedValue({
      name: 'John Doe',
      avatar: null
    })

    const appKit = new AppKit(mockOptions)
    const result = await appKit.fetchIdentity(mockRequest)

    expect(fetchIdentity).toHaveBeenCalledWith(mockRequest)
    expect(result).toEqual({ name: 'John Doe', avatar: null })
  })

  it('should set address explorer URL', () => {
    const setAddressExplorerUrl = vi.spyOn(ChainController, 'setAccountProp')

    const appKit = new AppKit(mockOptions)
    appKit.setAddressExplorerUrl('https://etherscan.io/address/0x123', mainnet.chainNamespace)

    expect(setAddressExplorerUrl).toHaveBeenCalledWith(
      'addressExplorerUrl',
      'https://etherscan.io/address/0x123',
      mainnet.chainNamespace
    )
  })

  it('should set smart account deployed', () => {
    const setSmartAccountDeployed = vi.spyOn(ChainController, 'setAccountProp')

    const appKit = new AppKit(mockOptions)
    appKit.setSmartAccountDeployed(true, mainnet.chainNamespace)

    expect(setSmartAccountDeployed).toHaveBeenCalledWith(
      'smartAccountDeployed',
      true,
      mainnet.chainNamespace
    )
  })

  it('should set connected wallet info', () => {
    const walletInfo = { name: 'MetaMask', icon: 'icon-url' }
    const setConnectedWalletInfo = vi.spyOn(ChainController, 'setAccountProp')

    const appKit = new AppKit(mockOptions)
    appKit.setConnectedWalletInfo(walletInfo, mainnet.chainNamespace)

    expect(setConnectedWalletInfo).toHaveBeenCalledWith(
      'connectedWalletInfo',
      walletInfo,
      mainnet.chainNamespace
    )
  })

  it('should set connected wallet info with type', () => {
    const walletInfo = { name: 'MetaMask', icon: 'icon-url' }
    const setConnectedWalletInfo = vi.spyOn(ChainController, 'setAccountProp')
    vi.spyOn(ProviderController, 'getProviderId').mockReturnValueOnce('WALLET_CONNECT')

    const appKit = new AppKit(mockOptions)
    appKit.setConnectedWalletInfo(walletInfo, mainnet.chainNamespace)

    expect(setConnectedWalletInfo).toHaveBeenCalledWith(
      'connectedWalletInfo',
      { ...walletInfo, type: 'WALLET_CONNECT' },
      mainnet.chainNamespace
    )
  })

  it('should set preferred account type', () => {
    const setPreferredAccountType = vi.spyOn(ChainController, 'setAccountProp')

    const appKit = new AppKit(mockOptions)
    appKit.setPreferredAccountType('eoa', mainnet.chainNamespace)

    expect(setPreferredAccountType).toHaveBeenCalledWith(
      'preferredAccountType',
      'eoa',
      mainnet.chainNamespace
    )
  })

  it('should get Reown name', async () => {
    const getNamesForAddress = vi.spyOn(EnsController, 'getNamesForAddress')
    getNamesForAddress.mockResolvedValue([
      {
        name: 'john.reown.id',
        addresses: { eip155: { address: '0x123', created: '0' } },
        attributes: [],
        registered_at: '2025-07-29T13:03:36.672952Z',
        updated_at: undefined
      }
    ])

    const appKit = new AppKit(mockOptions)
    const result = await appKit.getReownName('john.reown.id')

    expect(getNamesForAddress).toHaveBeenCalledWith('john.reown.id')
    expect(result).toEqual([
      {
        name: 'john.reown.id',
        addresses: { eip155: { address: '0x123', created: '0' } },
        attributes: [],
        registered_at: '2025-07-29T13:03:36.672952Z',
        updated_at: undefined
      }
    ])
  })

  it('should set EIP6963 enabled', () => {
    const setEIP6963Enabled = vi.spyOn(OptionsController, 'setEIP6963Enabled')

    const appKit = new AppKit(mockOptions)
    appKit.setEIP6963Enabled(true)

    expect(setEIP6963Enabled).toHaveBeenCalledWith(true)
  })

  it('should set client ID', () => {
    const setClientId = vi.spyOn(BlockchainApiController, 'setClientId')

    const appKit = new AppKit(mockOptions)
    appKit.setClientId('client-123')

    expect(setClientId).toHaveBeenCalledWith('client-123')
  })

  it('should get connector image', () => {
    const getConnectorImage = vi.spyOn(AssetUtil, 'getConnectorImage')
    getConnectorImage.mockReturnValue('connector-image-url')

    const appKit = new AppKit(mockOptions)
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
    const switchActiveNetwork = vi.spyOn(ChainController, 'switchActiveNetwork')
    vi.mocked(ChainController.switchActiveNetwork).mockResolvedValueOnce(undefined)

    const appKit = new AppKit(mockOptions)
    await appKit.switchNetwork(mainnet)

    expect(switchActiveNetwork).toHaveBeenCalledWith(
      mainnet,
      expect.objectContaining({
        throwOnFailure: false
      })
    )

    await appKit.switchNetwork(polygon)

    expect(switchActiveNetwork).toHaveBeenCalledTimes(1)
  })

  it('should use the correct network when syncing account if it does not allow all networks and network is not allowed', async () => {
    const setActiveCaipNetwork = vi.spyOn(ChainController, 'setActiveCaipNetwork')
    const fetchTokenBalance = vi.spyOn(ChainController, 'fetchTokenBalance')
    const getActiveNetworkProps = vi.spyOn(StorageUtil, 'getActiveNetworkProps')
    const getNetworkProp = vi.spyOn(ChainController, 'getNetworkProp')

    const appKit = new AppKit(mockOptions)

    getActiveNetworkProps.mockReturnValue({
      namespace: mainnet.chainNamespace,
      chainId: mainnet.id,
      caipNetworkId: mainnet.caipNetworkId
    })

    fetchTokenBalance.mockResolvedValue([
      {
        quantity: { numeric: '0.00', decimals: '18' },
        chainId: mainnet.caipNetworkId,
        symbol: 'ETH'
      } as Balance
    ])

    const mockAccountData = {
      address: '0x123',
      chainId: polygon.id,
      chainNamespace: polygon.chainNamespace
    }

    await appKit['syncAccount'](mockAccountData)

    expect(setActiveCaipNetwork).toHaveBeenCalledWith(mainnet)
    expect(getNetworkProp).toHaveBeenCalledWith('supportsAllNetworks', mainnet.chainNamespace)
  })

  it('should set connected wallet info when syncing account', async () => {
    const setConnectedWalletInfo = vi.spyOn(ChainController, 'setAccountProp')
    const getActiveNetworkProps = vi.spyOn(StorageUtil, 'getActiveNetworkProps')
    const fetchTokenBalance = vi.spyOn(ChainController, 'fetchTokenBalance')
    vi.spyOn(ProviderController, 'getProviderId').mockReturnValue(
      UtilConstantsUtil.CONNECTOR_TYPE_INJECTED as ConnectorType
    )
    const mockConnector = {
      id: 'test-wallet',
      name: 'Test Wallet',
      imageUrl: 'test-wallet-icon'
    } as Connector
    vi.spyOn(ConnectorController, 'getConnectors').mockReturnValueOnce([mockConnector])
    vi.spyOn(ConnectorController, 'getConnectorId').mockReturnValueOnce(mockConnector.id)
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
    getActiveNetworkProps.mockReturnValueOnce({
      namespace: mainnet.chainNamespace,
      chainId: mainnet.id,
      caipNetworkId: mainnet.caipNetworkId
    })

    const appKit = new AppKit(mockOptions)
    await appKit['syncAccount'](mockAccountData)

    expect(setConnectedWalletInfo).toHaveBeenCalledWith(
      'connectedWalletInfo',
      {
        name: mockConnector.name,
        type: UtilConstantsUtil.CONNECTOR_TYPE_INJECTED as ConnectorType,
        icon: mockConnector.imageUrl
      },
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

    const appKit = new AppKit(mockOptions)
    await appKit['syncAccount'](mockAccountData)

    expect(fetchIdentity).toHaveBeenCalled()

    await appKit['syncAccount']({ ...mockAccountData, address: '0x456' })

    expect(fetchIdentity).toHaveBeenCalled()
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

    const appKit = new AppKit({
      ...mockOptions,
      adapters: [mockEvmAdapter],
      networks: [sepolia]
    })

    /**
     * Caution: Even though real getAdapter returning mocked adapter, it's not returning the getBalance as expected, it's returning undefined
     * So we need to mock the getBalance here specifically
     */
    vi.spyOn(appKit as any, 'getAdapter').mockReturnValueOnce(mockAdapter)
    vi.spyOn(ChainController, 'fetchTokenBalance').mockResolvedValueOnce([
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

  it('should disconnect correctly', async () => {
    const disconnect = vi.spyOn(ConnectionController, 'disconnect')
    const mockRemoveItem = vi.fn()
    vi.spyOn(SafeLocalStorage, 'removeItem').mockImplementation(mockRemoveItem)

    const appKit = new AppKit({
      ...mockOptions,
      networks: [base],
      adapters: [mockUniversalAdapter]
    })
    await appKit.disconnect()

    expect(disconnect).toHaveBeenCalled()
  })

  it('should not show unsupported chain UI when allowUnsupportedChain is true', async () => {
    const showUnsupportedChainUI = vi.spyOn(ChainController, 'showUnsupportedChainUI')
    showUnsupportedChainUI.mockImplementationOnce(vi.fn())
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      allowUnsupportedChain: true
    } as any)

    const overrideAdapter = {
      ...mockEvmAdapter,
      getAccounts: vi.fn().mockResolvedValue({ accounts: [] }),
      syncConnection: vi.fn().mockResolvedValue({
        chainId: 'eip155:999', // Unsupported chain
        address: '0x123',
        accounts: [{ address: '0x123', type: 'eoa' }]
      })
    }

    const appKit = new AppKit({ ...mockOptions, adapters: [overrideAdapter] })
    vi.spyOn(appKit as any, 'setUnsupportedNetwork').mockImplementation(vi.fn())

    vi.spyOn(SafeLocalStorage, 'getItem').mockImplementation((key: string) => {
      const connectorKey = getSafeConnectorIdKey(mainnet.chainNamespace)
      if (key === connectorKey) {
        return 'test-wallet'
      }
      if (key === SafeLocalStorageKeys.ACTIVE_CAIP_NETWORK_ID) {
        return mainnet.caipNetworkId
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
    vi.mocked(ProviderController).subscribeProviders = mockSubscribeProviders

    const appKit = new AppKit(mockOptions)
    appKit.subscribeProviders(callback)

    expect(mockSubscribeProviders).toHaveBeenCalled()
    expect(callback).toHaveBeenCalledWith(providers)
  })

  it('should set status to connected on syncWalletConnectAccount if CAIP address exists', () => {
    vi.spyOn(ChainController, 'setApprovedCaipNetworksData').mockImplementation(() =>
      Promise.resolve()
    )
    ChainController.state.activeCaipNetwork = mainnet
    vi.spyOn(CaipNetworksUtil, 'extendCaipNetworks').mockReturnValue([mainnet])
    vi.spyOn(ChainController, 'initialize').mockImplementation(() => Promise.resolve())
    vi.spyOn(ChainController, 'setAccountProp').mockImplementation(() => Promise.resolve())

    const appKit = new AppKit({
      ...mockOptions,
      adapters: [],
      networks: [mainnet]
    })
    appKit['universalProvider'] = {
      ...mockUniversalProvider,
      session: {
        namespaces: {
          eip155: {
            accounts: ['eip155:1:0x123']
          }
        }
      }
    } as unknown as InstanceType<typeof UniversalProvider>

    const setStatusSpy = vi.spyOn(appKit, 'setStatus')

    appKit['syncWalletConnectAccount']()

    expect(setStatusSpy).toHaveBeenCalledWith('connected', 'eip155')
  })

  it('should set status to disconnected on syncWalletConnectAccount if CAIP address does not exist', () => {
    vi.spyOn(ChainController, 'setApprovedCaipNetworksData').mockImplementation(() =>
      Promise.resolve()
    )
    ChainController.state.activeCaipNetwork = mainnet
    vi.spyOn(CaipNetworksUtil, 'extendCaipNetworks').mockReturnValue([mainnet])
    vi.spyOn(ChainController, 'initialize').mockImplementation(() => Promise.resolve())
    vi.spyOn(ChainController, 'setAccountProp').mockImplementation(() => Promise.resolve())

    const appKit = new AppKit({
      ...mockOptions,
      adapters: [],
      networks: [mainnet]
    })
    appKit['universalProvider'] = {
      ...mockUniversalProvider,
      session: {
        namespaces: {
          eip155: {
            accounts: []
          }
        }
      }
    } as unknown as InstanceType<typeof UniversalProvider>

    const setStatusSpy = vi.spyOn(appKit, 'setStatus')

    appKit['syncWalletConnectAccount']()

    expect(setStatusSpy).toHaveBeenCalledWith('disconnected', 'eip155')
  })

  it('should not set status to disconnected on syncWalletConnectAccount if namespace is not supported', () => {
    vi.spyOn(ChainController, 'setApprovedCaipNetworksData').mockImplementation(() =>
      Promise.resolve()
    )
    ChainController.state.activeCaipNetwork = bitcoin
    vi.spyOn(CaipNetworksUtil, 'extendCaipNetworks').mockReturnValue([bitcoin])
    vi.spyOn(ChainController, 'initialize').mockImplementation(() => Promise.resolve())
    vi.spyOn(ChainController, 'setAccountProp').mockImplementation(() => Promise.resolve())

    const appKit = new AppKit({
      ...mockOptions,
      adapters: [],
      networks: [mainnet]
    })
    appKit['universalProvider'] = {
      ...mockUniversalProvider,
      session: {
        namespaces: {
          eip155: {
            accounts: []
          }
        }
      }
    } as unknown as InstanceType<typeof UniversalProvider>

    const setStatusSpy = vi.spyOn(appKit, 'setStatus')

    appKit['syncWalletConnectAccount']()

    expect(setStatusSpy).not.toHaveBeenCalledWith('disconnected', 'eip155')
  })

  it('should get account information with embedded wallet info even if no chain namespace is provided in getAccount', () => {
    const authConnector = {
      id: 'ID_AUTH',
      name: 'ID Auth',
      imageUrl: 'https://example.com/id-auth.png'
    } as AuthConnector
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue(authConnector)
    vi.spyOn(StorageUtil, 'getConnectedSocialUsername').mockReturnValue('test-username')
    ChainController.state.activeChain = 'eip155'
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      caipAddress: 'eip155:1:0x123',
      status: 'connected',
      user: { email: 'test@example.com' },
      socialProvider: 'email' as SocialProvider,
      smartAccountDeployed: true,
      currentTab: 0,
      addressLabels: new Map([['eip155:1:0x123', 'test-label']]),
      preferredAccountType: 'eoa'
    })
    vi.spyOn(CoreHelperUtil, 'getPlainAddress')

    vi.spyOn(SafeLocalStorage, 'getItem').mockImplementation((key: string) => {
      const connectorKey = getSafeConnectorIdKey(mainnet.chainNamespace)
      if (key === connectorKey) {
        return 'ID_AUTH'
      }
      if (key === SafeLocalStorageKeys.ACTIVE_CAIP_NETWORK_ID) {
        return mainnet.caipNetworkId
      }
      return undefined
    })

    const connectedConnectorId = StorageUtil.getConnectedConnectorId(
      ChainController.state.activeChain
    )

    expect(connectedConnectorId).toBe('ID_AUTH')

    const appKit = new AppKit(mockOptions)
    const account = appKit.getAccount()

    expect(account).toEqual({
      caipAddress: 'eip155:1:0x123',
      address: '0x123',
      allAccounts: [],
      isConnected: true,
      status: 'connected',
      embeddedWalletInfo: {
        user: { email: 'test@example.com', username: 'test-username' },
        authProvider: 'email',
        accountType: 'eoa',
        isSmartAccountDeployed: true
      }
    })
  })

  it('should get account information', () => {
    const authConnector = {
      id: 'ID_AUTH',
      name: 'ID Auth',
      imageUrl: 'https://example.com/id-auth.png'
    } as AuthConnector
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue(authConnector)
    vi.spyOn(StorageUtil, 'getConnectedConnectorId').mockReturnValue('ID_AUTH')
    vi.spyOn(StorageUtil, 'getConnectedSocialUsername').mockReturnValue('test-username')
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      caipAddress: 'eip155:1:0x123',
      status: 'connected',
      user: { email: 'test@example.com' },
      socialProvider: 'email' as SocialProvider,
      smartAccountDeployed: true,
      currentTab: 0,
      addressLabels: new Map([['eip155:1:0x123', 'test-label']]),
      preferredAccountType: 'eoa'
    })
    vi.spyOn(CoreHelperUtil, 'getPlainAddress')

    const appKit = new AppKit(mockOptions)
    const account = appKit.getAccount('eip155')

    expect(account).toEqual({
      caipAddress: 'eip155:1:0x123',
      allAccounts: [],
      address: '0x123',
      isConnected: true,
      status: 'connected',
      embeddedWalletInfo: {
        user: { email: 'test@example.com', username: 'test-username' },
        authProvider: 'email',
        accountType: 'eoa',
        isSmartAccountDeployed: true
      }
    })
  })

  it('should handle network switcher UI when enableNetworkSwitch is true', async () => {
    vi.spyOn(ChainController, 'getNetworkData').mockReturnValue(
      mainnet as unknown as AdapterNetworkState
    )
    vi.spyOn(ChainController, 'getCaipNetworkByNamespace').mockReturnValue(mainnet)
    vi.spyOn(ChainController, 'getNetworkProp').mockReturnValue(true)
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeCaipNetwork: {
        ...mainnet,
        name: ConstantsUtil.UNSUPPORTED_NETWORK_NAME
      },
      activeChain: 'eip155'
    })
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      allowUnsupportedChain: false,
      enableNetworkSwitch: true
    })

    const showUnsupportedChainUI = vi.spyOn(ChainController, 'showUnsupportedChainUI')
    const setActiveCaipNetwork = vi.spyOn(ChainController, 'setActiveCaipNetwork')

    const appKit = new AppKit(mockOptions)
    await appKit['syncAccount']({
      address: '0x123',
      chainId: mainnet.id,
      chainNamespace: mainnet.chainNamespace
    })

    expect(showUnsupportedChainUI).toHaveBeenCalled()
    expect(setActiveCaipNetwork).toHaveBeenCalledWith(mainnet)
  })

  it('should handle network switcher UI when enableNetworkSwitch is false', async () => {
    vi.spyOn(ChainController, 'getNetworkData').mockReturnValue(
      mainnet as unknown as AdapterNetworkState
    )
    vi.spyOn(ChainController, 'getCaipNetworkByNamespace').mockReturnValue(mainnet)
    vi.spyOn(ChainController, 'getNetworkProp').mockReturnValue(true)
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeCaipNetwork: mainnet,
      activeChain: 'eip155'
    })
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      allowUnsupportedChain: false,
      enableNetworkSwitch: false
    })

    const showUnsupportedChainUI = vi.spyOn(ChainController, 'showUnsupportedChainUI')
    const setActiveCaipNetwork = vi.spyOn(ChainController, 'setActiveCaipNetwork')

    const appKit = new AppKit(mockOptions)
    await appKit['syncAccount']({
      address: '0x123',
      chainId: mainnet.id,
      chainNamespace: mainnet.chainNamespace
    })

    expect(showUnsupportedChainUI).not.toHaveBeenCalled()
    expect(setActiveCaipNetwork).toHaveBeenCalledWith(mainnet)
  })

  it.each([undefined, {} as SIWXConfig])('should set and get SIWX correctly', async siwx => {
    const setSIWXSpy = vi.spyOn(OptionsController, 'setSIWX')

    const appKit = new AppKit({ ...mockOptions, siwx })
    await appKit.ready()
    expect(setSIWXSpy).toHaveBeenCalledWith(siwx)

    vi.spyOn(OptionsController, 'state', 'get').mockReturnValueOnce({ siwx } as any)
    expect(appKit.getSIWX()).toEqual(siwx)
  })

  it('should fetch balance when address, namespace, and chainId are available', async () => {
    const appKit = new AppKit(mockOptions)

    const updateNativeBalanceSpy = vi
      .spyOn(appKit, 'updateNativeBalance')
      .mockResolvedValue(mockUserBalance)

    const result = await appKit.updateNativeBalance(mockUser.address, 1, 'eip155')

    expect(updateNativeBalanceSpy).toHaveBeenCalledWith(mockUser.address, 1, 'eip155')
    expect(result).toEqual(mockUserBalance)
  })
})
