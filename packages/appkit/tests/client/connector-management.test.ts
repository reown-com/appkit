import UniversalProvider from '@walletconnect/universal-provider'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Connector, ConnectorType } from '@reown/appkit'
import { SafeLocalStorage, SafeLocalStorageKeys, getSafeConnectorIdKey } from '@reown/appkit-common'
import {
  AccountController,
  ApiController,
  AssetUtil,
  BlockchainApiController,
  ChainController,
  ConnectorController,
  OptionsController,
  StorageUtil
} from '@reown/appkit-controllers'
import { ConstantsUtil as UtilConstantsUtil } from '@reown/appkit-utils'
import { ProviderUtil } from '@reown/appkit-utils'

import { AppKit } from '../../src/client/appkit.js'
import { mockEvmAdapter } from '../mocks/Adapter.js'
import { mainnet } from '../mocks/Networks.js'
import { mockOptions } from '../mocks/Options.js'
import { mockProvider, mockUniversalProvider } from '../mocks/Providers.js'
import {
  mockBlockchainApiController,
  mockRemoteFeatures,
  mockStorageUtil,
  mockWindowAndDocument
} from '../test-utils.js'

describe('Connector Management', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(UniversalProvider, 'init').mockResolvedValue(mockUniversalProvider as any)
    mockWindowAndDocument()
    mockStorageUtil()
    mockBlockchainApiController()
    mockRemoteFeatures()
    vi.spyOn(ApiController, 'fetchAllowedOrigins').mockResolvedValue(['http://localhost:3000'])
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

  it('should get provider', () => {
    vi.spyOn(ProviderUtil, 'getProvider').mockReturnValue(mockProvider)
    const appKit = new AppKit(mockOptions)

    expect(appKit.getProvider<any>('eip155')).toBe(mockProvider)

    vi.spyOn(ProviderUtil, 'getProvider').mockClear()
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

  it('should set connected wallet info when syncing account', async () => {
    const setConnectedWalletInfo = vi.spyOn(AccountController, 'setConnectedWalletInfo')
    const getActiveNetworkProps = vi.spyOn(StorageUtil, 'getActiveNetworkProps')
    const fetchTokenBalance = vi.spyOn(AccountController, 'fetchTokenBalance')
    vi.spyOn(ProviderUtil, 'getProviderId').mockReturnValue(
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
      } as any
    ])
    getActiveNetworkProps.mockReturnValueOnce({
      namespace: mainnet.chainNamespace,
      chainId: mainnet.id,
      caipNetworkId: mainnet.caipNetworkId
    })

    const appKit = new AppKit(mockOptions)
    await appKit['syncAccount'](mockAccountData)

    expect(setConnectedWalletInfo).toHaveBeenCalledWith(
      {
        name: mockConnector.name,
        type: UtilConstantsUtil.CONNECTOR_TYPE_INJECTED as ConnectorType,
        icon: mockConnector.imageUrl
      },
      'eip155'
    )
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
})
