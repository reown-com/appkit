import { fixture } from '@open-wc/testing'
import { describe, expect, it } from 'vitest'

import { html } from 'lit'

import '../../src/partials/w3m-wallet-login-list/index'
import type { W3mWalletLoginList } from '../../src/partials/w3m-wallet-login-list/index'
import { HelpersUtil } from '../utils/HelpersUtil'

describe('W3mWalletLoginList', () => {
  it('should render connector list and all wallets widget', async () => {
    const el = (await fixture(
      html`<w3m-wallet-login-list tabIdx="1"></w3m-wallet-login-list>`
    )) as W3mWalletLoginList
    const connector = HelpersUtil.querySelect(el, 'w3m-connector-list')
    const allWallets = HelpersUtil.querySelect(el, 'w3m-all-wallets-widget')

    expect(connector).toBeTruthy()
    expect(allWallets).toBeTruthy()
    expect(connector?.getAttribute('tabidx')).toBe('1')
    expect(allWallets?.getAttribute('tabidx')).toBe('1')
  })
})
