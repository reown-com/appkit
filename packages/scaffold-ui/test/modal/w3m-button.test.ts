import { fixture, expect, html } from '@open-wc/testing'
import { vi, describe, it, beforeEach, afterEach } from 'vitest'
import { W3mButton } from '../../src/modal/w3m-button'
import {
  ChainController,
  ModalController,
  type ChainControllerState,
  type ModalControllerState
} from '@reown/appkit-core'
import { HelpersUtil } from '../utils/HelpersUtil'
import type { W3mAccountButton } from '../../exports'

describe('W3mButton', () => {
  beforeEach(() => {
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      activeCaipAddress: null
    } as unknown as ChainControllerState)

    vi.spyOn(ModalController, 'state', 'get').mockReturnValue({
      loading: false
    } as ModalControllerState)

    vi.spyOn(ChainController, 'subscribeKey').mockImplementation(() => () => {})
    vi.spyOn(ModalController, 'subscribeKey').mockImplementation(() => () => {})
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders connect button when not connected', async () => {
    const element: W3mButton = await fixture(html`<appkit-button></appkit-button>`)
    const connectButton = HelpersUtil.querySelect(element, 'appkit-connect-button')
    const accountButton = HelpersUtil.querySelect(element, 'appkit-account-button')

    expect(connectButton).to.exist
    expect(accountButton).to.not.exist
  })

  it('renders account button when connected', async () => {
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      activeCaipAddress: 'eip155:1:0x123'
    } as unknown as ChainControllerState)

    const element: W3mButton = await fixture(html`<appkit-button></appkit-button>`)
    const accountButton = HelpersUtil.querySelect(element, 'appkit-account-button')
    const connectButton = HelpersUtil.querySelect(element, 'appkit-connect-button')

    expect(accountButton).to.exist
    expect(connectButton).to.not.exist
  })

  it('renders connect button when loading', async () => {
    vi.spyOn(ModalController, 'state', 'get').mockReturnValue({
      loading: true
    } as ModalControllerState)

    const element: W3mButton = await fixture(html`<appkit-button></appkit-button>`)
    const connectButton = HelpersUtil.querySelect(element, 'appkit-connect-button')

    expect(connectButton).to.exist
  })

  it('passes properties to account button correctly', async () => {
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      activeCaipAddress: 'eip155:1:0x123'
    } as unknown as ChainControllerState)

    const element: W3mButton = await fixture(
      html`<appkit-button
        .disabled=${true}
        balance="1 ETH"
        .charsStart=${2}
        .charsEnd=${4}
      ></appkit-button>`
    )

    const accountButton = HelpersUtil.querySelect(
      element,
      'appkit-account-button'
    ) as W3mAccountButton | null
    expect(accountButton?.getAttribute('balance')).to.equal('1 ETH')
    expect(accountButton?.charsStart).to.equal(2)
    expect(accountButton?.charsEnd).to.equal(4)
    expect(accountButton?.disabled).to.equal(true)
  })

  it('passes properties to connect button correctly', async () => {
    const element: W3mButton = await fixture(
      html`<appkit-button size="md" label="Connect" loadingLabel="Connecting..."></appkit-button>`
    )

    const connectButton = HelpersUtil.querySelect(element, 'appkit-connect-button')
    expect(connectButton?.getAttribute('size')).to.equal('md')
    expect(connectButton?.getAttribute('label')).to.equal('Connect')
    expect(connectButton?.getAttribute('loadingLabel')).to.equal('Connecting...')
  })
})
