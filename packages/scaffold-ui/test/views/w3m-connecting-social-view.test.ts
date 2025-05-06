import { fixture } from '@open-wc/testing'
import { describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import {
  AccountController,
  type AuthConnector,
  ChainController,
  ConnectionController,
  ConnectorController,
  ModalController,
  OptionsController,
  RouterController
} from '@reown/appkit-controllers'

import { W3mConnectingSocialView } from '../../src/views/w3m-connecting-social-view'

describe('W3mConnectingSocialView - disconnectedCallback', () => {
  it('should call socialWindow.close when component unmounts', async () => {
    const mockSocialWindow = {
      close: vi.fn(),
      closed: false
    } as unknown as Window

    const mockAuthConnector = {
      provider: {
        connectSocial: vi.fn()
      }
    } as unknown as AuthConnector

    vi.spyOn(ConnectionController, 'connectExternal').mockImplementation(() => Promise.resolve())
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue(mockAuthConnector)
    vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
      ...AccountController.state,
      socialWindow: mockSocialWindow
    })
    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      view: 'ConnectingSocial'
    })
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeChain: 'eip155'
    })

    const setSocialWindowSpy = vi.spyOn(AccountController, 'setSocialWindow')

    const element: W3mConnectingSocialView = await fixture(
      html`<w3m-connecting-social-view></w3m-connecting-social-view>`
    )

    element.disconnectedCallback()

    expect(mockSocialWindow.close).toHaveBeenCalled()
    expect(setSocialWindowSpy).toHaveBeenCalledWith(undefined, 'eip155')
  })
})

describe('W3mConnectingSocialView - Embedded Modal Behavior', () => {
  it('should close modal when address is set and enableEmbedded is true', async () => {
    const mockSocialWindow = {
      close: vi.fn(),
      closed: false
    } as unknown as Window

    let subscriptionCallback: ((val: any) => void) | undefined

    vi.spyOn(ModalController, 'close').mockImplementation(() => {})
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValueOnce({
      ...OptionsController.state,
      enableEmbedded: true
    })
    vi.spyOn(AccountController, 'state', 'get').mockReturnValueOnce({
      ...AccountController.state,
      socialWindow: mockSocialWindow
    })
    vi.spyOn(ModalController, 'state', 'get').mockReturnValueOnce({
      ...ModalController.state,
      open: true
    })
    vi.spyOn(AccountController, 'subscribe').mockImplementationOnce(callback => {
      subscriptionCallback = callback
      return () => {}
    })

    await fixture(html`<w3m-connecting-social-view></w3m-connecting-social-view>`)

    if (subscriptionCallback) {
      subscriptionCallback({ address: '0x123' })
    }

    expect(ModalController.close).toHaveBeenCalled()
  })

  it('should not close modal when address is set but enableEmbedded is false', async () => {
    const mockSocialWindow = {
      close: vi.fn(),
      closed: false
    } as unknown as Window

    let subscriptionCallback: ((val: any) => void) | undefined

    vi.spyOn(ModalController, 'close').mockImplementationOnce(() => {})
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValueOnce({
      ...OptionsController.state,
      enableEmbedded: false
    })
    vi.spyOn(AccountController, 'state', 'get').mockReturnValueOnce({
      ...AccountController.state,
      socialWindow: mockSocialWindow
    })
    vi.spyOn(ModalController, 'state', 'get').mockReturnValueOnce({
      ...ModalController.state,
      open: false
    })
    vi.spyOn(AccountController, 'subscribe').mockImplementationOnce(callback => {
      subscriptionCallback = callback
      return () => {}
    })

    await fixture(html`<w3m-connecting-social-view></w3m-connecting-social-view>`)

    if (subscriptionCallback) {
      subscriptionCallback({ address: '0x123' })
    }

    expect(ModalController.close).not.toHaveBeenCalled()
  })
})
