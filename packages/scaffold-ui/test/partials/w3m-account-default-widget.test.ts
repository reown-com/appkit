import { fixture } from '@open-wc/testing'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import { AccountController, ChainController, OptionsController } from '@reown/appkit-controllers'

import { W3mAccountDefaultWidget } from '../../src/partials/w3m-account-default-widget'
import { HelpersUtil } from '../utils/HelpersUtil'

// -- Constants ---------------------------------------------------------------
const ACTIVITY_BUTTON_TEST_ID = 'w3m-account-default-activity-button'
const ONRAMP_BUTTON_TEST_ID = 'w3m-account-default-onramp-button'
const SWAPS_BUTTON_TEST_ID = 'w3m-account-default-swaps-button'
const SEND_BUTTON_TEST_ID = 'w3m-account-default-send-button'

describe('W3mAccountDefaultWidget', () => {
  beforeAll(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('activity button visibility', () => {
    beforeEach(() => {
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

  describe('wallet features visibility', () => {
    beforeEach(() => {
      vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
        ...AccountController.state,
        caipAddress: 'eip155:1:0x123'
      })
    })

    describe('evm wallet features', () => {
      beforeEach(() => {
        vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
          ...ChainController.state,
          activeChain: CommonConstantsUtil.CHAIN.EVM
        })
      })

      it('should show all features when enabled', async () => {
        vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
          ...OptionsController.state,
          features: {
            onramp: true,
            swaps: true,
            send: true
          }
        })

        const element: W3mAccountDefaultWidget = await fixture(
          html`<w3m-account-default-widget></w3m-account-default-widget>`
        )

        const onrampButton = HelpersUtil.getByTestId(element, ONRAMP_BUTTON_TEST_ID)
        const swapButton = HelpersUtil.getByTestId(element, SWAPS_BUTTON_TEST_ID)
        const sendButton = HelpersUtil.getByTestId(element, SEND_BUTTON_TEST_ID)

        expect(onrampButton).not.toBeNull()
        expect(swapButton).not.toBeNull()
        expect(sendButton).not.toBeNull()
      })

      it('should not show onramp if disabled', async () => {
        vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
          ...OptionsController.state,
          features: {
            onramp: false,
            swaps: true,
            send: true
          }
        })

        const element: W3mAccountDefaultWidget = await fixture(
          html`<w3m-account-default-widget></w3m-account-default-widget>`
        )

        const onrampButton = HelpersUtil.getByTestId(element, ONRAMP_BUTTON_TEST_ID)
        const swapButton = HelpersUtil.getByTestId(element, SWAPS_BUTTON_TEST_ID)
        const sendButton = HelpersUtil.getByTestId(element, SEND_BUTTON_TEST_ID)

        expect(onrampButton).toBeNull()
        expect(swapButton).not.toBeNull()
        expect(sendButton).not.toBeNull()
      })

      it('should not show swaps if disabled', async () => {
        vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
          ...OptionsController.state,
          features: {
            onramp: true,
            swaps: false,
            send: true
          }
        })

        const element: W3mAccountDefaultWidget = await fixture(
          html`<w3m-account-default-widget></w3m-account-default-widget>`
        )

        const onrampButton = HelpersUtil.getByTestId(element, ONRAMP_BUTTON_TEST_ID)
        const swapButton = HelpersUtil.getByTestId(element, SWAPS_BUTTON_TEST_ID)
        const sendButton = HelpersUtil.getByTestId(element, SEND_BUTTON_TEST_ID)

        expect(onrampButton).not.toBeNull()
        expect(swapButton).toBeNull()
        expect(sendButton).not.toBeNull()
      })

      it('should not show send if disabled', async () => {
        vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
          ...OptionsController.state,
          features: {
            onramp: true,
            swaps: true,
            send: false
          }
        })

        const element: W3mAccountDefaultWidget = await fixture(
          html`<w3m-account-default-widget></w3m-account-default-widget>`
        )

        const onrampButton = HelpersUtil.getByTestId(element, ONRAMP_BUTTON_TEST_ID)
        const swapButton = HelpersUtil.getByTestId(element, SWAPS_BUTTON_TEST_ID)
        const sendButton = HelpersUtil.getByTestId(element, SEND_BUTTON_TEST_ID)

        expect(onrampButton).not.toBeNull()
        expect(swapButton).not.toBeNull()
        expect(sendButton).toBeNull()
      })
    })

    describe('solana wallet features', () => {
      beforeEach(() => {
        vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
          ...ChainController.state,
          activeChain: CommonConstantsUtil.CHAIN.SOLANA
        })
      })

      it('should show all features except swaps when enabled', async () => {
        vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
          ...OptionsController.state,
          features: {
            onramp: true,
            swaps: true,
            send: true
          }
        })

        const element: W3mAccountDefaultWidget = await fixture(
          html`<w3m-account-default-widget></w3m-account-default-widget>`
        )

        const onrampButton = HelpersUtil.getByTestId(element, ONRAMP_BUTTON_TEST_ID)
        const swapButton = HelpersUtil.getByTestId(element, SWAPS_BUTTON_TEST_ID)
        const sendButton = HelpersUtil.getByTestId(element, SEND_BUTTON_TEST_ID)

        expect(onrampButton).not.toBeNull()
        expect(swapButton).toBeNull()
        expect(sendButton).not.toBeNull()
      })

      it('should not show onramp if disabled', async () => {
        vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
          ...OptionsController.state,
          features: {
            onramp: false,
            swaps: true,
            send: true
          }
        })

        const element: W3mAccountDefaultWidget = await fixture(
          html`<w3m-account-default-widget></w3m-account-default-widget>`
        )

        const onrampButton = HelpersUtil.getByTestId(element, ONRAMP_BUTTON_TEST_ID)
        const swapButton = HelpersUtil.getByTestId(element, SWAPS_BUTTON_TEST_ID)
        const sendButton = HelpersUtil.getByTestId(element, SEND_BUTTON_TEST_ID)

        expect(onrampButton).toBeNull()
        expect(swapButton).toBeNull()
        expect(sendButton).not.toBeNull()
      })

      it('should not show send if disabled', async () => {
        vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
          ...OptionsController.state,
          features: {
            onramp: true,
            swaps: true,
            send: false
          }
        })

        const element: W3mAccountDefaultWidget = await fixture(
          html`<w3m-account-default-widget></w3m-account-default-widget>`
        )

        const onrampButton = HelpersUtil.getByTestId(element, ONRAMP_BUTTON_TEST_ID)
        const swapButton = HelpersUtil.getByTestId(element, SWAPS_BUTTON_TEST_ID)
        const sendButton = HelpersUtil.getByTestId(element, SEND_BUTTON_TEST_ID)

        expect(onrampButton).not.toBeNull()
        expect(swapButton).toBeNull()
        expect(sendButton).toBeNull()
      })
    })

    describe('bitcoin wallet features', () => {
      beforeEach(() => {
        vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
          ...ChainController.state,
          activeChain: CommonConstantsUtil.CHAIN.BITCOIN
        })
        vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
          ...AccountController.state,
          caipAddress: 'bip122:1:bc1qa1234567890'
        })
      })

      it('should not have any features enabled', async () => {
        const element: W3mAccountDefaultWidget = await fixture(
          html`<w3m-account-default-widget></w3m-account-default-widget>`
        )

        const onrampButton = HelpersUtil.getByTestId(element, ONRAMP_BUTTON_TEST_ID)
        const swapButton = HelpersUtil.getByTestId(element, SWAPS_BUTTON_TEST_ID)
        const sendButton = HelpersUtil.getByTestId(element, SEND_BUTTON_TEST_ID)

        expect(onrampButton).toBeNull()
        expect(swapButton).toBeNull()
        expect(sendButton).toBeNull()
      })
    })
  })
})
