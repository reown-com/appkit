import type UniversalProvider from '@walletconnect/universal-provider'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { AuthConnector, Connector, SocialProvider } from '@reown/appkit'
import {
  type Balance,
  type CaipNetwork,
  SafeLocalStorage,
  SafeLocalStorageKeys,
  getSafeConnectorIdKey
} from '@reown/appkit-common'
import {
  AccountController,
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
  PublicStateController,
  RouterController,
  SnackController,
  StorageUtil,
  ThemeController
} from '@reown/appkit-controllers'
import { CaipNetworksUtil } from '@reown/appkit-utils'
import { ProviderUtil } from '@reown/appkit-utils'

import { AppKit } from '../../src/client/appkit.js'
import { mockEvmAdapter, mockSolanaAdapter, mockUniversalAdapter } from '../mocks/Adapter.js'
import { base, mainnet, polygon, sepolia, solana } from '../mocks/Networks.js'
import { mockOptions } from '../mocks/Options.js'
import { mockAuthProvider, mockProvider, mockUniversalProvider } from '../mocks/Providers.js'
import {
  mockBlockchainApiController,
  mockStorageUtil,
  mockWindowAndDocument
} from '../test-utils.js'

describe('Base Public methods', () => {
  beforeEach(() => {
    mockWindowAndDocument()
    mockStorageUtil()
    mockBlockchainApiController()
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
      expect(modelOpen).toHaveBeenCalledWith({ view })
    }
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

  it('should subscribe to wallet info changes', () => {
    const subscribe = vi.spyOn(AccountController, 'subscribeKey')
    const callback = vi.fn()

    const appKit = new AppKit(mockOptions)
    appKit.subscribeWalletInfo(callback)

    expect(subscribe).toHaveBeenCalledWith('connectedWalletInfo', callback)
  })

  it('should subscribe to address updates', () => {
    const subscribe = vi.spyOn(AccountController, 'subscribeKey')
    const callback = vi.fn()

    const appKit = new AppKit(mockOptions)
    appKit.subscribeShouldUpdateToAddress(callback)

    expect(subscribe).toHaveBeenCalledWith('shouldUpdateToAddress', callback)
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
    appKit.popTransactionStack(true)

    expect(popTransactionStack).toHaveBeenCalledWith(true)
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
    const setStatus = vi.spyOn(AccountController, 'setStatus')

    const appKit = new AppKit(mockOptions)
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

    const appKit = new AppKit(mockOptions)
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

    const appKit = new AppKit(mockOptions)
    appKit.addAddressLabel('0x123', 'eip155 Address', 'eip155')

    expect(addAddressLabel).toHaveBeenCalledWith('0x123', 'eip155 Address', 'eip155')
  })

  it('should remove address label', () => {
    const removeAddressLabel = vi.spyOn(AccountController, 'removeAddressLabel')

    const appKit = new AppKit(mockOptions)
    appKit.removeAddressLabel('0x123', 'eip155')

    expect(removeAddressLabel).toHaveBeenCalledWith('0x123', 'eip155')
  })

  it('should get address and CAIP address', async () => {
    const mockAccountData = {
      address: '0x123',
      chainId: mainnet.id,
      chainNamespace: mainnet.chainNamespace
    }

    const appKit = new AppKit(mockOptions)
    await appKit['syncAccount'](mockAccountData)

    expect(appKit.getAddress()).toBe('0x123')
    expect(appKit.getCaipAddress()).toBe('eip155:1:0x123')
  })

  it('should get provider', () => {
    vi.spyOn(ProviderUtil, 'getProvider').mockReturnValue(mockProvider)
    const appKit = new AppKit(mockOptions)

    expect(appKit.getProvider<any>('eip155')).toBe(mockProvider)

    vi.spyOn(ProviderUtil, 'getProvider').mockClear()
  })

  it('should get preferred account type', () => {
    const appKit = new AppKit(mockOptions)
    appKit.setPreferredAccountType('eoa', mainnet.chainNamespace)

    expect(appKit.getPreferredAccountType()).toBe('eoa')
  })

  it('should set CAIP address', () => {
    const setCaipAddress = vi.spyOn(AccountController, 'setCaipAddress')

    const appKit = new AppKit(mockOptions)
    appKit.setCaipAddress('eip155:1:0x123', 'eip155')

    expect(setCaipAddress).toHaveBeenCalledWith('eip155:1:0x123', 'eip155')
    expect(appKit.getIsConnectedState()).toBe(true)
  })

  it('should set balance', () => {
    const setBalance = vi.spyOn(AccountController, 'setBalance')

    const appKit = new AppKit(mockOptions)
    appKit.setBalance('1.5', 'ETH', 'eip155')

    expect(setBalance).toHaveBeenCalledWith('1.5', 'ETH', 'eip155')
  })

  it('should set profile name', () => {
    const setProfileName = vi.spyOn(AccountController, 'setProfileName')

    const appKit = new AppKit(mockOptions)
    appKit.setProfileName('John Doe', 'eip155')

    expect(setProfileName).toHaveBeenCalledWith('John Doe', 'eip155')
  })

  it('should set profile image', () => {
    const setProfileImage = vi.spyOn(AccountController, 'setProfileImage')

    const appKit = new AppKit(mockOptions)
    appKit.setProfileImage('https://example.com/image.png', 'eip155')

    expect(setProfileImage).toHaveBeenCalledWith('https://example.com/image.png', 'eip155')
  })

  it('should reset account', () => {
    const resetAccount = vi.spyOn(AccountController, 'resetAccount')

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

    const appKit = new AppKit(mockOptions)
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
    const setAddressExplorerUrl = vi.spyOn(AccountController, 'setAddressExplorerUrl')

    const appKit = new AppKit(mockOptions)
    appKit.setAddressExplorerUrl('https://etherscan.io/address/0x123', mainnet.chainNamespace)

    expect(setAddressExplorerUrl).toHaveBeenCalledWith(
      'https://etherscan.io/address/0x123',
      mainnet.chainNamespace
    )
  })

  it('should set smart account deployed', () => {
    const setSmartAccountDeployed = vi.spyOn(AccountController, 'setSmartAccountDeployed')

    const appKit = new AppKit(mockOptions)
    appKit.setSmartAccountDeployed(true, mainnet.chainNamespace)

    expect(setSmartAccountDeployed).toHaveBeenCalledWith(true, mainnet.chainNamespace)
  })

  it('should set connected wallet info', () => {
    const walletInfo = { name: 'MetaMask', icon: 'icon-url' }
    const setConnectedWalletInfo = vi.spyOn(AccountController, 'setConnectedWalletInfo')

    const appKit = new AppKit(mockOptions)
    appKit.setConnectedWalletInfo(walletInfo, mainnet.chainNamespace)

    expect(setConnectedWalletInfo).toHaveBeenCalledWith(walletInfo, mainnet.chainNamespace)
  })

  it('should set connected wallet info with type', () => {
    const walletInfo = { name: 'MetaMask', icon: 'icon-url' }
    const setConnectedWalletInfo = vi.spyOn(AccountController, 'setConnectedWalletInfo')
    vi.spyOn(ProviderUtil, 'getProviderId').mockReturnValueOnce('WALLET_CONNECT')

    const appKit = new AppKit(mockOptions)
    appKit.setConnectedWalletInfo(walletInfo, mainnet.chainNamespace)

    expect(setConnectedWalletInfo).toHaveBeenCalledWith(
      { ...walletInfo, type: 'WALLET_CONNECT' },
      mainnet.chainNamespace
    )
  })

  it('should set smart account enabled networks', () => {
    const networks = [1, 137]
    const setSmartAccountEnabledNetworks = vi.spyOn(
      ChainController,
      'setSmartAccountEnabledNetworks'
    )

    const appKit = new AppKit(mockOptions)
    appKit.setSmartAccountEnabledNetworks(networks, mainnet.chainNamespace)

    expect(setSmartAccountEnabledNetworks).toHaveBeenCalledWith(networks, mainnet.chainNamespace)
  })

  it('should set preferred account type', () => {
    const setPreferredAccountType = vi.spyOn(AccountController, 'setPreferredAccountType')

    const appKit = new AppKit(mockOptions)
    appKit.setPreferredAccountType('eoa', mainnet.chainNamespace)

    expect(setPreferredAccountType).toHaveBeenCalledWith('eoa', mainnet.chainNamespace)
  })

  it('should create accounts with correct account types from user accounts', async () => {
    const createAccount = vi.spyOn(CoreHelperUtil, 'createAccount')
    const setAllAccounts = vi.spyOn(AccountController, 'setAllAccounts')
    const setPreferredAccountType = vi.spyOn(AccountController, 'setPreferredAccountType')

    const appKitWithAuth = new AppKit(mockOptions)
    ;(appKitWithAuth as any).authProvider = mockAuthProvider

    await (appKitWithAuth as any).syncAuthConnector(mockAuthProvider, mainnet.chainNamespace)

    await vi.waitFor(
      () => {
        expect(createAccount).toHaveBeenCalledWith(mainnet.chainNamespace, '0x1', 'eoa')
        expect(createAccount).toHaveBeenCalledWith(mainnet.chainNamespace, '0x2', 'smartAccount')
        expect(setAllAccounts).toHaveBeenCalledWith(
          [
            { address: '0x1', type: 'eoa', namespace: mainnet.chainNamespace },
            { address: '0x2', type: 'smartAccount', namespace: mainnet.chainNamespace }
          ],
          mainnet.chainNamespace
        )
        expect(setPreferredAccountType).toHaveBeenCalledWith('eoa', mainnet.chainNamespace)
      },
      { interval: 100, timeout: 2000 }
    )
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

    const appKit = new AppKit(mockOptions)
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
      expect.objectContaining({
        id: mainnet.id,
        name: mainnet.name
      })
    )

    await appKit.switchNetwork(polygon)

    expect(switchActiveNetwork).toHaveBeenCalledTimes(1)
  })

  it('should use the correct network when syncing account if it does not allow all networks and network is not allowed', async () => {
    const setActiveCaipNetwork = vi.spyOn(ChainController, 'setActiveCaipNetwork')
    const fetchTokenBalance = vi.spyOn(AccountController, 'fetchTokenBalance')
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
    const setConnectedWalletInfo = vi.spyOn(AccountController, 'setConnectedWalletInfo')
    const getActiveNetworkProps = vi.spyOn(StorageUtil, 'getActiveNetworkProps')
    const fetchTokenBalance = vi.spyOn(AccountController, 'fetchTokenBalance')
    const mockConnector = {
      id: 'test-wallet',
      name: 'Test Wallet',
      imageUrl: 'test-wallet-icon'
    } as Connector
    ConnectorController.state.connectors = [mockConnector]
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

    expect(setConnectedWalletInfo).toHaveBeenCalledWith({ name: mockConnector.id }, 'eip155')
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

    expect(fetchIdentity).not.toHaveBeenCalled()

    await appKit['syncAccount']({ ...mockAccountData, address: '0x456' })

    expect(fetchIdentity).toHaveBeenCalledOnce()
  })

  it('should not sync identity on non-evm network', async () => {
    const fetchIdentity = vi.spyOn(BlockchainApiController, 'fetchIdentity')

    const appKit = new AppKit({
      ...mockOptions,
      adapters: [mockSolanaAdapter],
      networks: [solana]
    })

    vi.spyOn(AccountController, 'fetchTokenBalance').mockResolvedValue([
      {
        quantity: { numeric: '0.00', decimals: '18' },
        chainId: solana.caipNetworkId,
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
    vi.spyOn(AccountController, 'fetchTokenBalance').mockResolvedValueOnce([
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
    vi.mocked(ProviderUtil).subscribeProviders = mockSubscribeProviders

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
    vi.spyOn(AccountController, 'setUser').mockImplementation(() => Promise.resolve())

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
    vi.spyOn(AccountController, 'setUser').mockImplementation(() => Promise.resolve())

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

  it('should get account information', () => {
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue({
      id: 'auth-connector'
    } as unknown as AuthConnector)
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      allAccounts: [{ address: '0x123', type: 'eoa', namespace: 'eip155' }],
      caipAddress: 'eip155:1:0x123',
      status: 'connected',
      user: { email: 'test@example.com' },
      socialProvider: 'email' as SocialProvider,
      preferredAccountType: 'eoa',
      smartAccountDeployed: true,
      currentTab: 0,
      addressLabels: new Map([['eip155:1:0x123', 'test-label']])
    })
    vi.spyOn(CoreHelperUtil, 'getPlainAddress')

    const appKit = new AppKit(mockOptions)
    const account = appKit.getAccount('eip155')

    expect(account).toEqual({
      allAccounts: [{ address: '0x123', type: 'eoa', namespace: 'eip155' }],
      caipAddress: 'eip155:1:0x123',
      address: '0x123',
      isConnected: true,
      status: 'connected',
      embeddedWalletInfo: {
        user: { email: 'test@example.com' },
        authProvider: 'email',
        accountType: 'eoa',
        isSmartAccountDeployed: true
      }
    })
  })
})
