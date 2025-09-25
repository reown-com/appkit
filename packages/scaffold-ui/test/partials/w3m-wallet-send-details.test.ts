import { fixture } from '@open-wc/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import type { CaipNetwork } from '@reown/appkit-common'
import { AssetUtil, RouterController } from '@reown/appkit-controllers'

import '../../src/partials/w3m-wallet-send-details/index'
import type { W3mWalletSendDetails } from '../../src/partials/w3m-wallet-send-details/index'
import { HelpersUtil } from '../utils/HelpersUtil'

describe('W3mWalletSendDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(AssetUtil, 'getNetworkImage').mockReturnValue('net.png')
    vi.spyOn(RouterController, 'push').mockImplementation(vi.fn())
  })

  it('should render address and network when provided', async () => {
    const network = { name: 'Ethereum', id: 'eip155:1' } as unknown as CaipNetwork
    const el = (await fixture(
      html`<w3m-wallet-send-details receiverAddress="0x1234567890abcdef" .caipNetwork=${network} />`
    )) as W3mWalletSendDetails
    const title = el.shadowRoot?.textContent?.includes('Details')
    const addressRow = HelpersUtil.querySelect(el, 'wui-list-content:not(.network)')
    const networkRow = HelpersUtil.querySelect(el, 'wui-list-content.network')

    expect(title).toBe(true)
    expect(addressRow).toBeTruthy()
    expect(networkRow).toBeTruthy()
    expect(networkRow?.getAttribute('imagesrc')).toBe('net.png')
  })

  it('should navigate to Networks on network click', async () => {
    const network = { name: 'Ethereum', id: 'eip155:1' } as unknown as CaipNetwork
    const el = (await fixture(
      html`<w3m-wallet-send-details receiverAddress="0x1234567890abcdef" .caipNetwork=${network} />`
    )) as W3mWalletSendDetails
    const networkRow = HelpersUtil.querySelect(el, 'wui-list-content.network')
    networkRow.click()

    expect(RouterController.push).toHaveBeenCalledWith('Networks', { network })
  })

  it('should render without network when caipNetwork is undefined', async () => {
    const el = (await fixture(
      html`<w3m-wallet-send-details receiverAddress="0xabc"></w3m-wallet-send-details>`
    )) as W3mWalletSendDetails
    const networkRow = HelpersUtil.querySelect(el, 'wui-list-content.network')

    expect(networkRow).toBeNull()
  })
})
