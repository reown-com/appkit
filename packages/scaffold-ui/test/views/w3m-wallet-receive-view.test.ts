import { expect, fixture, html } from '@open-wc/testing'
import { afterEach, beforeEach, describe, it, vi, expect as viExpect } from 'vitest'

import { type CaipAddress, type CaipNetwork, ConstantsUtil } from '@reown/appkit-common'
import {
  type AccountState,
  AssetUtil,
  ChainController,
  type ChainControllerState,
  type ConnectionControllerClient,
  CoreHelperUtil,
  type NetworkControllerClient,
  RouterController,
  SnackController
} from '@reown/appkit-controllers'
import { W3mFrameRpcConstants } from '@reown/appkit-wallet/utils'

import { W3mWalletReceiveView } from '../../src/views/w3m-wallet-receive-view'

const mockNetwork: CaipNetwork = {
  id: 1,
  name: 'Ethereum',
  chainNamespace: 'eip155',
  caipNetworkId: 'eip155:1',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ['https://ethereum.rpc.com']
    }
  },
  assets: {
    imageId: 'ethereum',
    imageUrl: 'https://example.com/ethereum.png'
  }
}

const mockAddress = '0x123456789abcdef123456789abcdef123456789a'
const mockProfileName = 'Test User'

const mockNetworkControllerClient: NetworkControllerClient = {
  switchCaipNetwork: vi.fn(),
  getApprovedCaipNetworksData: vi.fn().mockResolvedValue({
    approvedCaipNetworkIds: ['eip155:1'],
    supportsAllNetworks: true
  })
}

const mockConnectionControllerClient: ConnectionControllerClient = {
  connectWalletConnect: vi.fn(),
  connectExternal: vi.fn(),
  reconnectExternal: vi.fn(),
  checkInstalled: vi.fn(),
  disconnect: vi.fn(),
  disconnectConnector: vi.fn(),
  signMessage: vi.fn(),
  sendTransaction: vi.fn(),
  estimateGas: vi.fn(),
  parseUnits: vi.fn(),
  formatUnits: vi.fn(),
  writeContract: vi.fn(),
  getEnsAddress: vi.fn(),
  getEnsAvatar: vi.fn(),
  grantPermissions: vi.fn(),
  revokePermissions: vi.fn(),
  getCapabilities: vi.fn(),
  walletGetAssets: vi.fn(),
  updateBalance: vi.fn()
}

// Create partial mock states to satisfy TypeScript
const mockAccountState: Partial<AccountState> = {
  address: mockAddress,
  profileName: mockProfileName,
  preferredAccountType: W3mFrameRpcConstants.ACCOUNT_TYPES.EOA,
  currentTab: 0,
  addressLabels: new Map()
}

const mockChainControllerState: Partial<ChainControllerState> = {
  activeCaipNetwork: mockNetwork,
  activeCaipAddress: `eip155:1:${mockAddress}` as CaipAddress,
  activeChain: ConstantsUtil.CHAIN.EVM,
  chains: new Map([
    [
      'eip155',
      {
        namespace: ConstantsUtil.CHAIN.EVM,
        networkControllerClient: mockNetworkControllerClient,
        connectionControllerClient: mockConnectionControllerClient
      }
    ]
  ]),
  universalAdapter: {
    networkControllerClient: mockNetworkControllerClient,
    connectionControllerClient: mockConnectionControllerClient
  },
  noAdapters: false,
  isSwitchingNamespace: false
}

const mockRequestedNetworks: CaipNetwork[] = [
  mockNetwork,
  {
    ...mockNetwork,
    id: 2,
    name: 'Polygon',
    caipNetworkId: 'eip155:137' as `eip155:${number}`,
    assets: {
      imageId: 'polygon',
      imageUrl: 'https://example.com/polygon.png'
    }
  }
]

describe('W3mWalletReceiveView', () => {
  beforeEach(() => {
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue(mockAccountState as AccountState)

    // Mock ChainController state
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue(
      mockChainControllerState as ChainControllerState
    )

    // Mock asset and chain controller methods
    vi.spyOn(AssetUtil, 'getNetworkImage').mockReturnValue('https://example.com/network.png')
    vi.spyOn(ChainController, 'getAllRequestedCaipNetworks').mockReturnValue(mockRequestedNetworks)
    vi.spyOn(ChainController, 'checkIfSmartAccountEnabled').mockReturnValue(false)

    // Mock other controllers
    vi.spyOn(CoreHelperUtil, 'copyToClopboard').mockImplementation(() => {})
    vi.spyOn(SnackController, 'showSuccess').mockImplementation(() => {})
    vi.spyOn(SnackController, 'showError').mockImplementation(() => {})
    vi.spyOn(RouterController, 'push').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render with address and QR code', async () => {
    const element = await fixture<W3mWalletReceiveView>(
      html`<w3m-wallet-receive-view></w3m-wallet-receive-view>`
    )

    await element.updateComplete

    // Check if chip button with address is rendered
    const chipButton = element.shadowRoot?.querySelector('wui-chip-button')
    expect(chipButton).to.exist
    expect(chipButton?.getAttribute('text')).to.include(mockProfileName)

    // Check if QR code is rendered
    const qrCode = element.shadowRoot?.querySelector('wui-qr-code')
    expect(qrCode).to.exist
    expect(qrCode?.getAttribute('uri')).to.equal(mockAddress)

    // Check if compatible network section is rendered
    const compatibleNetwork = element.shadowRoot?.querySelector('wui-compatible-network')
    expect(compatibleNetwork).to.exist
    expect(compatibleNetwork?.getAttribute('text')).to.include('networks')
  })

  it('should display address when no profile name', async () => {
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      ...mockAccountState,
      profileName: undefined
    } as AccountState)

    const element = await fixture<W3mWalletReceiveView>(
      html`<w3m-wallet-receive-view></w3m-wallet-receive-view>`
    )

    await element.updateComplete

    const chipButton = element.shadowRoot?.querySelector('wui-chip-button')
    expect(chipButton).to.exist
    expect(chipButton?.getAttribute('text')).to.include('0x12')
    expect(chipButton?.getAttribute('text')).to.include('789a')
  })

  it('should copy address on button click', async () => {
    const element = await fixture<W3mWalletReceiveView>(
      html`<w3m-wallet-receive-view></w3m-wallet-receive-view>`
    )

    await element.updateComplete

    const copyButton = element.shadowRoot?.querySelector(
      '[data-testid="receive-address-copy-button"]'
    ) as HTMLElement
    expect(copyButton).to.exist
    copyButton?.click()

    viExpect(CoreHelperUtil.copyToClopboard).toHaveBeenCalledWith(mockAddress)
    viExpect(SnackController.showSuccess).toHaveBeenCalledWith('Address copied')
  })

  it('should handle error when copying fails', async () => {
    vi.spyOn(CoreHelperUtil, 'copyToClopboard').mockImplementation(() => {
      throw new Error('Copy failed')
    })

    const element = await fixture<W3mWalletReceiveView>(
      html`<w3m-wallet-receive-view></w3m-wallet-receive-view>`
    )

    await element.updateComplete

    const copyButton = element.shadowRoot?.querySelector(
      '[data-testid="receive-address-copy-button"]'
    ) as HTMLElement
    copyButton?.click()

    viExpect(SnackController.showError).toHaveBeenCalledWith('Failed to copy')
  })

  it('should navigate to compatible networks view on network click', async () => {
    const element = await fixture<W3mWalletReceiveView>(
      html`<w3m-wallet-receive-view></w3m-wallet-receive-view>`
    )

    await element.updateComplete

    const compatibleNetwork = element.shadowRoot?.querySelector(
      'wui-compatible-network'
    ) as HTMLElement
    compatibleNetwork?.click()

    viExpect(RouterController.push).toHaveBeenCalledWith('WalletCompatibleNetworks')
  })

  it('should display single network for smart accounts', async () => {
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      ...mockAccountState,
      preferredAccountType: W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
    } as AccountState)
    vi.spyOn(ChainController, 'checkIfSmartAccountEnabled').mockReturnValue(true)

    const element = await fixture<W3mWalletReceiveView>(
      html`<w3m-wallet-receive-view></w3m-wallet-receive-view>`
    )

    await element.updateComplete

    const compatibleNetwork = element.shadowRoot?.querySelector('wui-compatible-network')
    expect(compatibleNetwork).to.exist
    expect(compatibleNetwork?.getAttribute('text')).to.include('this network')
  })

  it('should cleanup subscriptions on disconnect', async () => {
    const element = await fixture<W3mWalletReceiveView>(
      html`<w3m-wallet-receive-view></w3m-wallet-receive-view>`
    )

    const unsubscribeSpy = vi.fn()
    element['unsubscribe'] = [unsubscribeSpy]

    element.disconnectedCallback()
    viExpect(unsubscribeSpy).toHaveBeenCalled()
  })
})
