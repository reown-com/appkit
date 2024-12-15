import { W3mConnectButton } from '../../src/modal/w3m-connect-button'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { elementUpdated, fixture } from '@open-wc/testing'
import { html } from 'lit'
import { ModalController, type ModalControllerState } from '@reown/appkit-core'
import { HelpersUtil } from '../utils/HelpersUtil'
import type { WuiConnectButton } from '@reown/appkit-ui'

describe('W3mConnectButton', () => {
  beforeEach(() => {
    ModalController.close()
    ModalController.setLoading(false)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders with default props', async () => {
      const element: W3mConnectButton = await fixture(
        html`<w3m-connect-button></w3m-connect-button>`
      )
      const button = HelpersUtil.getByTestId(element, 'connect-button')

      expect(button).toBeTruthy()
      expect(button?.textContent?.trim()).toBe('Connect Wallet')
      expect(button?.getAttribute('size')).toBe('md')
    })

    it('renders with custom props', async () => {
      const element: W3mConnectButton = await fixture(
        html`<w3m-connect-button
          size="sm"
          label="Custom Connect"
          loadingLabel="Custom Loading..."
        ></w3m-connect-button>`
      )
      const button = HelpersUtil.getByTestId(element, 'connect-button')

      expect(button?.textContent?.trim()).toBe('Custom Connect')
      expect(button?.getAttribute('size')).toBe('sm')
    })
  })

  describe('State Changes', () => {
    it('updates button text when loading', async () => {
      const element: W3mConnectButton = await fixture(
        html`<w3m-connect-button></w3m-connect-button>`
      )

      ModalController.setLoading(true)

      element.requestUpdate()
      await elementUpdated(element)

      const button = HelpersUtil.getByTestId(element, 'connect-button') as WuiConnectButton
      expect(button?.textContent?.trim()).toBe('Connecting...')
      expect(button?.loading).toBe(true)
    })

    it('updates button text when modal is open', async () => {
      const element: W3mConnectButton = await fixture(
        html`<w3m-connect-button></w3m-connect-button>`
      )

      ModalController.open()
      element.requestUpdate()
      await elementUpdated(element)

      const button = HelpersUtil.getByTestId(element, 'connect-button') as WuiConnectButton
      expect(button?.textContent?.trim()).toBe('Connecting...')
      expect(button?.loading).toBe(true)
    })
  })

  describe('Interactions', () => {
    it('opens modal on click when closed', async () => {
      const element: W3mConnectButton = await fixture(
        html`<w3m-connect-button></w3m-connect-button>`
      )
      const button = HelpersUtil.getByTestId(element, 'connect-button') as WuiConnectButton

      button?.click()
      element.requestUpdate()
      await elementUpdated(element)

      expect(ModalController.state.open).toBe(true)
    })

    it('does not toggle modal when loading', async () => {
      const element: W3mConnectButton = await fixture(
        html`<w3m-connect-button></w3m-connect-button>`
      )

      ModalController.setLoading(true)
      element.requestUpdate()
      await elementUpdated(element)

      const button = HelpersUtil.getByTestId(element, 'connect-button')
      button?.click()

      expect(ModalController.state.open).toBe(false)
      expect(ModalController.state.loading).toBe(true)
    })
  })

  describe('Cleanup', () => {
    it('cleans up subscriptions on disconnect', async () => {
      const element: W3mConnectButton = await fixture(
        html`<w3m-connect-button></w3m-connect-button>`
      )
      const unsubscribeSpy = vi.fn()
      ;(element as any).unsubscribe = [unsubscribeSpy]

      element.disconnectedCallback()

      expect(unsubscribeSpy).toHaveBeenCalled()
    })
  })

  describe('AppKitConnectButton', () => {
    it('renders same functionality with different tag', async () => {
      const element: W3mConnectButton = await fixture(
        html`<appkit-connect-button></appkit-connect-button>`
      )
      const button = HelpersUtil.getByTestId(element, 'connect-button')

      expect(button).toBeTruthy()
      expect(button?.textContent?.trim()).toBe('Connect Wallet')
    })
  })
})
