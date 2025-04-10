import { fixture } from '@open-wc/testing'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { AccountController, ChainController, OptionsController } from '@reown/appkit-controllers'

import { HelpersUtil } from '../utils/HelpersUtil'

// -- Constants ---------------------------------------------------------------
const ACTIVITY_BUTTON_TEST_ID = 'w3m-account-default-activity-button'

describe('W3mAccountDefaultWidget', () => {
  beforeAll(() => {
    vi.clearAllMocks()

    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      features: {
        history: true
      }
    })
    vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
      ...AccountController.state,
      allAccounts: [],
      caipAddress: 'eip155:1:0x123'
    })
  })

  it('should not show activity button for solana namespace', async () => {
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeChain: 'solana'
    })

    const element = await fixture(html`<w3m-account-default-widget></w3m-account-default-widget>`)
    const activityButton = HelpersUtil.getByTestId(element, ACTIVITY_BUTTON_TEST_ID)

    expect(activityButton).toBeNull()
  })

  it('should show activity button for eip155 namespace', async () => {
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeChain: 'eip155'
    })
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      features: {
        history: true
      }
    })

    const element = await fixture(html`<w3m-account-default-widget></w3m-account-default-widget>`)
    const activityButton = HelpersUtil.getByTestId(element, ACTIVITY_BUTTON_TEST_ID)

    expect(activityButton).not.toBeNull()
    expect(activityButton?.textContent).toContain('Activity')
  })

  it('should not show activity button when history feature is disabled', async () => {
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      activeChain: 'eip155'
    })
    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      features: {
        history: false
      }
    })

    const element = await fixture(html`<w3m-account-default-widget></w3m-account-default-widget>`)
    const activityButton = HelpersUtil.getByTestId(element, ACTIVITY_BUTTON_TEST_ID)

    expect(activityButton).toBeNull()
  })
})
