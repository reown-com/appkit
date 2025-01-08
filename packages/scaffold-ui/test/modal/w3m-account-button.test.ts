import { expect, html, fixture } from '@open-wc/testing'

import {
  AccountController,
  ChainController,
  OptionsController,
  ModalController,
  RouterController
} from '@reown/appkit-core'
import { W3mAccountButton } from '../../src/modal/w3m-account-button'
import { describe, it, afterEach, vi } from 'vitest'
import type { CaipNetwork } from '@reown/appkit-common'

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
    vi.clearAllMocks()
  })

  it('should set isUnsupportedChain to false when allowUnsupportedChain is true', async () => {
    vi.spyOn(ChainController.state, 'activeChain', 'get').mockReturnValue('eip155')
    vi.spyOn(ChainController, 'checkIfSupportedNetwork').mockReturnValue(true)
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      allowUnsupportedChain: true
    })

    vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
      ...AccountController.state,
      profileName: 'test'
    })

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
      vi.spyOn(ChainController.state, 'activeCaipAddress', 'get').mockReturnValue(mockCaipAddress)

      vi.spyOn(ModalController, 'open')

      const button = await fixture(html`<w3m-account-button></w3m-account-button>`)
      const accountButton = button.shadowRoot?.querySelector('wui-account-button')

      await accountButton?.click()

      expect(RouterController.state.view).to.equal('Account')
    })

    it('should open modal normally when chain is not supported and allowUnsupportedChain is true', async () => {
      vi.spyOn(ChainController.state, 'activeChain', 'get').mockReturnValue('eip155')
      vi.spyOn(ChainController, 'checkIfSupportedNetwork').mockReturnValue(false)
      vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
        ...OptionsController.state,
        allowUnsupportedChain: true
      })
      vi.spyOn(ChainController.state, 'activeCaipAddress', 'get').mockReturnValue(mockCaipAddress)

      vi.spyOn(ModalController, 'open')

      const button = await fixture(html`<w3m-account-button></w3m-account-button>`)
      const accountButton = button.shadowRoot?.querySelector('wui-account-button')

      await accountButton?.click()

      expect(RouterController.state.view).to.equal('Account')
    })

    it('should open modal in UnsupportedChain view when chain is not supported and allowUnsupportedChain is false', async () => {
      vi.spyOn(ChainController.state, 'activeChain', 'get').mockReturnValue('eip155')
      vi.spyOn(ChainController, 'checkIfSupportedNetwork').mockReturnValue(false)
      vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
        ...OptionsController.state,
        allowUnsupportedChain: false
      })
      vi.spyOn(ChainController.state, 'activeCaipAddress', 'get').mockReturnValue(mockCaipAddress)

      vi.spyOn(ModalController, 'open')

      const button = await fixture(html`<w3m-account-button></w3m-account-button>`)
      const accountButton = button.shadowRoot?.querySelector('wui-account-button')

      await accountButton?.click()

      expect(RouterController.state.view).to.equal('UnsupportedChain')
    })
  })
})
