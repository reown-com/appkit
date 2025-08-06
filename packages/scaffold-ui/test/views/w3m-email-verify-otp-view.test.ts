import { fixture } from '@open-wc/testing'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import {
  type AuthConnector,
  ChainController,
  ConnectionController,
  ConnectorController,
  ModalController,
  OptionsController,
  RouterController,
  type SIWXConfig,
  SnackController
} from '@reown/appkit-controllers'

import { W3mEmailVerifyOtpView } from '../../src/views/w3m-email-verify-otp-view/index'

// --- Constants ---------------------------------------------------- //
const TEST_CHAIN = 'eip155'

const MOCK_AUTH_CONNECTOR = {
  id: 'auth-connector',
  name: 'AuthConnector',
  type: 'AUTH',
  chain: TEST_CHAIN,
  provider: {
    connectOtp: vi.fn().mockResolvedValue({})
  }
} as unknown as AuthConnector

const MOCK_CONNECTION = {
  connectorId: 'other-connector',
  accounts: [{ address: '0x123', type: 'eoa' }]
}

beforeAll(() => {
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
  }))
})

describe('W3mEmailVerifyOtpView', () => {
  describe('Connection Logic', () => {
    let element: W3mEmailVerifyOtpView

    beforeEach(async () => {
      vi.clearAllMocks()

      vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue(MOCK_AUTH_CONNECTOR)
      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        ...ChainController.state,
        activeChain: TEST_CHAIN
      })
      vi.spyOn(ConnectionController, 'connectExternal').mockResolvedValue(undefined)
      vi.spyOn(ConnectionController, 'state', 'get').mockReturnValue({
        ...ConnectionController.state,
        connections: new Map([[TEST_CHAIN, []]]),
        recentConnections: new Map()
      })
      vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
        ...RouterController.state,
        data: { email: 'test@example.com' }
      })
      vi.spyOn(RouterController, 'reset').mockImplementation(() => {})
      vi.spyOn(RouterController, 'push').mockImplementation(() => {})
      vi.spyOn(RouterController, 'replace').mockImplementation(() => {})
      vi.spyOn(ModalController, 'close').mockImplementation(() => {})
      vi.spyOn(SnackController, 'showSuccess').mockImplementation(() => {})
      vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
        ...OptionsController.state,
        remoteFeatures: { multiWallet: true },
        siwx: undefined
      })

      element = await fixture(html`<w3m-email-verify-otp-view></w3m-email-verify-otp-view>`)
    })

    it('should navigate to ProfileWallets and show success message when has connections and multiWallet is enabled', async () => {
      vi.spyOn(ConnectionController, 'getConnections').mockReturnValue([MOCK_CONNECTION])
      vi.spyOn(ConnectionController, 'connectExternal').mockResolvedValue(undefined)

      await element.onOtpSubmit('123456')

      expect(RouterController.replace).toHaveBeenCalledWith('ProfileWallets')
      expect(SnackController.showSuccess).toHaveBeenCalledWith('New Wallet Added')
      expect(ModalController.close).not.toHaveBeenCalled()
    })

    it('should not close modal when siwx is enabled and email capture is enabled', async () => {
      vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
        ...OptionsController.state,
        remoteFeatures: { multiWallet: true, emailCapture: true },
        siwx: {} as SIWXConfig
      })

      await element.onOtpSubmit('123456')

      expect(ModalController.close).not.toHaveBeenCalled()
      expect(RouterController.reset).not.toHaveBeenCalled()
      expect(RouterController.push).not.toHaveBeenCalled()
      expect(SnackController.showSuccess).not.toHaveBeenCalled()
    })

    it('should close modal when has no connections and multiWallet is enabled', async () => {
      vi.spyOn(ConnectionController, 'getConnections').mockReturnValue([])
      vi.spyOn(ConnectionController, 'connectExternal').mockResolvedValue(undefined)

      await element.onOtpSubmit('123456')

      expect(ModalController.close).toHaveBeenCalled()
      expect(RouterController.reset).not.toHaveBeenCalled()
      expect(RouterController.push).not.toHaveBeenCalled()
      expect(SnackController.showSuccess).not.toHaveBeenCalled()
    })

    it('should close modal when multiWallet is disabled even with existing connections', async () => {
      vi.spyOn(ConnectionController, 'state', 'get').mockReturnValue({
        ...ConnectionController.state,
        connections: new Map([[TEST_CHAIN, [MOCK_CONNECTION]]])
      })

      vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
        ...OptionsController.state,
        remoteFeatures: { multiWallet: false },
        siwx: undefined
      })

      vi.spyOn(ConnectionController, 'connectExternal').mockResolvedValue(undefined)

      element = await fixture(html`<w3m-email-verify-otp-view></w3m-email-verify-otp-view>`)

      await element.onOtpSubmit('123456')

      expect(ModalController.close).toHaveBeenCalled()
      expect(RouterController.reset).not.toHaveBeenCalled()
      expect(RouterController.push).not.toHaveBeenCalled()
      expect(SnackController.showSuccess).not.toHaveBeenCalled()
    })

    it('should not navigate when siwx is enabled', async () => {
      vi.spyOn(ConnectionController, 'state', 'get').mockReturnValue({
        ...ConnectionController.state,
        connections: new Map([[TEST_CHAIN, [MOCK_CONNECTION]]])
      })

      vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
        ...OptionsController.state,
        remoteFeatures: { multiWallet: true },
        siwx: true
      } as any)

      vi.spyOn(ConnectionController, 'connectExternal').mockResolvedValue(undefined)

      element = await fixture(html`<w3m-email-verify-otp-view></w3m-email-verify-otp-view>`)

      await element.onOtpSubmit('123456')

      expect(RouterController.reset).not.toHaveBeenCalled()
      expect(RouterController.push).not.toHaveBeenCalled()
      expect(SnackController.showSuccess).not.toHaveBeenCalled()
    })
  })
})
