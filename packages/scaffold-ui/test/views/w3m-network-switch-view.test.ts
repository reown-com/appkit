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

  it('closes the modal on success when reached from the Networks list, connected, and not using AUTH', async () => {
    vi.useFakeTimers()
    vi.spyOn(ChainController, 'switchActiveNetwork').mockResolvedValue(undefined)

    await fixture<W3mNetworkSwitchView>(html`<w3m-network-switch-view></w3m-network-switch-view>`)
    await vi.advanceTimersByTimeAsync(1100)

    expect(ModalController.close).toHaveBeenCalled()
    expect(RouterController.goBack).not.toHaveBeenCalled()
  })

  it('goes back on success when the previous view is not Networks', async () => {
    vi.useFakeTimers()
    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      data: { network: MOCK_NETWORK as any },
      history: ['Connect', 'SwitchNetwork']
    })
    vi.spyOn(ChainController, 'switchActiveNetwork').mockResolvedValue(undefined)

    await fixture<W3mNetworkSwitchView>(html`<w3m-network-switch-view></w3m-network-switch-view>`)
    await vi.advanceTimersByTimeAsync(1100)

    expect(RouterController.goBack).toHaveBeenCalled()
    expect(ModalController.close).not.toHaveBeenCalled()
  })

  it('goes back on success when using the AUTH connector, even from Networks', async () => {
    vi.useFakeTimers()
    vi.spyOn(ConnectorController, 'getConnectorId').mockReturnValue('AUTH')
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue({} as any)
    vi.spyOn(ChainController, 'switchActiveNetwork').mockResolvedValue(undefined)

    await fixture<W3mNetworkSwitchView>(html`<w3m-network-switch-view></w3m-network-switch-view>`)
    await vi.advanceTimersByTimeAsync(1100)

    expect(RouterController.goBack).toHaveBeenCalled()
    expect(ModalController.close).not.toHaveBeenCalled()
  })

  it('shows the success (checkmark) state before closing/going back', async () => {
    vi.useFakeTimers()
    vi.spyOn(ChainController, 'switchActiveNetwork').mockResolvedValue(undefined)

    const element = await fixture<W3mNetworkSwitchView>(
      html`<w3m-network-switch-view></w3m-network-switch-view>`
    )
    await Promise.resolve()
    await Promise.resolve()

    expect(element.success).toBe(true)
    expect(ModalController.close).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1100)

    expect(ModalController.close).toHaveBeenCalled()
  })
})
