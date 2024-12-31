import { describe, it, expect, vi } from 'vitest'
import { fixture } from '@open-wc/testing'
import { html } from 'lit'
import { W3mConnectingSocialView } from '../../src/views/w3m-connecting-social-view'
import {
  ConnectionController,
  ConnectorController,
  type AuthConnector,
  RouterController,
  AccountController,
  ChainController
} from '@reown/appkit-core'

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