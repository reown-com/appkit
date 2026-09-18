import { fixture } from '@open-wc/testing'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import {
  ChainController,
  ConnectorController,
  ModalController,
  RouterController,
  SIWXUtil
} from '@reown/appkit-controllers'

import { W3mNetworkSwitchView } from '../../src/views/w3m-network-switch-view/index'

// --- Constants ---------------------------------------------------- //
const TEST_CHAIN = 'eip155'

const MOCK_NETWORK = {
  id: 42161,
  chainNamespace: TEST_CHAIN,
  caipNetworkId: 'eip155:42161',
  name: 'Arbitrum'
}

beforeAll(() => {
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
  }))
  Element.prototype.animate = vi.fn() as unknown as typeof Element.prototype.animate
})

describe('W3mNetworkSwitchView', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      data: { network: MOCK_NETWORK as any },
      history: ['Connect', 'Networks', 'SwitchNetwork']
    })

    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeChain: TEST_CHAIN,
      activeCaipAddress: 'eip155:42161:0x123'
    })

    vi.spyOn(ChainController, 'setIsSwitchingNamespace').mockImplementation(() => {})
    vi.spyOn(ConnectorController, 'getConnectorId').mockReturnValue(undefined)
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue(undefined)
    vi.spyOn(SIWXUtil, 'isAuthenticated').mockResolvedValue(true)
    vi.spyOn(RouterController, 'goBack').mockImplementation(() => {})
    vi.spyOn(ModalController, 'close').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('calls switchActiveNetwork with throwOnFailure: true', async () => {
    vi.spyOn(ChainController, 'switchActiveNetwork').mockResolvedValue(undefined)

    await fixture<W3mNetworkSwitchView>(html`<w3m-network-switch-view></w3m-network-switch-view>`)

    expect(ChainController.switchActiveNetwork).toHaveBeenCalledWith(MOCK_NETWORK, {
      throwOnFailure: true
    })
  })

  it('shows the "Switch declined" error state when the switch fails', async () => {
    vi.spyOn(ChainController, 'switchActiveNetwork').mockRejectedValue(
      new Error('Chain is not supported')
    )

    const element = await fixture<W3mNetworkSwitchView>(
      html`<w3m-network-switch-view></w3m-network-switch-view>`
    )

    expect(element.error).toBe(true)
    expect(RouterController.goBack).not.toHaveBeenCalled()
    expect(ModalController.close).not.toHaveBeenCalled()
  })

  it('clears isSwitchingNamespace when a cross-namespace switch fails', async () => {
    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      data: { network: { ...MOCK_NETWORK, chainNamespace: 'solana' } as any },
      history: ['Connect', 'Networks', 'SwitchNetwork']
    })
    vi.spyOn(ChainController, 'switchActiveNetwork').mockRejectedValue(
      new Error('Chain is not supported')
    )

    await fixture<W3mNetworkSwitchView>(html`<w3m-network-switch-view></w3m-network-switch-view>`)

    expect(ChainController.setIsSwitchingNamespace).toHaveBeenCalledWith(true)
    expect(ChainController.setIsSwitchingNamespace).toHaveBeenLastCalledWith(false)
  })

  it('goes back on success, reached from the Networks list', async () => {
    vi.useFakeTimers()
    vi.spyOn(ChainController, 'switchActiveNetwork').mockResolvedValue(undefined)

    await fixture<W3mNetworkSwitchView>(html`<w3m-network-switch-view></w3m-network-switch-view>`)
    await vi.advanceTimersByTimeAsync(1100)

    expect(RouterController.goBack).toHaveBeenCalled()
    expect(ModalController.close).not.toHaveBeenCalled()
  })

  it('does not go back if the view is torn down before the success animation finishes', async () => {
    vi.useFakeTimers()
    vi.spyOn(ChainController, 'switchActiveNetwork').mockResolvedValue(undefined)

    const element = await fixture<W3mNetworkSwitchView>(
      html`<w3m-network-switch-view></w3m-network-switch-view>`
    )
    await Promise.resolve()
    await Promise.resolve()

    expect(element.success).toBe(true)

    // Simulate the router navigating away (e.g. modal closed, a new flow started)
    // before the 1100ms success animation completes.
    element.remove()

    await vi.advanceTimersByTimeAsync(1100)

    expect(RouterController.goBack).not.toHaveBeenCalled()
  })

  it('goes back on success when using the AUTH connector', async () => {
    vi.useFakeTimers()
    vi.spyOn(ConnectorController, 'getConnectorId').mockReturnValue('AUTH')
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue({} as any)
    vi.spyOn(ChainController, 'switchActiveNetwork').mockResolvedValue(undefined)

    await fixture<W3mNetworkSwitchView>(html`<w3m-network-switch-view></w3m-network-switch-view>`)
    await vi.advanceTimersByTimeAsync(1100)

    expect(RouterController.goBack).toHaveBeenCalled()
    expect(ModalController.close).not.toHaveBeenCalled()
  })

  it('shows the success (checkmark) state before going back', async () => {
    vi.useFakeTimers()
    vi.spyOn(ChainController, 'switchActiveNetwork').mockResolvedValue(undefined)

    const element = await fixture<W3mNetworkSwitchView>(
      html`<w3m-network-switch-view></w3m-network-switch-view>`
    )
    await Promise.resolve()
    await Promise.resolve()

    expect(element.success).toBe(true)
    expect(RouterController.goBack).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1100)

    expect(RouterController.goBack).toHaveBeenCalled()
  })
})
