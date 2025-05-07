import { expect, fixture, html } from '@open-wc/testing'
import { afterEach, beforeEach, describe, it, vi, expect as viExpect } from 'vitest'

import type { Balance, CaipAddress, CaipNetwork, ChainNamespace } from '@reown/appkit-common'
import {
  type ChainAdapter,
  ChainController,
  type ConnectionControllerClient,
  type NetworkControllerClient,
  RouterController,
  SendController
} from '@reown/appkit-controllers'
import type { WuiButton } from '@reown/appkit-ui/wui-button'

import { W3mWalletSendPreviewView } from '../../src/views/w3m-wallet-send-preview-view'

const mockToken: Balance = {
  address: '0x123',
  symbol: 'TEST',
  name: 'Test Token',
  quantity: {
    numeric: '100',
    decimals: '18'
  },
  price: 10,
  chainId: 'eip155:1',
  iconUrl: 'https://example.com/icon.png',
  value: 1000
}

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
  }
}

const mockSendControllerState = {
  token: mockToken,
  sendTokenAmount: 5,
  receiverAddress: '0x456',
  loading: false,
  tokenBalances: [mockToken]
}

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

const mockChainAdapter: ChainAdapter = {
  namespace: 'eip155' as ChainNamespace,
  networkControllerClient: mockNetworkControllerClient,
  connectionControllerClient: mockConnectionControllerClient
}

const mockChainControllerState = {
  activeChain: 'eip155' as ChainNamespace,
  activeCaipNetwork: mockNetwork,
  activeCaipAddress: 'eip155:1:0x123456789abcdef123456789abcdef123456789a' as CaipAddress,
  chains: new Map([['eip155' as ChainNamespace, mockChainAdapter]]),
  universalAdapter: {
    networkControllerClient: mockNetworkControllerClient,
    connectionControllerClient: mockConnectionControllerClient
  },
  noAdapters: false,
  isSwitchingNamespace: false
}

describe('W3mWalletSendPreviewView', () => {
  beforeEach(() => {
    // Mock SendController state
    vi.spyOn(SendController, 'state', 'get').mockReturnValue(mockSendControllerState)

    // Mock ChainController state
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue(mockChainControllerState)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render initial state with token details', async () => {
    const element = await fixture<W3mWalletSendPreviewView>(
      html`<w3m-wallet-send-preview-view></w3m-wallet-send-preview-view>`
    )

    await element.updateComplete

    const previewItems = element.shadowRoot?.querySelectorAll('wui-preview-item')
    expect(previewItems?.length).to.equal(2)

    // Check token preview
    const tokenPreview = previewItems?.[0]
    expect(tokenPreview?.text).to.equal('5 TEST')
    expect(tokenPreview?.imageSrc).to.equal(mockToken.iconUrl)

    const valueText = element.shadowRoot?.querySelector('wui-text[variant="paragraph-400"]')
    expect(valueText?.textContent?.trim()).to.equal('$50.00')
  })

  it('should display truncated address when no profile name', async () => {
    const element = await fixture<W3mWalletSendPreviewView>(
      html`<w3m-wallet-send-preview-view></w3m-wallet-send-preview-view>`
    )

    await element.updateComplete

    const addressPreview = element.shadowRoot?.querySelectorAll('wui-preview-item')?.[1]
    expect(addressPreview?.text).to.contain('0x45')
    expect(addressPreview?.address).to.equal('0x456')
    expect(addressPreview?.isAddress).to.be.true
  })

  it('should display profile name when available', async () => {
    vi.spyOn(SendController, 'state', 'get').mockReturnValue({
      ...mockSendControllerState,
      receiverProfileName: 'Test User',
      receiverProfileImageUrl: 'https://example.com/profile.jpg'
    })

    const element = await fixture<W3mWalletSendPreviewView>(
      html`<w3m-wallet-send-preview-view></w3m-wallet-send-preview-view>`
    )

    await element.updateComplete

    const addressPreview = element.shadowRoot?.querySelectorAll('wui-preview-item')?.[1]
    expect(addressPreview?.text).to.equal('Test User')
    expect(addressPreview?.imageSrc).to.equal('https://example.com/profile.jpg')
    expect(addressPreview?.address).to.equal('0x456')
    expect(addressPreview?.isAddress).to.be.true
  })

  it('should handle send action', async () => {
    const sendSpy = vi.spyOn(SendController, 'sendToken')

    const element = await fixture<W3mWalletSendPreviewView>(
      html`<w3m-wallet-send-preview-view></w3m-wallet-send-preview-view>`
    )

    await element.updateComplete

    const button = element.shadowRoot?.querySelector('.sendButton') as HTMLElement
    button?.click()

    viExpect(sendSpy).toHaveBeenCalled()
  })

  it('should handle cancel action', async () => {
    const routerSpy = vi.spyOn(RouterController, 'goBack')

    const element = await fixture<W3mWalletSendPreviewView>(
      html`<w3m-wallet-send-preview-view></w3m-wallet-send-preview-view>`
    )

    await element.updateComplete

    const button = element.shadowRoot?.querySelector('.cancelButton') as HTMLElement
    button?.click()

    viExpect(routerSpy).toHaveBeenCalled()
  })

  it('should display network fee', async () => {
    const element = await fixture<W3mWalletSendPreviewView>(
      html`<w3m-wallet-send-preview-view></w3m-wallet-send-preview-view>`
    )

    await element.updateComplete

    const detailsElement = element.shadowRoot?.querySelector('w3m-wallet-send-details')
    expect(detailsElement).to.exist
    expect(detailsElement?.receiverAddress).to.equal('0x456')
    expect(detailsElement?.caipNetwork).to.deep.equal(mockNetwork)
  })

  it('should cleanup subscriptions on disconnect', async () => {
    const element = await fixture<W3mWalletSendPreviewView>(
      html`<w3m-wallet-send-preview-view></w3m-wallet-send-preview-view>`
    )

    const unsubscribeSpy = vi.fn()
    element['unsubscribe'] = [unsubscribeSpy]

    element.disconnectedCallback()
    viExpect(unsubscribeSpy).toHaveBeenCalled()
  })

  it('should update when token details change', async () => {
    const element = await fixture<W3mWalletSendPreviewView>(
      html`<w3m-wallet-send-preview-view></w3m-wallet-send-preview-view>`
    )

    await element.updateComplete

    const newToken = { ...mockToken, price: 20 }
    vi.spyOn(SendController, 'state', 'get').mockReturnValue({
      ...mockSendControllerState,
      token: newToken
    })

    element['token'] = newToken
    await element.updateComplete

    const valueText = element.shadowRoot?.querySelector('wui-text[variant="paragraph-400"]')
    expect(valueText?.textContent?.trim()).to.equal('$100.00')
  })

  it('should redirect to account view when send is successful', async () => {
    const sendSpy = vi.spyOn(SendController, 'sendToken').mockResolvedValue()
    const routerSpy = vi.spyOn(RouterController, 'replace')
    vi.spyOn(SendController, 'state', 'get').mockReturnValue({
      ...mockSendControllerState
    })

    const element = await fixture<W3mWalletSendPreviewView>(
      html`<w3m-wallet-send-preview-view></w3m-wallet-send-preview-view>`
    )

    await element.updateComplete

    let button: WuiButton = element.shadowRoot?.querySelector('.sendButton') as WuiButton
    button?.click()

    await element.updateComplete

    viExpect(sendSpy).toHaveBeenCalled()
    viExpect(routerSpy).toHaveBeenCalledWith('Account')
  })

  it('should show loading state when sending', async () => {
    // Mock SendController.state to have loading=true
    vi.spyOn(SendController, 'state', 'get').mockReturnValue({
      ...mockSendControllerState,
      loading: true
    })

    const element = await fixture<W3mWalletSendPreviewView>(
      html`<w3m-wallet-send-preview-view></w3m-wallet-send-preview-view>`
    )

    await element.updateComplete

    // Get the button and check if it has the loading property set
    const button = element.shadowRoot?.querySelector('.sendButton') as WuiButton
    expect(button?.loading).to.equal(true)
  })
})
