import { W3mConnectingHeader } from '../../src/partials/w3m-connecting-header'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { fixture } from '@open-wc/testing'
import { html } from 'lit'
import { HelpersUtil } from '../utils/HelpersUtil'
import type { WuiTabs } from '@reown/appkit-ui'
import type { Platform } from '@reown/appkit-core'

// -- Constants ------------------------------------------- //
const TABS = 'wui-tabs'

// -- Helpers --------------------------------------------- //
async function getTabs(platformTabs: Platform[]) {
  const connectingHeader: W3mConnectingHeader = await fixture(
    html`<w3m-connecting-header .platforms=${platformTabs}></w3m-connecting-header>`
  )
  const { tabs } = HelpersUtil.querySelect(connectingHeader, TABS) as WuiTabs
  console.log(tabs)
  return tabs
}

describe('W3mConnectingHeader', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('it should display different platforms', async () => {
    expect(await getTabs(['browser'])).toStrictEqual([
      {
        icon: 'mobile',
        label: 'Mobile',
        platform: 'mobile'
      }
    ])
    expect(await getTabs(['browser'])).toStrictEqual([
      {
        icon: 'mobile',
        label: 'Mobile',
        platform: 'mobile'
      }
    ])
    expect(await getTabs(['browser'])).toStrictEqual([
      {
        icon: 'mobile',
        label: 'Mobile',
        platform: 'mobile'
      }
    ])
  })
})
