import { W3mNetworkSwitchView } from '../../src/views/w3m-network-switch-view'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { elementUpdated, fixture } from '@open-wc/testing'
import { html } from 'lit'
import { HelpersUtil } from '../utils/HelpersUtil'
import {
  AssetUtil,
  ChainController,
  ConnectorController,
  RouterController,
  StorageUtil,
  type ChainControllerState,
  type RouterControllerState
} from '@reown/appkit-core'
import type { CaipNetwork } from '@reown/appkit-common'
import type { W3mFrameProvider } from '@reown/appkit-wallet'

describe('W3mNetworkSwitchView', () => {
  const mockNetwork = {
    id: '1',
    name: 'Ethereum',
    chainNamespace: 'eip155',
    caipNetworkId: 'eip155:1'
  } as unknown as CaipNetwork

  const mockAuthConnector = {
    id: 'ID_AUTH',
    chain: 'eip155' as const,
    type: 'AUTH' as const,
    provider: {
      setPreferredAccountType: () => {},
      getEmail: () => 'test@test.com'
    } as unknown as W3mFrameProvider
  }

  beforeEach(() => {
    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      data: { network: mockNetwork }
    } as RouterControllerState)
    vi.spyOn(AssetUtil, 'getNetworkImage').mockReturnValue('network.png')
    vi.spyOn(ChainController, 'switchActiveNetwork').mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('throws error when no network provided', async () => {
    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      data: {}
    } as RouterControllerState)
    await expect(
      fixture(html`<w3m-network-switch-view></w3m-network-switch-view>`)
    ).rejects.toThrow()
  })

  it('renders initial state with loading indicator', async () => {
    const element: W3mNetworkSwitchView = await fixture(
      html`<w3m-network-switch-view></w3m-network-switch-view>`
    )

    expect(HelpersUtil.querySelect(element, 'wui-network-image')).toBeTruthy()
    expect(HelpersUtil.querySelect(element, 'wui-loading-hexagon')).toBeTruthy()
  })

  it('shows auth connector specific content when connected', async () => {
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      activeChain: mockNetwork.chainNamespace
    } as ChainControllerState)
    vi.spyOn(StorageUtil, 'getConnectedConnector').mockReturnValue('AUTH')
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue(mockAuthConnector)

    const element: W3mNetworkSwitchView = await fixture(
      html`<w3m-network-switch-view></w3m-network-switch-view>`
    )

    const label = HelpersUtil.querySelect(element, '[data-testid="switching-network-label"]')
    expect(HelpersUtil.getTextContent(label)).toContain('Switching to Ethereum network')
  })

  it('shows standard wallet content', async () => {
    vi.spyOn(StorageUtil, 'getConnectedConnector').mockReturnValue('INJECTED')
    const element: W3mNetworkSwitchView = await fixture(
      html`<w3m-network-switch-view></w3m-network-switch-view>`
    )
    const label = HelpersUtil.querySelect(element, '[data-testid="switching-network-label"]')
    expect(HelpersUtil.getTextContent(label)).toContain('Approve in wallet')
  })

  it('handles network switch error', async () => {
    vi.spyOn(ChainController, 'switchActiveNetwork').mockRejectedValue(new Error())
    const element: W3mNetworkSwitchView = await fixture(
      html`<w3m-network-switch-view></w3m-network-switch-view>`
    )

    const label = HelpersUtil.querySelect(element, '[data-testid="switching-network-label"]')
    expect(HelpersUtil.getTextContent(label)).toContain('Switch declined')
    expect(HelpersUtil.querySelect(element, 'wui-loading-hexagon')).toBeFalsy()
    expect(HelpersUtil.querySelect(element, 'wui-button')?.getAttribute('disabled')).toBeFalsy()
  })

  it('retries network switch on button click', async () => {
    vi.spyOn(ChainController, 'switchActiveNetwork')
      .mockRejectedValueOnce(new Error())
      .mockResolvedValueOnce(undefined)

    const element: W3mNetworkSwitchView = await fixture(
      html`<w3m-network-switch-view></w3m-network-switch-view>`
    )

    const retryButton = HelpersUtil.querySelect(element, 'wui-button')
    retryButton?.click()

    element.requestUpdate()
    await elementUpdated(element)

    expect(ChainController.switchActiveNetwork).toHaveBeenCalledTimes(2)
    expect(ChainController.switchActiveNetwork).toHaveBeenCalledWith(mockNetwork)
  })
})
