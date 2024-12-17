import { W3mAccountView } from '../../src/views/w3m-account-view'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { elementUpdated, fixture } from '@open-wc/testing'
import { html } from 'lit'
import { HelpersUtil } from '../utils/HelpersUtil'
import {
  AccountController,
  ChainController,
  ConnectorController,
  StorageUtil
} from '@reown/appkit-core'
import type { AccountControllerState, ChainControllerState } from '@reown/appkit-core'
import { W3mFrameProvider } from '@reown/appkit-wallet'

describe('W3mAccountView', () => {
  const mockNetwork = 'eip155'
  const mockAuthConnector = {
    id: 'ID_AUTH',
    chain: 'eip155' as const,
    type: 'AUTH' as const,
    provider: {} as W3mFrameProvider
  }

  beforeEach(() => {
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      activeChain: mockNetwork
    } as ChainControllerState)

    vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
      address: '0x123',
      profileImage: 'profile.jpg',
      profileName: 'Test Account',
      preferredAccountType: 'eoa'
    } as AccountControllerState)

    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: false } as MediaQueryList)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when no active network', async () => {
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      activeChain: undefined
    } as ChainControllerState)

    const element: W3mAccountView = await fixture(html`<w3m-account-view></w3m-account-view>`)
    const defaultWidget = HelpersUtil.querySelect(element, 'w3m-account-default-widget')
    expect(defaultWidget).toBeNull()

    const walletFeaturesTemplate = HelpersUtil.querySelect(
      element,
      'w3m-account-wallet-features-widget'
    )
    expect(walletFeaturesTemplate).toBeNull()
  })

  it('renders wallet features template for Auth connector', async () => {
    vi.spyOn(StorageUtil, 'getConnectedConnector').mockReturnValue('ID_AUTH')
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue(mockAuthConnector)

    const element: W3mAccountView = await fixture(html`<w3m-account-view></w3m-account-view>`)
    expect(HelpersUtil.querySelect(element, 'w3m-account-wallet-features-widget')).toBeTruthy()
    expect(HelpersUtil.querySelect(element, 'w3m-account-default-widget')).toBeFalsy()
  })

  it('renders default template for non-auth connector', async () => {
    vi.spyOn(StorageUtil, 'getConnectedConnector').mockReturnValue('ANNOUNCED')
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue(undefined)

    const element: W3mAccountView = await fixture(html`<w3m-account-view></w3m-account-view>`)
    expect(HelpersUtil.querySelect(element, 'w3m-account-default-widget')).toBeTruthy()
    expect(HelpersUtil.querySelect(element, 'w3m-account-wallet-features-widget')).toBeFalsy()
  })

  it('renders default template when auth connector exists but connected type is not ID_AUTH', async () => {
    vi.spyOn(StorageUtil, 'getConnectedConnector').mockReturnValue('ANNOUNCED')
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue(mockAuthConnector)

    const element: W3mAccountView = await fixture(html`<w3m-account-view></w3m-account-view>`)
    expect(HelpersUtil.querySelect(element, 'w3m-account-default-widget')).toBeTruthy()
  })

  it('updates view when active network changes', async () => {
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      activeChain: undefined
    } as ChainControllerState)
    const element: W3mAccountView = await fixture(html`<w3m-account-view></w3m-account-view>`)

    element.requestUpdate()
    await elementUpdated(element)

    const defaultWidget = HelpersUtil.querySelect(element, 'w3m-account-default-widget')
    expect(defaultWidget).toBeNull()

    const walletFeaturesTemplate = HelpersUtil.querySelect(
      element,
      'w3m-account-wallet-features-widget'
    )
    expect(walletFeaturesTemplate).toBeNull()
  })
})
