import { fixture } from '@open-wc/testing'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { html } from 'lit'

import type { ChainNamespace } from '@reown/appkit-common'
import {
  AccountController,
  type AccountType,
  type AuthConnector,
  ChainController,
  ConnectionController,
  ConnectorController,
  CoreHelperUtil,
  ModalController,
  SnackController
} from '@reown/appkit-controllers'
import type { W3mFrameProvider } from '@reown/appkit-wallet'

import type { W3mProfileView } from '../../src/views/w3m-profile-view'
import { HelpersUtil } from '../utils/HelpersUtil'

// --- Constants ---------------------------------------------------- //
const TEST_ADDRESS = '0x123...789'
const TEST_PROFILE_NAME = 'Test Profile'
const TEST_PROFILE_IMAGE = 'https://test.com/image.png'
const TEST_CHAIN: ChainNamespace = 'eip155'

const TEST_ACCOUNTS: AccountType[] = [
  { address: TEST_ADDRESS, type: 'eoa', namespace: 'eip155' },
  { address: '0xabc...def', type: 'eoa', namespace: 'eip155' }
]

const MOCK_AUTH_CONNECTOR: Partial<AuthConnector> = {
  id: 'email',
  name: 'email',
  type: 'AUTH',
  chain: 'eip155',
  provider: {
    setPreferredAccount: vi.fn()
  } as unknown as W3mFrameProvider
}

const MOCK_CHAIN_STATE = {
  activeChain: TEST_CHAIN,
  chains: new Map([['eip155', { namespace: 'eip155' }]]),
  activeCaipNetwork: undefined,
  requestedCaipNetworks: [],
  supportsAllNetworks: true,
  isUnsupportedChain: false,
  _client: undefined,
  allowUnsupportedChain: false,
  smartAccountEnabledNetworks: []
} as unknown as typeof ChainController.state

describe('W3mProfileView - Render', () => {
  beforeEach(() => {
    vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
      ...AccountController.state,
      address: TEST_ADDRESS,
      profileName: TEST_PROFILE_NAME,
      profileImage: TEST_PROFILE_IMAGE,
      allAccounts: TEST_ACCOUNTS,
      addressLabels: new Map()
    })
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue(MOCK_CHAIN_STATE)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  test('should render profile information correctly', async () => {
    const element: W3mProfileView = await fixture(html`<w3m-profile-view></w3m-profile-view>`)

    const avatar = HelpersUtil.querySelect(element, 'wui-avatar')
    const addressText = HelpersUtil.getByTestId(element, 'account-settings-address')

    expect(avatar).not.toBeNull()
    expect(avatar?.getAttribute('address')).toBe(TEST_ADDRESS)
    expect(avatar?.getAttribute('imageSrc')).toBe(TEST_PROFILE_IMAGE)
    expect(addressText?.textContent?.trim()).toBe(TEST_PROFILE_NAME)
  })

  test('should render truncated address when no profile name', async () => {
    vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
      ...AccountController.state,
      address: TEST_ADDRESS,
      profileName: undefined,
      allAccounts: TEST_ACCOUNTS,
      addressLabels: new Map()
    })

    const element: W3mProfileView = await fixture(html`<w3m-profile-view></w3m-profile-view>`)
    const addressText = HelpersUtil.getByTestId(element, 'account-settings-address')

    expect(addressText).not.toBeNull()
    expect(addressText?.textContent?.trim()).not.toBe('')
    expect(addressText?.textContent?.trim()).toMatch(/^0x12\.{6}789$/)
  })

  test('should render account settings button', async () => {
    const element: W3mProfileView = await fixture(html`<w3m-profile-view></w3m-profile-view>`)
    const settingsButton = HelpersUtil.getByTestId(element, 'account-settings-button')

    expect(settingsButton).not.toBeNull()
  })

  test('should render all accounts list', async () => {
    const element: W3mProfileView = await fixture(html`<w3m-profile-view></w3m-profile-view>`)
    const accountElements = element.shadowRoot?.querySelectorAll('wui-list-account')

    expect(accountElements?.length).toBe(TEST_ACCOUNTS.length)
  })

  test('should show switch button for non-active accounts', async () => {
    const element: W3mProfileView = await fixture(html`<w3m-profile-view></w3m-profile-view>`)
    const switchButtons = element.shadowRoot?.querySelectorAll('wui-button')

    expect(switchButtons?.length).toBe(TEST_ACCOUNTS.length - 1)
  })
})

describe('W3mProfileView - Functions', () => {
  beforeEach(() => {
    vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
      ...AccountController.state,
      address: TEST_ADDRESS,
      profileName: TEST_PROFILE_NAME,
      allAccounts: TEST_ACCOUNTS,
      addressLabels: new Map()
    })

    vi.spyOn(ChainController, 'state', 'get').mockReturnValue(MOCK_CHAIN_STATE)

    vi.spyOn(AccountController, 'subscribeKey').mockImplementation((_key, callback) => {
      return callback as any
    })
  })

  test('should copy address when copy button is clicked', async () => {
    const copyMock = vi.spyOn(CoreHelperUtil, 'copyToClopboard').mockResolvedValue(undefined)
    const showSuccessMock = vi.spyOn(SnackController, 'showSuccess')

    const element = await fixture<W3mProfileView>(html`<w3m-profile-view></w3m-profile-view>`)

    await element.updateComplete

    await (element as any).onCopyAddress()

    await new Promise(resolve => setTimeout(resolve, 0))

    expect(copyMock).toHaveBeenCalledWith(TEST_ADDRESS)
    expect(showSuccessMock).toHaveBeenCalledWith('Address copied')
  })

  test('should handle account switching', async () => {
    const setPreferredAccountTypeMock = vi.spyOn(ConnectionController, 'setPreferredAccountType')
    const setShouldUpdateToAddressMock = vi.spyOn(AccountController, 'setShouldUpdateToAddress')
    const getAuthConnectorMock = vi.spyOn(ConnectorController, 'getAuthConnector')
    getAuthConnectorMock.mockReturnValue(MOCK_AUTH_CONNECTOR as AuthConnector)

    const element = await fixture<W3mProfileView>(html`<w3m-profile-view></w3m-profile-view>`)

    await element.updateComplete

    const switchAccount: AccountType = {
      address: '0xabc...def',
      type: 'eoa',
      namespace: 'eip155'
    }

    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...MOCK_CHAIN_STATE,
      activeChain: switchAccount.namespace
    })

    await (element as any).onSwitchAccount(switchAccount)

    await new Promise(resolve => setTimeout(resolve, 0))

    expect(setPreferredAccountTypeMock).toHaveBeenCalledWith('eoa')
    expect(setShouldUpdateToAddressMock).toHaveBeenCalledWith(
      switchAccount.address,
      switchAccount.namespace
    )
  })

  test('should close modal when address becomes null', async () => {
    const closeModalMock = vi.spyOn(ModalController, 'close')
    await fixture(html`<w3m-profile-view></w3m-profile-view>`)

    const subscribeKeySpy = vi.mocked(AccountController.subscribeKey)
    const addressCallback = subscribeKeySpy.mock.calls.find(call => call[0] === 'address')?.[1]
    expect(addressCallback).toBeDefined()

    addressCallback?.(undefined)
    expect(closeModalMock).toHaveBeenCalled()
  })

  test('should throw error when no address is provided', async () => {
    vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
      ...AccountController.state,
      address: undefined
    })

    await expect(fixture(html`<w3m-profile-view></w3m-profile-view>`)).rejects.toThrow(
      'w3m-profile-view: No account provided'
    )
  })
})
