import { fixture } from '@open-wc/testing'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import {
  type AccountState,
  ChainController,
  ConnectionController,
  ConnectorController,
  ModalController,
  OptionsController,
  RouterController,
  SnackController
} from '@reown/appkit-controllers'

import { W3mConnectingFarcasterView } from '../../src/views/w3m-connecting-farcaster-view/index'

// --- Constants ---------------------------------------------------- //
const TEST_CHAIN = 'eip155'

const MOCK_AUTH_CONNECTOR = {
  id: 'auth-connector',
  name: 'AuthConnector',
  type: 'AUTH',
  chain: TEST_CHAIN,
  provider: {
    connectFarcaster: vi.fn().mockResolvedValue({})
  }
} as const

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

describe('W3mConnectingFarcasterView', () => {
  describe('Connection Logic', () => {
    let element: W3mConnectingFarcasterView

    beforeEach(async () => {
      vi.clearAllMocks()

      vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue(MOCK_AUTH_CONNECTOR as any)
      vi.spyOn(ConnectorController, 'subscribeKey').mockImplementation(() => () => {})
      vi.spyOn(ConnectionController, 'connectExternal').mockResolvedValue(undefined)
      vi.spyOn(ConnectionController, 'subscribeKey').mockImplementation(() => () => {})
      vi.spyOn(ConnectionController, 'state', 'get').mockReturnValue({
        ...ConnectionController.state,
        connections: new Map([[TEST_CHAIN, []]]),
        recentConnections: new Map()
      })

      vi.spyOn(RouterController, 'reset').mockImplementation(() => {})
      vi.spyOn(RouterController, 'push').mockImplementation(() => {})
      vi.spyOn(RouterController, 'replace').mockImplementation(() => {})
      vi.spyOn(RouterController, 'goBack').mockImplementation(() => {})

      vi.spyOn(ModalController, 'close').mockImplementation(() => {})

      vi.spyOn(SnackController, 'showSuccess').mockImplementation(() => {})
      vi.spyOn(SnackController, 'showError').mockImplementation(() => {})

      vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
        ...OptionsController.state,
        remoteFeatures: { multiWallet: true }
      })
      vi.spyOn(OptionsController, 'subscribeKey').mockImplementation(() => () => {})

      vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
        ...ChainController.getAccountData(),
        socialProvider: 'farcaster',
        farcasterUrl: '...'
      } as unknown as AccountState)
      vi.spyOn(ChainController, 'subscribeKey').mockImplementation(() => () => {})

      element = await fixture(html`<w3m-connecting-farcaster-view></w3m-connecting-farcaster-view>`)
    })

    it('should navigate to ProfileWallets and show success message when hasConnections is true and multiWallet is true', async () => {
      vi.spyOn(ConnectionController, 'getConnections').mockReturnValue([MOCK_CONNECTION])
      vi.spyOn(ConnectionController, 'connectExternal').mockResolvedValue(undefined)

      await element['connectFarcaster']()

      expect(RouterController.replace).toHaveBeenCalledWith('ProfileWallets')
      expect(SnackController.showSuccess).toHaveBeenCalledWith('New Wallet Added')
      expect(ModalController.close).not.toHaveBeenCalled()
    })

    it('should close modal when hasConnections is false or multiWallet is false', async () => {
      vi.spyOn(ConnectionController, 'getConnections').mockReturnValue([])
      vi.spyOn(ConnectionController, 'connectExternal').mockResolvedValue(undefined)

      await element['connectFarcaster']()

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
        remoteFeatures: { multiWallet: false }
      })

      vi.spyOn(ConnectionController, 'connectExternal').mockResolvedValue(undefined)

      element = await fixture(html`<w3m-connecting-farcaster-view></w3m-connecting-farcaster-view>`)

      await element['connectFarcaster']()

      expect(ModalController.close).toHaveBeenCalled()
      expect(RouterController.reset).not.toHaveBeenCalled()
      expect(RouterController.push).not.toHaveBeenCalled()
      expect(SnackController.showSuccess).not.toHaveBeenCalled()
    })

    it('should navigate back and show error when connection fails', async () => {
      const error = new Error('Connection failed')
      vi.spyOn(ConnectionController, 'connectExternal').mockRejectedValue(error)

      await element['connectFarcaster']()

      expect(RouterController.goBack).toHaveBeenCalled()
      expect(SnackController.showError).toHaveBeenCalledWith(error)
      expect(RouterController.reset).not.toHaveBeenCalled()
      expect(RouterController.push).not.toHaveBeenCalled()
      expect(ModalController.close).not.toHaveBeenCalled()
    })
  })
})
