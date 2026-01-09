import { fixture } from '@open-wc/testing'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import { type AccountState, ChainController, OptionsController } from '@reown/appkit-controllers'

import { W3mAccountDefaultWidget } from '../../src/partials/w3m-account-default-widget'
import { HelpersUtil } from '../utils/HelpersUtil'

// -- Constants ---------------------------------------------------------------
const ACTIVITY_BUTTON_TEST_ID = 'w3m-account-default-activity-button'
const FUND_WALLET_BUTTON_TEST_ID = 'w3m-account-default-fund-wallet-button'
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
      vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
        ...ChainController.getAccountData(),
        caipAddress: 'eip155:1:0x123'
      } as unknown as AccountState)
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
        remoteFeatures: {
          activity: true
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
        remoteFeatures: {
          activity: false
        }
      })

      const element = await fixture(html`<w3m-account-default-widget></w3m-account-default-widget>`)
      const activityButton = HelpersUtil.getByTestId(element, ACTIVITY_BUTTON_TEST_ID)

      expect(activityButton).toBeNull()
    })
  })

  describe('wallet features visibility', () => {
    beforeEach(() => {
      vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
        ...ChainController.getAccountData(),
        caipAddress: 'eip155:1:0x123'
      } as unknown as AccountState)
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
            send: true
          },
          remoteFeatures: {
            onramp: ['meld'],
            swaps: ['1inch']
          }
        })

        const element: W3mAccountDefaultWidget = await fixture(
          html`<w3m-account-default-widget></w3m-account-default-widget>`
        )

        const fundWalletButton = HelpersUtil.getByTestId(element, FUND_WALLET_BUTTON_TEST_ID)
        const swapButton = HelpersUtil.getByTestId(element, SWAPS_BUTTON_TEST_ID)
        const sendButton = HelpersUtil.getByTestId(element, SEND_BUTTON_TEST_ID)

        expect(fundWalletButton).not.toBeNull()
        expect(swapButton).not.toBeNull()
        expect(sendButton).not.toBeNull()
      })

      it('should not show fund wallet if onramp is disabled', async () => {
        vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
          ...OptionsController.state,
          features: {
            send: true
          },
          remoteFeatures: {
            onramp: false,
            swaps: ['1inch']
          }
        })

        const element: W3mAccountDefaultWidget = await fixture(
          html`<w3m-account-default-widget></w3m-account-default-widget>`
        )

        const fundWalletButton = HelpersUtil.getByTestId(element, FUND_WALLET_BUTTON_TEST_ID)
        const swapButton = HelpersUtil.getByTestId(element, SWAPS_BUTTON_TEST_ID)
        const sendButton = HelpersUtil.getByTestId(element, SEND_BUTTON_TEST_ID)

        expect(fundWalletButton).toBeNull()
        expect(swapButton).not.toBeNull()
        expect(sendButton).not.toBeNull()
      })

      it('should not show swaps if disabled', async () => {
        vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
          ...OptionsController.state,
          features: {
            send: true
          },
          remoteFeatures: {
            onramp: ['meld'],
            swaps: false
          }
        })

        const element: W3mAccountDefaultWidget = await fixture(
          html`<w3m-account-default-widget></w3m-account-default-widget>`
        )

        const fundWalletButton = HelpersUtil.getByTestId(element, FUND_WALLET_BUTTON_TEST_ID)
        const swapButton = HelpersUtil.getByTestId(element, SWAPS_BUTTON_TEST_ID)
        const sendButton = HelpersUtil.getByTestId(element, SEND_BUTTON_TEST_ID)

        expect(fundWalletButton).not.toBeNull()
        expect(swapButton).toBeNull()
        expect(sendButton).not.toBeNull()
      })

      it('should not show send if disabled', async () => {
        vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
          ...OptionsController.state,
          features: {
            send: false
          },
          remoteFeatures: {
            onramp: ['meld'],
            swaps: ['1inch']
          }
        })

        const element: W3mAccountDefaultWidget = await fixture(
          html`<w3m-account-default-widget></w3m-account-default-widget>`
        )

        const fundWalletButton = HelpersUtil.getByTestId(element, FUND_WALLET_BUTTON_TEST_ID)
        const swapButton = HelpersUtil.getByTestId(element, SWAPS_BUTTON_TEST_ID)
        const sendButton = HelpersUtil.getByTestId(element, SEND_BUTTON_TEST_ID)

        expect(fundWalletButton).not.toBeNull()
        expect(swapButton).not.toBeNull()
        expect(sendButton).toBeNull()
      })

      it('should not show fund wallet if payWithExchange, onramp and receive are disabled', async () => {
        vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
          ...OptionsController.state,
          features: {
            swaps: true,
            receive: false
          },
          remoteFeatures: {
            payWithExchange: false,
            onramp: false
          }
        })

        const element: W3mAccountDefaultWidget = await fixture(
          html`<w3m-account-default-widget></w3m-account-default-widget>`
        )

        const fundWalletButton = HelpersUtil.getByTestId(element, FUND_WALLET_BUTTON_TEST_ID)

        expect(fundWalletButton).toBeNull()
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
            send: true
          },
          remoteFeatures: {
            onramp: ['meld'],
            swaps: ['1inch']
          }
        })

        const element: W3mAccountDefaultWidget = await fixture(
          html`<w3m-account-default-widget></w3m-account-default-widget>`
        )

        const fundWalletButton = HelpersUtil.getByTestId(element, FUND_WALLET_BUTTON_TEST_ID)
        const swapButton = HelpersUtil.getByTestId(element, SWAPS_BUTTON_TEST_ID)
        const sendButton = HelpersUtil.getByTestId(element, SEND_BUTTON_TEST_ID)

        expect(fundWalletButton).not.toBeNull()
        expect(swapButton).toBeNull()
        expect(sendButton).not.toBeNull()
      })

      it('should not show onramp if disabled', async () => {
        vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
          ...OptionsController.state,
          features: {
            send: true
          },
          remoteFeatures: {
            onramp: false,
            swaps: ['1inch']
          }
        })

        const element: W3mAccountDefaultWidget = await fixture(
          html`<w3m-account-default-widget></w3m-account-default-widget>`
        )

        const fundWalletButton = HelpersUtil.getByTestId(element, FUND_WALLET_BUTTON_TEST_ID)
        const swapButton = HelpersUtil.getByTestId(element, SWAPS_BUTTON_TEST_ID)
        const sendButton = HelpersUtil.getByTestId(element, SEND_BUTTON_TEST_ID)

        expect(fundWalletButton).toBeNull()
        expect(swapButton).toBeNull()
        expect(sendButton).not.toBeNull()
      })

      it('should not show send if disabled', async () => {
        vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
          ...OptionsController.state,
          features: {
            send: false
          },
          remoteFeatures: {
            onramp: ['meld'],
            swaps: ['1inch']
          }
        })

        const element: W3mAccountDefaultWidget = await fixture(
          html`<w3m-account-default-widget></w3m-account-default-widget>`
        )

        const fundWalletButton = HelpersUtil.getByTestId(element, FUND_WALLET_BUTTON_TEST_ID)
        const swapButton = HelpersUtil.getByTestId(element, SWAPS_BUTTON_TEST_ID)
        const sendButton = HelpersUtil.getByTestId(element, SEND_BUTTON_TEST_ID)

        expect(fundWalletButton).not.toBeNull()
        expect(swapButton).toBeNull()
        expect(sendButton).toBeNull()
      })

      it('should not show fund wallet if payWithExchange, onramp and receive are disabled', async () => {
        vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
          ...OptionsController.state,
          features: {
            swaps: true,
            receive: false
          },
          remoteFeatures: {
            payWithExchange: false,
            onramp: false
          }
        })

        const element: W3mAccountDefaultWidget = await fixture(
          html`<w3m-account-default-widget></w3m-account-default-widget>`
        )

        const fundWalletButton = HelpersUtil.getByTestId(element, FUND_WALLET_BUTTON_TEST_ID)

        expect(fundWalletButton).toBeNull()
      })
    })

    describe('bitcoin wallet features', () => {
      beforeEach(() => {
        vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
          ...ChainController.state,
          activeChain: CommonConstantsUtil.CHAIN.BITCOIN
        })
        vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
          ...ChainController.getAccountData(),
          caipAddress: 'bip122:1:bc1qa1234567890'
        } as unknown as AccountState)
      })

      it('should not have any features enabled', async () => {
        const element: W3mAccountDefaultWidget = await fixture(
          html`<w3m-account-default-widget></w3m-account-default-widget>`
        )

        const fundWalletButton = HelpersUtil.getByTestId(element, FUND_WALLET_BUTTON_TEST_ID)
        const swapButton = HelpersUtil.getByTestId(element, SWAPS_BUTTON_TEST_ID)
        const sendButton = HelpersUtil.getByTestId(element, SEND_BUTTON_TEST_ID)

        expect(fundWalletButton).toBeNull()
        expect(swapButton).toBeNull()
        expect(sendButton).toBeNull()
      })
    })
  })
})
