import { elementUpdated, fixture } from '@open-wc/testing'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { ConstantsUtil } from '@reown/appkit-common'
import { RouterController } from '@reown/appkit-controllers'

import { W3mSwitchActiveChainView } from '../../src/views/w3m-switch-active-chain-view'

// --- Test Suite --------------------------------------------------- //
describe('W3mSwitchActiveChainView', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render EVM case as expected', async () => {
    const chainName = ConstantsUtil.CHAIN_NAME_MAP['eip155']
    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      data: {
        switchToChain: 'eip155'
      }
    })

    const el = await fixture<W3mSwitchActiveChainView>(
      html`<w3m-switch-active-chain-view></w3m-switch-active-chain-view>`
    )
    await elementUpdated(el)

    expect(el).toBeDefined()
    expect(el.shadowRoot?.querySelector('wui-text')?.textContent).toContain(chainName)
  })

  it('should render Solana case as expected', async () => {
    const chainName = ConstantsUtil.CHAIN_NAME_MAP['solana']
    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      data: {
        switchToChain: 'solana'
      }
    })

    const el = await fixture<W3mSwitchActiveChainView>(
      html`<w3m-switch-active-chain-view></w3m-switch-active-chain-view>`
    )
    await elementUpdated(el)

    expect(el).toBeDefined()
    expect(el.shadowRoot?.querySelector('wui-text')?.textContent).toContain(chainName)
  })

  it('should render Bitcoin case as expected', async () => {
    const chainName = ConstantsUtil.CHAIN_NAME_MAP['bip122']
    vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
      ...RouterController.state,
      data: {
        switchToChain: 'bip122'
      }
    })

    const el = await fixture<W3mSwitchActiveChainView>(
      html`<w3m-switch-active-chain-view></w3m-switch-active-chain-view>`
    )
    await elementUpdated(el)

    expect(el).toBeDefined()
    expect(el.shadowRoot?.querySelector('wui-text')?.textContent).toContain(chainName)
  })
})
