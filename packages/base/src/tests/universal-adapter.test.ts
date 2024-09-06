import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mainnet, solana } from '../chains'
import { UniversalAdapterClient } from '../universal-adapter'
import { mockOptions } from './mocks/Options'
import mockProvider from './mocks/UniversalProvider'
import type UniversalProvider from '@walletconnect/universal-provider'
import { NetworkController } from '@rerock/core'
import { ProviderUtil } from '@rerock/base/store'
import { ConstantsUtil, PresetsUtil } from '@rerock/scaffold-utils'
import mockAppKit from './mocks/AppKit'

describe('UniversalAdapter', () => {
  let universalAdapter: UniversalAdapterClient

  beforeEach(() => {
    universalAdapter = new UniversalAdapterClient(mockOptions)
    universalAdapter.walletConnectProvider = mockProvider
    universalAdapter.construct(mockAppKit, mockOptions)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('UniversalAdapter - Initialization', () => {
    it('should set caipNetworks to provided caipNetworks options', () => {
      expect(universalAdapter?.caipNetworks).toEqual(mockOptions.caipNetworks)
    })

    it('should set defaultNetwork to first caipNetwork option', () => {
      expect(universalAdapter?.defaultNetwork).toEqual(mockOptions.caipNetworks[0])
    })

    it('should set metadata to metadata options', () => {
      expect((universalAdapter as any).appKit).toEqual(mockAppKit)
    })
  })

  describe('UniversalAdapter - Public Methods', () => {
    it('should return walletConnectProvider when getWalletConnectProvider is invoked', async () => {
      const switchNetworkSpy = vi.spyOn(universalAdapter, 'switchNetwork')
      await universalAdapter.networkControllerClient.switchCaipNetwork(mainnet)
      expect(switchNetworkSpy).toHaveBeenCalledWith(mainnet)
    })
  })

  describe('UniversalAdapter - Network', () => {
    it('should call switchCaipNetwork when networkControllerClient.switchCaipNetwork is invoked', async () => {
      const provider = await universalAdapter.getWalletConnectProvider()
      expect(provider).toEqual(mockProvider)
    })

    it('should call return correct approvedCaipNetworksData', async () => {
      const approvedCaipNetworksData =
        await universalAdapter.networkControllerClient.getApprovedCaipNetworksData()

      expect(approvedCaipNetworksData).toMatchObject({
        supportsAllNetworks: false,
        approvedCaipNetworkIds: [
          mockProvider.session?.namespaces['eip155']?.chains?.[0],
          mockProvider.session?.namespaces['solana']?.chains?.[0]
        ]
      })
    })

    it('should call setDefaultNetwork and set first caipNetwork on setActiveCaipNetwork when there is no active caipNetwork', async () => {
      vi.spyOn(NetworkController, 'state', 'get').mockReturnValue({
        caipNetwork: undefined,
        requestedCaipNetworks: [mainnet, solana],
        approvedCaipNetworkIds: [],
        supportsAllNetworks: false,
        isDefaultCaipNetwork: false
      })

      const adapterSpy = vi.spyOn(universalAdapter as any, 'setDefaultNetwork')
      const networkControllerSpy = vi.spyOn(NetworkController, 'setActiveCaipNetwork')

      const mockOnUri = vi.fn()
      await universalAdapter?.connectionControllerClient?.connectWalletConnect?.(mockOnUri)

      expect(adapterSpy).toHaveBeenCalledWith(mockProvider.session?.namespaces)
      expect(networkControllerSpy).toHaveBeenCalledWith(mainnet)
    })

    it('should set correct requestedCaipNetworks in AppKit when syncRequestedNetworks has been called', () => {
      ;(universalAdapter as any).syncRequestedNetworks(mockOptions.caipNetworks)
      expect(mockAppKit.setRequestedCaipNetworks).toHaveBeenCalledWith([mainnet], 'eip155')
      expect(mockAppKit.setRequestedCaipNetworks).toHaveBeenCalledWith([solana], 'solana')
    })
  })

  describe('UniversalAdapter - Connection', () => {
    it('should connect the walletConnectProvider with the right namespaces  when connectionControllerClient.connectWalletConnect is invoked', async () => {
      const providerSpy = vi.spyOn(
        universalAdapter.walletConnectProvider as UniversalProvider,
        'connect'
      )
      const mockOnUri = vi.fn()
      await universalAdapter?.connectionControllerClient?.connectWalletConnect?.(mockOnUri)
      expect(providerSpy).toHaveBeenCalledWith({
        optionalNamespaces: universalAdapter.walletConnectProvider?.namespaces
      })
    })

    it('should update AppKit state when connectionControllerClient.connectWalletConnect is invoked', async () => {
      const mockOnUri = vi.fn()
      await universalAdapter?.connectionControllerClient?.connectWalletConnect?.(mockOnUri)

      expect(mockAppKit.setIsConnected).toHaveBeenCalledWith(true, 'eip155')
      expect(mockAppKit.setIsConnected).toHaveBeenCalledWith(true, 'solana')

      expect(mockAppKit.setPreferredAccountType).toHaveBeenCalledWith('eoa', 'eip155')
      expect(mockAppKit.setPreferredAccountType).toHaveBeenCalledWith('eoa', 'solana')

      expect(mockAppKit.setCaipAddress).toHaveBeenCalledWith(
        mockProvider.session?.namespaces['eip155']?.accounts[0],
        'eip155'
      )
      expect(mockAppKit.setCaipAddress).toHaveBeenCalledWith(
        mockProvider.session?.namespaces['solana']?.accounts[0],
        'solana'
      )

      expect(mockAppKit.setConnectedWalletInfo).toHaveBeenCalledWith(
        {
          description: 'Mock Wallet Description',
          url: 'https://mockwallet.com',
          name: 'Mock Wallet',
          icon: 'https://mockwallet.com/icon.png',
          icons: ['https://mockwallet.com/icon.png']
        },
        'eip155'
      )
    })

    it('should return correct provider data when getProviderData is invoked', async () => {
      const data = (universalAdapter as any).getProviderData()
      expect(data).toMatchObject({
        provider: mockProvider,
        namespaces: mockProvider.session?.namespaces,
        namespaceKeys: Object.keys(mockProvider.session?.namespaces || {}),
        isConnected: true,
        preferredAccountType: 'eoa'
      })
    })

    it('should disconnect the walletConnectProvider when disconnect is invoked', async () => {
      const providerSpy = vi.spyOn(
        universalAdapter.walletConnectProvider as UniversalProvider,
        'disconnect'
      )
      await universalAdapter?.connectionControllerClient?.disconnect?.()
      expect(providerSpy).toHaveBeenCalled()
      expect(mockAppKit.resetAccount).toHaveBeenCalledWith('eip155')
      expect(mockAppKit.resetAccount).toHaveBeenCalledWith('solana')
    })
  })

  describe('UniversalAdapter - ProviderUtil', () => {
    it('should set the provider in ProviderUtil when setWalletConnectProvider is called', async () => {
      const mockSetProvider = vi.spyOn(ProviderUtil, 'setProvider')
      const mockSetProviderId = vi.spyOn(ProviderUtil, 'setProviderId')

      await (universalAdapter as any).setWalletConnectProvider()

      expect(mockSetProvider).toHaveBeenCalledWith('eip155', universalAdapter.walletConnectProvider)

      expect(mockSetProviderId).toHaveBeenCalledWith('eip155', 'walletConnect')

      expect(mockSetProvider).toHaveBeenCalledWith('solana', universalAdapter.walletConnectProvider)

      expect(mockSetProviderId).toHaveBeenCalledWith('solana', 'walletConnect')
    })
  })

  describe('UniversalAdapter - Provider', () => {
    it('should set up event listeners when watchWalletConnect is called', async () => {
      const provider = await universalAdapter.getWalletConnectProvider()
      const providerOnSpy = vi.spyOn(provider as UniversalProvider, 'on')

      await (universalAdapter as any).watchWalletConnect()

      expect(providerOnSpy).toHaveBeenCalledWith('disconnect', expect.any(Function))
      expect(providerOnSpy).toHaveBeenCalledWith('accountsChanged', expect.any(Function))
      expect(providerOnSpy).toHaveBeenCalledWith('chainChanged', expect.any(Function))
    })
  })

  describe('UniversalAdapter - Connectors', () => {
    it('should sync connectors correctly', () => {
      ;(universalAdapter as any).syncConnectors()

      expect(mockAppKit.setConnectors).toHaveBeenCalledWith([
        {
          id: ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID,
          explorerId: PresetsUtil.ConnectorExplorerIds[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID],
          imageId: PresetsUtil.ConnectorImageIds[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID],
          name: PresetsUtil.ConnectorNamesMap[ConstantsUtil.WALLET_CONNECT_CONNECTOR_ID],
          type: 'WALLET_CONNECT',
          chain: universalAdapter.chainNamespace
        }
      ])
    })
  })
})
