import { elementUpdated, fixture } from '@open-wc/testing'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import type { ChainNamespace } from '@reown/appkit-common'
import {
  type AccountState,
  type ChainAdapter,
  ChainController,
  type ConnectedWalletInfo,
  type Metadata,
  OptionsController
} from '@reown/appkit-controllers'
import type { WuiVisualThumbnail } from '@reown/appkit-ui/wui-visual-thumbnail'

import '../../src/partials/w3m-siwx-sign-message-thumbnails/index'
import { HelpersUtil } from '../utils/HelpersUtil'

describe('W3mSIWXSignMessageThumbnails', () => {
  beforeAll(() => {
    Element.prototype.animate = vi.fn()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      metadata: { icons: ['https://dapp/img.png'] } as Metadata
    })
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeCaipAddress: 'eip155:1:0x1234567890abcdef1234567890abcdef12345678',
      chains: new Map([
        [
          'eip155',
          {
            accountState: {
              connectedWalletInfo: { icon: 'https://wallet/img.png' } as ConnectedWalletInfo
            }
          }
        ]
      ]) as unknown as Map<ChainNamespace, ChainAdapter>
    })
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      connectedWalletInfo: { icon: 'https://wallet/img.png' } as ConnectedWalletInfo
    } as unknown as AccountState)
  })

  it('renders two visual thumbnails with correct images and border flag', async () => {
    const el = await fixture(
      html`<w3m-siwx-sign-message-thumbnails></w3m-siwx-sign-message-thumbnails>`
    )
    const thumbnails = HelpersUtil.querySelectAll(
      el,
      'wui-visual-thumbnail'
    ) as unknown as WuiVisualThumbnail[]
    expect(thumbnails.length).toBe(2)
    expect(thumbnails[0]?.hasAttribute('borderradiusfull')).toBe(true)
    expect(thumbnails[0]?.imageSrc).toBe('https://dapp/img.png')
    expect(thumbnails[1]?.imageSrc).toBe('https://wallet/img.png')
  })

  it('triggers animations on firstUpdated', async () => {
    const el = await fixture(
      html`<w3m-siwx-sign-message-thumbnails></w3m-siwx-sign-message-thumbnails>`
    )
    await elementUpdated(el)
    expect(Element.prototype.animate).toHaveBeenCalled()
  })
})
