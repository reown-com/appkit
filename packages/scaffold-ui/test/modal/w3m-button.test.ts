import { fixture, html } from '@open-wc/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  ChainController,
  type ChainControllerState,
  ModalController,
  type ModalControllerState
} from '@reown/appkit-controllers'

import type { W3mAccountButton } from '../../exports'
import { W3mButton } from '../../src/modal/w3m-button'
import { HelpersUtil } from '../utils/HelpersUtil'

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
    expect(accountButton?.getAttribute('balance')).toBe('1 ETH')
    expect(accountButton?.charsStart).toBe(2)
    expect(accountButton?.charsEnd).toBe(4)
    expect(accountButton?.disabled).toBe(true)
  })

  it('passes properties to connect button correctly', async () => {
    const element: W3mButton = await fixture(
      html`<appkit-button size="md" label="Connect" loadingLabel="Connecting..."></appkit-button>`
    )

    const connectButton = HelpersUtil.querySelect(element, 'appkit-connect-button')
    expect(connectButton?.getAttribute('size')).toBe('md')
    expect(connectButton?.getAttribute('label')).toBe('Connect')
    expect(connectButton?.getAttribute('loadingLabel')).toBe('Connecting...')
  })

  it('unsubscribe from state changes on disconnect', async () => {
    const mockUnsubscribeChain = vi.fn()
    const mockUnsubscribeModal = vi.fn()
    vi.spyOn(ChainController, 'subscribeKey').mockReturnValue(mockUnsubscribeChain)
    vi.spyOn(ModalController, 'subscribeKey').mockReturnValue(mockUnsubscribeModal)
    const element: W3mButton = await fixture(html`<appkit-button></appkit-button>`)
    element.disconnectedCallback()
    expect(mockUnsubscribeChain).toHaveBeenCalled()
    expect(mockUnsubscribeModal).toHaveBeenCalled()
  })
})
