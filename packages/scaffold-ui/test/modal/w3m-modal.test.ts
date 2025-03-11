import { elementUpdated, fixture } from '@open-wc/testing'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { type CaipNetwork } from '@reown/appkit-common'
import {
  ApiController,
  ChainController,
  ModalController,
  OptionsController,
  RouterController,
  SIWXUtil
} from '@reown/appkit-controllers'
import type { RouterControllerState, SIWXConfig } from '@reown/appkit-controllers'

import { W3mModal } from '../../src/modal/w3m-modal'
import { HelpersUtil } from '../utils/HelpersUtil'

// --- Mocks ------------------------------------------------------------
const mainnet = {
  id: 1,
  name: 'Ethereum',
  caipNetworkId: 'eip155:1',
  chainNamespace: 'eip155'
} as unknown as CaipNetwork
const polygon = {
  id: 137,
  name: 'Polygon',
  caipNetworkId: 'eip155:137',
  chainNamespace: 'eip155'
} as unknown as CaipNetwork

beforeAll(() => {
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
  }))
})

describe('W3mModal', () => {
  describe('Embedded Mode', () => {
    let element: W3mModal

    beforeEach(async () => {
      Element.prototype.animate = vi.fn().mockReturnValue({ finished: true })
      vi.spyOn(ApiController, 'prefetch').mockImplementation(() => Promise.resolve())
      vi.spyOn(ApiController, 'prefetchAnalyticsConfig').mockImplementation(() => Promise.resolve())
      OptionsController.setEnableEmbedded(true)
      ModalController.close()
      element = await fixture(html`<w3m-modal .enableEmbedded=${true}></w3m-modal>`)
    })

    afterEach(() => {
      vi.clearAllMocks()
    })

    it('should be visible when embedded is enabled', () => {
      expect(element).toBeTruthy()
      const card = HelpersUtil.getByTestId(element, 'w3m-modal-card')
      expect(card).toBeTruthy()
      expect(HelpersUtil.querySelect(element, 'w3m-header')).toBeTruthy()
      expect(HelpersUtil.querySelect(element, 'w3m-router')).toBeTruthy()
      expect(HelpersUtil.querySelect(element, 'w3m-snackbar')).toBeTruthy()
      expect(HelpersUtil.querySelect(element, 'w3m-alertbar')).toBeTruthy()
      expect(HelpersUtil.querySelect(element, 'w3m-tooltip')).toBeTruthy()
    })

    it('should not render overlay in embedded mode', () => {
      const overlay = HelpersUtil.getByTestId(element, 'w3m-modal-overlay')
      expect(overlay).toBeNull()
    })

    it('should close modal when wallet is connected', async () => {
      ChainController.state.activeCaipAddress = 'eip155:1:0x123...'
      await fixture(html`<w3m-modal .enableEmbedded=${true}></w3m-modal>`)
      ChainController.state.activeCaipAddress = undefined

      expect(ModalController.state.open).toBe(false)
    })

    it('should prefetch when modal is open', async () => {
      element = await fixture(html`<w3m-modal .enableEmbedded=${true}></w3m-modal>`)

      expect(ApiController.prefetch).toHaveBeenCalled()
    })
  })

  describe('Standard Mode', () => {
    let element: W3mModal

    beforeEach(async () => {
      vi.spyOn(ApiController, 'prefetch').mockImplementation(() => Promise.resolve())
      vi.spyOn(ApiController, 'prefetchAnalyticsConfig').mockImplementation(() => Promise.resolve())
      OptionsController.setEnableEmbedded(false)
      ModalController.close()
      element = await fixture(html`<w3m-modal></w3m-modal>`)
    })

    afterEach(() => {
      vi.clearAllMocks()
    })

    it('should not be visible when closed', () => {
      expect(HelpersUtil.getByTestId(element, 'w3m-modal-overlay')).toBeNull()
    })

    it('should prefetch when modal is open', async () => {
      await ModalController.open()

      element.requestUpdate()
      await elementUpdated(element)

      expect(ApiController.prefetch).toHaveBeenCalled()
    })

    it('should be visible when opened', async () => {
      await ModalController.open()

      element.requestUpdate()
      await elementUpdated(element)

      expect(HelpersUtil.getByTestId(element, 'w3m-modal-overlay')).toBeTruthy()
      expect(HelpersUtil.getByTestId(element, 'w3m-modal-card')).toBeTruthy()
    })

    it('should handle overlay click', async () => {
      ModalController.open()
      element.requestUpdate()
      await elementUpdated(element)

      const overlay = HelpersUtil.getByTestId(element, 'w3m-modal-overlay')
      overlay?.click()
      element.requestUpdate()
      await elementUpdated(element)

      expect(ModalController.state.open).toBe(false)
    })

    it('should add shake class when shaking', async () => {
      ModalController.open()
      element.requestUpdate()
      await elementUpdated(element)

      ModalController.shake()
      element.requestUpdate()
      await elementUpdated(element)

      const card = HelpersUtil.getByTestId(element, 'w3m-modal-card')
      expect(card?.getAttribute('shake')).toBe('true')
    })

    it('prevents closing on unsupported chain', async () => {
      vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
        view: 'UnsupportedChain'
      } as RouterControllerState)
      const shakeSpy = vi.spyOn(ModalController, 'shake')

      ModalController.open()
      element.requestUpdate()
      await elementUpdated(element)

      const overlay = HelpersUtil.getByTestId(element, 'w3m-modal-overlay')
      overlay?.click()

      expect(shakeSpy).toHaveBeenCalled()
      expect(ModalController.state.open).toBe(true)
    })
  })

  describe('Network Changes', () => {
    let element: W3mModal

    beforeEach(async () => {
      vi.spyOn(ApiController, 'prefetch').mockImplementation(() => Promise.resolve())
      element = await fixture(html`<w3m-modal></w3m-modal>`)
    })

    afterEach(() => {
      vi.clearAllMocks()
    })

    it('should handle network change when not connected', async () => {
      const goBackSpy = vi.spyOn(RouterController, 'goBack')
      ;(element as any).caipAddress = undefined
      ;(element as any).caipNetwork = mainnet

      ChainController.setActiveCaipNetwork(polygon)
      element.requestUpdate()
      await elementUpdated(element)

      expect(ApiController.prefetchAnalyticsConfig).toHaveBeenCalled()
      expect(goBackSpy).toHaveBeenCalled()
    })

    it('should call goBack when network changed and page is UnsupportedChain', async () => {
      vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
        view: 'UnsupportedChain'
      } as RouterControllerState)
      const goBackSpy = vi.spyOn(RouterController, 'goBack')
      ;(element as any).caipAddress = 'eip155:1:0x123'
      ;(element as any).caipNetwork = polygon
      element.requestUpdate()

      ChainController.setActiveCaipNetwork(mainnet)
      element.requestUpdate()
      await elementUpdated(element)

      expect(goBackSpy).toHaveBeenCalled()
    })

    it('should handle network change when connected', async () => {
      const goBackSpy = vi.spyOn(RouterController, 'goBack')
      ;(element as any).caipAddress = 'eip155:1:0x123'
      ;(element as any).caipNetwork = mainnet
      element.requestUpdate()

      ChainController.setActiveCaipNetwork(polygon)
      element.requestUpdate()
      await elementUpdated(element)

      expect(goBackSpy).toHaveBeenCalled()
      expect(ApiController.prefetchAnalyticsConfig).toHaveBeenCalled()
    })
  })

  describe('Initialization', () => {
    it('should prefetch analytics config on page load', async () => {
      const prefetchSpy = vi.spyOn(ApiController, 'prefetchAnalyticsConfig')
      await fixture(html`<w3m-modal></w3m-modal>`)

      expect(prefetchSpy).toHaveBeenCalled()
    })

    it('should clean up subscriptions on disconnect', async () => {
      const element: W3mModal = await fixture(html`<w3m-modal></w3m-modal>`)
      const abortSpy = vi.fn()
      ;(element as any).abortController = { abort: abortSpy }

      element.disconnectedCallback()

      expect(abortSpy).toHaveBeenCalled()
    })
  })

  describe('SIWX/SIWE', () => {
    beforeAll(() => {
      // Create w3m-frame iframe
      const w3mFrame = document.createElement('iframe')
      w3mFrame.id = 'w3m-iframe'
      document.body.appendChild(w3mFrame)
    })

    it('should prevent the user from closing the modal when required is set to true', async () => {
      vi.useFakeTimers()

      vi.spyOn(ModalController, 'state', 'get').mockReturnValue({
        ...ModalController.state,
        open: true
      })
      vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
        view: 'ApproveTransaction'
      } as unknown as RouterControllerState)
      vi.spyOn(SIWXUtil, 'getSIWX').mockReturnValue({
        getRequired: vi.fn().mockReturnValue(true),
        getSessions: vi.fn().mockResolvedValue([])
      } as unknown as SIWXConfig)

      const element: W3mModal = await fixture(html`<w3m-modal></w3m-modal>`)

      const shakeSpy = vi.spyOn(ModalController, 'shake')
      const closeSpy = vi.spyOn(ModalController, 'close')

      const overlay = HelpersUtil.getByTestId(element, 'w3m-modal-overlay')

      overlay.click()

      await vi.advanceTimersByTimeAsync(200)

      expect(closeSpy).not.toHaveBeenCalled()
      expect(shakeSpy).toHaveBeenCalled()
    })

    it('should allow the user to close the modal when required is set to false', async () => {
      vi.useFakeTimers()

      vi.spyOn(ModalController, 'state', 'get').mockReturnValue({
        ...ModalController.state,
        open: true
      })
      vi.spyOn(RouterController, 'state', 'get').mockReturnValue({
        view: 'ApproveTransaction'
      } as unknown as RouterControllerState)
      vi.spyOn(SIWXUtil, 'getSIWX').mockReturnValue({
        getRequired: vi.fn().mockReturnValue(false),
        getSessions: vi.fn().mockResolvedValue([])
      } as unknown as SIWXConfig)

      const element: W3mModal = await fixture(html`<w3m-modal></w3m-modal>`)

      const shakeSpy = vi.spyOn(ModalController, 'shake')
      const closeSpy = vi.spyOn(ModalController, 'close')

      const overlay = HelpersUtil.getByTestId(element, 'w3m-modal-overlay')

      overlay.click()

      await vi.advanceTimersByTimeAsync(200)

      expect(shakeSpy).not.toHaveBeenCalled()
      expect(closeSpy).toHaveBeenCalled()
    })
  })
})
