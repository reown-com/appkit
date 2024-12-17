import { W3mSwitchAddressView } from '../../src/views/w3m-switch-address-view'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { elementUpdated, fixture } from '@open-wc/testing'
import { html } from 'lit'
import { HelpersUtil } from '../utils/HelpersUtil'
import {
  AccountController,
  BlockchainApiController,
  ChainController,
  ModalController,
  OptionsController,
  StorageUtil,
  type AccountControllerState,
  type ChainControllerState
} from '@reown/appkit-core'
import type { CaipNetwork } from '@reown/appkit-common'
import type {
  OptionsControllerStateInternal,
  OptionsControllerStatePublic
} from '../../../core/dist/types/src/controllers/OptionsController'

describe('W3mSwitchAddressView', () => {
  const mockAccounts = [
    { address: '0x123', type: 'eoa' },
    { address: '0x456', type: 'smartAccount' }
  ]
  const mockNetwork = {
    id: '1',
    chainNamespace: 'eip155',
    caipNetworkId: 'eip155:1'
  } as unknown as CaipNetwork

  beforeEach(() => {
    vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
      address: '0x123',
      allAccounts: mockAccounts,
      addressLabels: new Map()
    } as AccountControllerState)

    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      activeCaipNetwork: mockNetwork,
      activeChain: 'eip155'
    } as ChainControllerState)

    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      metadata: {
        icons: ['icon.png'],
        url: 'test.com'
      }
    } as OptionsControllerStatePublic & OptionsControllerStateInternal)

    vi.spyOn(BlockchainApiController, 'getBalance').mockResolvedValue({
      balances: [
        {
          value: 100,
          symbol: 'USD',
          name: 'USD',
          chainId: 'eip155:1',
          price: 1,
          quantity: {
            decimals: '18',
            numeric: '100000000000000000000'
          },
          iconUrl: ''
        }
      ]
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders all accounts with balances', async () => {
    const element: W3mSwitchAddressView = await fixture(
      html`<w3m-switch-address-view></w3m-switch-address-view>`
    )
    vi.useFakeTimers()
    element.requestUpdate()
    await elementUpdated(element)
    await vi.runAllTimersAsync()

    const addressItems = element.shadowRoot?.querySelectorAll('[data-testid="switch-address-item"]')
    expect(addressItems?.length).toBe(2)

    const balanceItem = HelpersUtil.querySelect(element, '[class="address-description"]')
    expect(HelpersUtil.getTextContent(balanceItem)).toContain('$100.00')
  })

  it('shows icon for AUTH connector accounts', async () => {
    vi.spyOn(StorageUtil, 'getConnectedConnector').mockReturnValue('ID_AUTH')

    const element: W3mSwitchAddressView = await fixture(
      html`<w3m-switch-address-view></w3m-switch-address-view>`
    )
    expect(HelpersUtil.querySelect(element, 'wui-icon-box')).toBeTruthy()
  })

  it('does not show icon for non-AUTH connector accounts', async () => {
    vi.spyOn(StorageUtil, 'getConnectedConnector').mockReturnValue('INJECTED')

    const element: W3mSwitchAddressView = await fixture(
      html`<w3m-switch-address-view></w3m-switch-address-view>`
    )
    expect(HelpersUtil.querySelect(element, 'wui-icon-box')).toBeFalsy()
  })

  it('displays correct icon for account types', async () => {
    vi.spyOn(StorageUtil, 'getConnectedConnector').mockReturnValue('ID_AUTH')

    const element: W3mSwitchAddressView = await fixture(
      html`<w3m-switch-address-view></w3m-switch-address-view>`
    )
    const iconBoxes = element.shadowRoot?.querySelectorAll('wui-icon-box') || []

    expect(iconBoxes?.[0]?.getAttribute('icon')).toBe('mail')
    expect(iconBoxes?.[1]?.getAttribute('icon')).toBe('lightbulb')
  })

  it('shows switch button only for non-current addresses', async () => {
    const element: W3mSwitchAddressView = await fixture(
      html`<w3m-switch-address-view></w3m-switch-address-view>`
    )

    const buttons = element.shadowRoot?.querySelectorAll('wui-button')
    expect(buttons?.length).toBe(1)
    expect(
      HelpersUtil.querySelect(element, '[data-testid="w3m-switch-address-button-1"]')
    ).toBeTruthy()
  })

  it('switches address and closes modal', async () => {
    const setCaipAddressSpy = vi.spyOn(AccountController, 'setCaipAddress')
    const modalCloseSpy = vi.spyOn(ModalController, 'close')

    const element: W3mSwitchAddressView = await fixture(
      html`<w3m-switch-address-view></w3m-switch-address-view>`
    )
    const switchButton = HelpersUtil.querySelect(
      element,
      '[data-testid="w3m-switch-address-button-1"]'
    )
    await switchButton?.click()

    expect(setCaipAddressSpy).toHaveBeenCalledWith('eip155:1:0x456', 'eip155')
    expect(modalCloseSpy).toHaveBeenCalled()
  })

  it('shows loading spinner while fetching balances', async () => {
    vi.spyOn(BlockchainApiController, 'getBalance').mockImplementation(() => new Promise(() => {}))

    const element: W3mSwitchAddressView = await fixture(
      html`<w3m-switch-address-view></w3m-switch-address-view>`
    )
    expect(HelpersUtil.querySelect(element, 'wui-loading-spinner')).toBeTruthy()
  })

  it('uses address labels when available', async () => {
    const mockLabels = new Map([['0x123', 'Main Account']])
    vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
      ...AccountController.state,
      addressLabels: mockLabels
    })

    const element: W3mSwitchAddressView = await fixture(
      html`<w3m-switch-address-view></w3m-switch-address-view>`
    )
    const address = HelpersUtil.querySelect(element, '[class="address"]')
    expect(HelpersUtil.getTextContent(address)).toContain('Main Account')
  })
})
