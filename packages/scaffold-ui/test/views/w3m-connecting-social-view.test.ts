import { fixture } from '@open-wc/testing'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import type { ChainNamespace, Connection } from '@reown/appkit-common'
import {
  type AccountState,
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

    vi.spyOn(ConnectionController, 'connectExternal').mockImplementation(() =>
      Promise.resolve(undefined)
    )
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue(mockAuthConnector)
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      ...ChainController.getAccountData(),
      socialWindow: mockSocialWindow
    } as unknown as AccountState)
    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      view: 'ConnectingSocial'
    })
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeChain: 'eip155'
    })

    const setSocialWindowSpy = vi.spyOn(ChainController, 'setAccountProp')

    const element: W3mConnectingSocialView = await fixture(
      html`<w3m-connecting-social-view></w3m-connecting-social-view>`
    )

    element.disconnectedCallback()

    expect(mockSocialWindow.close).toHaveBeenCalled()
    expect(setSocialWindowSpy).toHaveBeenCalledWith('socialWindow', undefined, 'eip155')
  })
})

describe('W3mConnectingSocialView - Embedded Modal Behavior', () => {
  beforeAll(() => {
    ConnectionController.state.connections = ConnectionController.state.connections
  })
  it('closes the modal if no connections exist, an address is set and embedded mode is enabled', async () => {
    const mockSocialWindow = {
      close: vi.fn(),
      closed: false
    } as unknown as Window

    let subscriptionCallback: ((val: any) => void) | undefined

    vi.spyOn(ModalController, 'close').mockImplementation(() => {})
    vi.spyOn(RouterController, 'reset').mockImplementation(() => {})
    vi.spyOn(RouterController, 'push').mockImplementation(() => {})
    vi.spyOn(RouterController, 'replace').mockImplementation(() => {})
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValueOnce({
      ...OptionsController.state,
      enableEmbedded: true
    })
    vi.spyOn(ChainController, 'getAccountData').mockReturnValueOnce({
      ...ChainController.getAccountData(),
      socialWindow: mockSocialWindow
    } as unknown as AccountState)
    vi.spyOn(ModalController, 'state', 'get').mockReturnValueOnce({
      ...ModalController.state,
      open: true
    })
    vi.spyOn(ChainController, 'subscribe').mockImplementationOnce(() => {
      return () => {}
    })
    vi.spyOn(ChainController, 'subscribeChainProp').mockImplementationOnce(
      (_property, callback) => {
        subscriptionCallback = callback
        return () => {}
      }
    )

    await fixture(html`<w3m-connecting-social-view></w3m-connecting-social-view>`)

    if (subscriptionCallback) {
      subscriptionCallback({ address: '0x123' })
    }

    expect(ModalController.close).toHaveBeenCalled()
    expect(RouterController.reset).not.toHaveBeenCalled()
    expect(RouterController.push).not.toHaveBeenCalled()
  })

  it('redirects to the profile wallets page if connections exist, address is set and multiWallet is enabled', async () => {
    const mockSocialWindow = {
      close: vi.fn(),
      closed: false
    } as unknown as Window
    const mockConnections = new Map<ChainNamespace, Connection[]>([
      [
        'eip155',
        [
          {
            connectorId: 'auth'
          }
        ] as Connection[]
      ]
    ])
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValueOnce({
      ...OptionsController.state,
      remoteFeatures: { multiWallet: true }
    })

    let subscriptionCallback: ((val: any) => void) | undefined

    ConnectionController.state.connections = mockConnections
    vi.spyOn(RouterController, 'reset').mockImplementation(() => {})
    vi.spyOn(RouterController, 'push').mockImplementation(() => {})
    vi.spyOn(ModalController, 'close').mockImplementation(() => {})
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValueOnce({
      ...OptionsController.state,
      enableEmbedded: true
    })
    vi.spyOn(ChainController, 'getAccountData').mockReturnValueOnce({
      ...ChainController.getAccountData(),
      socialWindow: mockSocialWindow
    } as unknown as AccountState)
    vi.spyOn(ModalController, 'state', 'get').mockReturnValueOnce({
      ...ModalController.state,
      open: true
    })
    vi.spyOn(ChainController, 'subscribe').mockImplementationOnce(() => {
      return () => {}
    })
    vi.spyOn(ChainController, 'subscribeChainProp').mockImplementationOnce(
      (_property, callback) => {
        subscriptionCallback = callback
        return () => {}
      }
    )

    await fixture(html`<w3m-connecting-social-view></w3m-connecting-social-view>`)

    if (subscriptionCallback) {
      subscriptionCallback({ address: '0x123' })
    }

    expect(ModalController.close).not.toHaveBeenCalled()
    expect(RouterController.replace).toHaveBeenCalledWith('ProfileWallets')
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
    vi.spyOn(ChainController, 'getAccountData').mockReturnValueOnce({
      ...ChainController.getAccountData(),
      socialWindow: mockSocialWindow
    } as unknown as AccountState)
    vi.spyOn(ModalController, 'state', 'get').mockReturnValueOnce({
      ...ModalController.state,
      open: false
    })
    vi.spyOn(ChainController, 'subscribe').mockImplementationOnce(callback => {
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
