import { fixture } from '@open-wc/testing'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import type { CaipNetwork, ChainNamespace } from '@reown/appkit-common'
import {
  ChainController,
  ConnectionController,
  ConnectorController,
  OptionsController,
  RouterController,
  SnackController
} from '@reown/appkit-controllers'

import { W3mUnsupportedChainView } from '../../src/views/w3m-unsupported-chain-view/index'

// --- Constants ---------------------------------------------------- //
const TEST_CHAIN = 'eip155'
const TEST_CONNECTOR_ID = 'test-connector'

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

describe('W3mUnsupportedChainView', () => {
  describe('Disconnect Logic', () => {
    let element: W3mUnsupportedChainView

    beforeEach(async () => {
      vi.clearAllMocks()

      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        ...ChainController.state,
        activeChain: TEST_CHAIN
      })

      vi.spyOn(ConnectionController, 'disconnect').mockResolvedValue(undefined)
      vi.spyOn(ConnectionController, 'state', 'get').mockReturnValue({
        ...ConnectionController.state,
        connections: new Map([[TEST_CHAIN, []]]),
        recentConnections: new Map()
      })

      vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
        ...ConnectorController.state,
        activeConnectorIds: { [TEST_CHAIN]: TEST_CONNECTOR_ID } as Record<
          ChainNamespace,
          string | undefined
        >
      })

      vi.spyOn(RouterController, 'reset').mockImplementation(() => {})
      vi.spyOn(RouterController, 'push').mockImplementation(() => {})
      vi.spyOn(RouterController, 'replace').mockImplementation(() => {})

      vi.spyOn(SnackController, 'showSuccess').mockImplementation(() => {})
      vi.spyOn(SnackController, 'showError').mockImplementation(() => {})

      vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
        ...OptionsController.state,
        remoteFeatures: { multiWallet: true }
      })

      element = await fixture(html`<w3m-unsupported-chain-view></w3m-unsupported-chain-view>`)
    })

    it('should navigate to ProfileWallets and show success message when has connections and multiWallet is enabled', async () => {
      vi.spyOn(ConnectionController, 'getConnections').mockReturnValue([MOCK_CONNECTION])
      vi.spyOn(ConnectionController, 'disconnect').mockResolvedValue(undefined)

      await element['onDisconnect']()

      expect(ConnectionController.disconnect).toHaveBeenCalledWith({
        id: TEST_CONNECTOR_ID,
        namespace: TEST_CHAIN
      })
      expect(RouterController.push).toHaveBeenCalledWith('ProfileWallets')
      expect(SnackController.showSuccess).toHaveBeenCalledWith('Wallet deleted')
    })

    it('should only disconnect when has no connections and multiWallet is enabled', async () => {
      vi.spyOn(ConnectionController, 'getConnections').mockReturnValue([])
      vi.spyOn(ConnectionController, 'disconnect').mockResolvedValue(undefined)

      await element['onDisconnect']()

      expect(ConnectionController.disconnect).toHaveBeenCalledWith({
        id: TEST_CONNECTOR_ID,
        namespace: TEST_CHAIN
      })
      expect(RouterController.reset).not.toHaveBeenCalled()
      expect(RouterController.push).not.toHaveBeenCalled()
      expect(SnackController.showSuccess).not.toHaveBeenCalled()
    })

    it('should only disconnect when multiWallet is disabled even with existing connections', async () => {
      vi.spyOn(ConnectionController, 'state', 'get').mockReturnValue({
        ...ConnectionController.state,
        connections: new Map([[TEST_CHAIN, [MOCK_CONNECTION]]])
      })

      vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
        ...OptionsController.state,
        remoteFeatures: { multiWallet: false }
      })

      vi.spyOn(ConnectionController, 'disconnect').mockResolvedValue(undefined)

      element = await fixture(html`<w3m-unsupported-chain-view></w3m-unsupported-chain-view>`)

      await element['onDisconnect']()

      expect(ConnectionController.disconnect).toHaveBeenCalledWith({})
      expect(RouterController.reset).not.toHaveBeenCalled()
      expect(RouterController.push).not.toHaveBeenCalled()
      expect(SnackController.showSuccess).not.toHaveBeenCalled()
    })

    it('should show error message when disconnect fails', async () => {
      const error = new Error('Disconnect failed')
      vi.spyOn(ConnectionController, 'disconnect').mockRejectedValue(error)

      await element['onDisconnect']()

      expect(SnackController.showError).toHaveBeenCalledWith('Failed to disconnect')
      expect(RouterController.reset).not.toHaveBeenCalled()
      expect(RouterController.push).not.toHaveBeenCalled()
      expect(SnackController.showSuccess).not.toHaveBeenCalled()
    })
  })

  describe('Switch Network Logic', () => {
    let element: W3mUnsupportedChainView

    const MOCK_NETWORK = {
      id: 1,
      chainNamespace: TEST_CHAIN,
      caipNetworkId: 'eip155:1',
      name: 'Ethereum'
    } as unknown as CaipNetwork

    beforeEach(async () => {
      vi.clearAllMocks()

      vi.spyOn(ChainController, 'getActiveCaipAddress').mockReturnValue('eip155:1:0x123')
      vi.spyOn(ChainController, 'getAllApprovedCaipNetworkIds').mockReturnValue(['eip155:1'])
      vi.spyOn(ChainController, 'getNetworkProp').mockReturnValue(false)
      vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
        ...RouterController.state,
        data: {}
      })
      vi.spyOn(RouterController, 'push').mockImplementation(() => {})
      vi.spyOn(SnackController, 'showError').mockImplementation(() => {})

      element = await fixture(html`<w3m-unsupported-chain-view></w3m-unsupported-chain-view>`)
    })

    it('shows an error snackbar when switching an already-approved network fails', async () => {
      vi.spyOn(ChainController, 'switchActiveNetwork').mockRejectedValueOnce(
        new Error('Chain is not supported')
      )

      await element['onSwitchNetwork'](MOCK_NETWORK)

      expect(ChainController.switchActiveNetwork).toHaveBeenCalledWith(MOCK_NETWORK, {
        throwOnFailure: true
      })
      expect(SnackController.showError).toHaveBeenCalledWith('Failed to switch network')
    })

    it('does not show an error snackbar when switching succeeds', async () => {
      vi.spyOn(ChainController, 'switchActiveNetwork').mockResolvedValueOnce(undefined)

      await element['onSwitchNetwork'](MOCK_NETWORK)

      expect(SnackController.showError).not.toHaveBeenCalled()
    })
  })
})
