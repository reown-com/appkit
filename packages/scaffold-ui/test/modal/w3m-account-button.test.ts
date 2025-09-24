import { elementUpdated, fixture, html, waitUntil } from '@open-wc/testing'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { type CaipNetwork, type ChainNamespace, ConstantsUtil } from '@reown/appkit-common'
import {
  type AccountState,
  ChainController,
  CoreHelperUtil,
  ModalController,
  OptionsController,
  RouterController
} from '@reown/appkit-controllers'
import type { WuiAccountButton } from '@reown/appkit-ui/wui-account-button'

import { W3mAccountButton } from '../../src/modal/w3m-account-button'
import { HelpersUtil } from '../utils/HelpersUtil'

// -- Constants -------------------------------------------------- //
const ACCOUNT_BUTTON_TEST_ID = 'account-button'

const mockCaipNetwork: CaipNetwork = {
  chainNamespace: 'eip155',
  caipNetworkId: 'eip155:1',
  id: 1,
  name: '',
  nativeCurrency: { name: '', symbol: '', decimals: 0 },
  rpcUrls: { default: { http: [], webSocket: undefined } }
}

const mockCaipAddress = 'eip155:1:0x0000000000000000000000000000000000000000'
describe('W3mAccountButton', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should set isUnsupportedChain to false when allowUnsupportedChain is true', async () => {
    vi.spyOn(ChainController.state, 'activeChain', 'get').mockReturnValue('eip155')
    vi.spyOn(ChainController, 'checkIfSupportedNetwork').mockReturnValue(true)
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      allowUnsupportedChain: true
    })

    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      ...ChainController.getAccountData(),
      profileName: 'test'
    } as unknown as AccountState)

    const button = (await fixture(
      html`<w3m-account-button></w3m-account-button>`
    )) as W3mAccountButton

    const accountButton = button.shadowRoot?.querySelector('wui-account-button')
    expect(accountButton).to.exist

    expect(accountButton?.isUnsupportedChain).to.equal(false)
  })

  it('should set isUnsupportedChain to true when allowUnsupportedChain is false and chain is unsupported', async () => {
    vi.spyOn(ChainController.state, 'activeChain', 'get').mockReturnValue('eip155')
    vi.spyOn(ChainController.state, 'activeCaipNetwork', 'get').mockReturnValue(mockCaipNetwork)
    vi.spyOn(ChainController, 'checkIfSupportedNetwork').mockReturnValue(false)
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      allowUnsupportedChain: false
    })

    const button = (await fixture(
      html`<w3m-account-button></w3m-account-button>`
    )) as W3mAccountButton

    const accountButton = button.shadowRoot?.querySelector('wui-account-button')
    expect(accountButton).to.exist
    expect(accountButton?.isUnsupportedChain).to.equal(true)
  })

  describe('onClick behavior', () => {
    it('should open modal normally when chain is supported', async () => {
      vi.spyOn(ChainController.state, 'activeChain', 'get').mockReturnValue('eip155')
      vi.spyOn(ChainController, 'checkIfSupportedNetwork').mockReturnValue(true)
      vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
        ...ChainController.getAccountData(),
        caipAddress: mockCaipAddress
      } as unknown as AccountState)

      vi.spyOn(ModalController, 'open')

      const button = await fixture(html`<w3m-account-button></w3m-account-button>`)
      const accountButton = button.shadowRoot?.querySelector('wui-account-button')

      await accountButton?.click()

      await waitUntil(() => RouterController.state.view === 'Account')
    })

    it('should open modal normally when chain is not supported and allowUnsupportedChain is true', async () => {
      vi.spyOn(ChainController.state, 'activeChain', 'get').mockReturnValue('eip155')
      vi.spyOn(ChainController, 'checkIfSupportedNetwork').mockReturnValue(false)
      vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
        ...OptionsController.state,
        allowUnsupportedChain: true
      })
      vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
        ...ChainController.getAccountData(),
        caipAddress: mockCaipAddress
      } as unknown as AccountState)

      vi.spyOn(ModalController, 'open')

      const button = await fixture(html`<w3m-account-button></w3m-account-button>`)
      const accountButton = button.shadowRoot?.querySelector('wui-account-button')

      await accountButton?.click()

      expect(RouterController.state.view).to.equal('Account')
    })

    it('should open modal in UnsupportedChain view when chain is not supported and allowUnsupportedChain is false', async () => {
      vi.spyOn(ChainController.state, 'activeChain', 'get').mockReturnValue('eip155')
      vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
        ...OptionsController.state,
        allowUnsupportedChain: false
      })
      vi.spyOn(ChainController, 'getAccountData').mockReturnValueOnce({
        ...ChainController.getAccountData(),
        caipAddress: mockCaipAddress
      } as unknown as AccountState)
      vi.spyOn(ChainController, 'checkIfSupportedNetwork').mockReturnValueOnce(false)

      vi.spyOn(ModalController, 'open')

      const button = await fixture(html`<w3m-account-button></w3m-account-button>`)
      const accountButton = button.shadowRoot?.querySelector('wui-account-button')

      await accountButton?.click()

      await waitUntil(() => RouterController.state.view === 'UnsupportedChain')
    })

    it('should show loading state if balance value is not a string', async () => {
      vi.spyOn(ChainController.state, 'activeChain', 'get').mockReturnValue('eip155')
      vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
        ...ChainController.getAccountData(),
        balance: undefined
      } as unknown as AccountState)

      const button = await fixture(html`<w3m-account-button></w3m-account-button>`)

      const accountButton = HelpersUtil.getByTestId(
        button,
        ACCOUNT_BUTTON_TEST_ID
      ) as WuiAccountButton

      expect(accountButton.loading).to.equal(true)
    })

    it('should not show loading state if balance value is a string', async () => {
      vi.spyOn(ChainController.state, 'activeChain', 'get').mockReturnValue('eip155')
      vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
        ...ChainController.getAccountData(),
        balance: '0.00'
      } as unknown as AccountState)

      const button = await fixture(html`<w3m-account-button></w3m-account-button>`)

      const accountButton = HelpersUtil.getByTestId(
        button,
        ACCOUNT_BUTTON_TEST_ID
      ) as WuiAccountButton

      expect(accountButton.loading).to.equal(false)
    })

    it('should open modal with namespace when provided', async () => {
      const namespace: ChainNamespace = 'eip155'
      vi.spyOn(ChainController.state, 'activeChain', 'get').mockReturnValue(namespace)
      vi.spyOn(ChainController, 'checkIfSupportedNetwork').mockReturnValue(true)
      vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
        ...ChainController.getAccountData(),
        caipAddress: mockCaipAddress
      } as unknown as AccountState)

      vi.spyOn(ModalController, 'open')

      const button = await fixture(
        html`<w3m-account-button namespace=${namespace}></w3m-account-button>`
      )

      await button.shadowRoot?.querySelector('wui-account-button')?.click()

      expect(ModalController.open).toHaveBeenCalled()
      expect(ModalController.open).toHaveBeenCalledWith({ namespace })
    })

    it('should handle initial state with namespace option', async () => {
      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        ...ChainController.state,
        activeChain: 'eip155',
        chains: new Map([
          [
            ConstantsUtil.CHAIN.SOLANA,
            {
              accountState: {
                ...ChainController.getAccountData(),
                caipAddress: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:FyTsuBMn',
                balance: '2.00',
                balanceSymbol: 'SOL',
                profileName: 'test',
                profileImage: 'https://example.com/image.png',
                currentTab: 0,
                addressLabels: new Map()
              }
            }
          ]
        ])
      })

      const element = (await fixture(
        html`<w3m-account-button namespace="solana"></w3m-account-button>`
      )) as W3mAccountButton
      const wuiAccountButton = HelpersUtil.getByTestId(element, 'account-button-solana')
      const { formattedText } = CoreHelperUtil.parseBalance('2.00', 'SOL')

      await elementUpdated(element)
      await element.updateComplete

      expect(wuiAccountButton?.getAttribute('address')).toEqual('FyTsuBMn')
      expect(wuiAccountButton?.getAttribute('balance')).toEqual(formattedText)
      expect(wuiAccountButton?.getAttribute('profileName')).toEqual('test')
      expect(wuiAccountButton?.getAttribute('avatarSrc')).toEqual('https://example.com/image.png')
    })
  })
})
