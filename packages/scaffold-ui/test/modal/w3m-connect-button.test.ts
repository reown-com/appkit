import { elementUpdated, fixture } from '@open-wc/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { closeModal, modalState, openModal, setModalLoading } from '@reown/appkit-core'
import type { WuiConnectButton } from '@reown/appkit-ui'

import { W3mConnectButton } from '../../src/modal/w3m-connect-button'
import { HelpersUtil } from '../utils/HelpersUtil'

describe('W3mConnectButton', () => {
  let element: W3mConnectButton
  beforeEach(async () => {
    closeModal()
    setModalLoading(false)
    element = await fixture(html`<w3m-connect-button></w3m-connect-button>`)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders with default props', async () => {
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
      const button = HelpersUtil.getByTestId(element, 'connect-button') as WuiConnectButton
      expect(button?.textContent?.trim()).toBe('Custom Connect')
      expect(button?.getAttribute('size')).toBe('sm')

      setModalLoading(true)

      element.requestUpdate()
      await elementUpdated(element)

      expect(button?.textContent?.trim()).toBe('Custom Loading...')
      expect(button?.loading).toBe(true)
    })
  })

  describe('State Changes', () => {
    it('updates button text when loading', async () => {
      setModalLoading(true)

      element.requestUpdate()
      await elementUpdated(element)

      const button = HelpersUtil.getByTestId(element, 'connect-button') as WuiConnectButton
      expect(button?.textContent?.trim()).toBe('Connecting...')
      expect(button?.loading).toBe(true)
    })

    it('updates button text when modal is open', async () => {
      await openModal()
      element.requestUpdate()
      await elementUpdated(element)

      const button = HelpersUtil.getByTestId(element, 'connect-button') as WuiConnectButton
      expect(button?.textContent?.trim()).toBe('Connecting...')
      expect(button?.loading).toBe(true)
    })
  })

  describe('Interactions', () => {
    it('opens modal on click when closed', async () => {
      const button = HelpersUtil.getByTestId(element, 'connect-button') as WuiConnectButton

      button?.click()
      element.requestUpdate()
      await elementUpdated(element)

      expect(modalState.open).toBe(true)
    })

    it('does not toggle modal when loading', async () => {
      setModalLoading(true)
      element.requestUpdate()
      await elementUpdated(element)

      const button = HelpersUtil.getByTestId(element, 'connect-button')
      button?.click()

      expect(modalState.open).toBe(false)
      expect(modalState.loading).toBe(true)
    })

    it('closes modal when open', async () => {
      openModal()
      element.requestUpdate()
      await elementUpdated(element)

      const button = HelpersUtil.getByTestId(element, 'connect-button')
      button?.click()

      expect(modalState.open).toBe(false)
    })
  })

  describe('Cleanup', () => {
    it('cleans up subscriptions on disconnect', async () => {
      const unsubscribeSpy = vi.fn()
      ;(element as any).unsubscribe = [unsubscribeSpy]

      element.disconnectedCallback()

      expect(unsubscribeSpy).toHaveBeenCalled()
    })
  })

  describe('AppKitConnectButton', () => {
    it('renders same functionality with different tag', async () => {
      const button = HelpersUtil.getByTestId(element, 'connect-button')

      expect(button).toBeTruthy()
      expect(button?.textContent?.trim()).toBe('Connect Wallet')
    })
  })
})
