import { elementUpdated, fixture } from '@open-wc/testing'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import type { CaipNetwork } from '@reown/appkit-common'
import {
  AssetController,
  AssetUtil,
  ChainController,
  EventsController,
  ModalController,
  OptionsController,
  RouterController,
  SIWXUtil
} from '@reown/appkit-controllers'

import { W3mHeader } from '../../src/partials/w3m-header'
import { HelpersUtil } from '../utils/HelpersUtil'

describe('W3mHeader', () => {
  let element: W3mHeader

  beforeAll(() => {
    Element.prototype.animate = vi.fn().mockReturnValue({ finished: Promise.resolve() })
  })

  beforeEach(async () => {
    vi.clearAllMocks()
    RouterController.reset('Connect')
    element = await fixture(html`<w3m-header></w3m-header>`)
    await element.updateComplete
  })

  describe('Network Selection', () => {
    const mockNetwork = {
      id: '1',
      name: 'Test Network',
      chainNamespace: 'eip155',
      caipNetworkId: 'eip155:1',
      nativeCurrency: { name: 'Test', symbol: 'TEST', decimals: 18 },
      rpcUrls: { default: { http: ['https://test.com'] } }
    } as unknown as CaipNetwork

    it('should render network select in Account view', async () => {
      RouterController.state.view = 'Account'
      element.requestUpdate()
      await element.updateComplete
      await elementUpdated(element)

      const networkSelect = HelpersUtil.getByTestId(element, 'w3m-account-select-network')
      expect(networkSelect).toBeTruthy()
    })

    it('should update network image when network changes', async () => {
      RouterController.state.view = 'Account'
      element.requestUpdate()
      await element.updateComplete

      const getNetworkImageSpy = vi.spyOn(AssetUtil, 'getNetworkImage')
      ChainController.setActiveCaipNetwork(mockNetwork)
      await elementUpdated(element)

      const networkSelect = HelpersUtil.getByTestId(element, 'w3m-account-select-network')
      expect(networkSelect?.getAttribute('active-network')).toBe('Test Network')
      expect(getNetworkImageSpy).toHaveBeenCalledWith(mockNetwork)
    })

    it('should update network image when AssetController emits new images', async () => {
      RouterController.state.view = 'Account'
      element.requestUpdate()
      await element.updateComplete

      let subscriberCallback: Function | undefined
      vi.spyOn(AssetController, 'subscribeNetworkImages').mockImplementation(callback => {
        subscriberCallback = callback
        return () => undefined
      })

      element = await fixture(html`<w3m-header></w3m-header>`)
      await element.updateComplete

      ChainController.setActiveCaipNetwork(mockNetwork)
      await elementUpdated(element)

      const getNetworkImageSpy = vi.spyOn(AssetUtil, 'getNetworkImage')

      // Simulate AssetController emitting new network images
      if (subscriberCallback) {
        subscriberCallback()
      }

      expect(getNetworkImageSpy).toHaveBeenCalledWith(mockNetwork)
    })
  })

  describe('Back Button', () => {
    it('should show back button when history length > 1', async () => {
      RouterController.push('Networks')
      await element.updateComplete
      await elementUpdated(element)

      const backButton = HelpersUtil.getByTestId(element, 'header-back')
      expect(backButton).toBeTruthy()
    })

    it('should not show back button in ApproveTransaction view', async () => {
      RouterController.state.view = 'ApproveTransaction'
      element.requestUpdate()
      await element.updateComplete
      await elementUpdated(element)

      const backButton = HelpersUtil.getByTestId(element, 'header-back')
      expect(backButton).toBeFalsy()
    })

    it('should call RouterController.goBack when back button is clicked', async () => {
      const goBackSpy = vi.spyOn(RouterController, 'goBack')
      RouterController.push('Networks')
      await element.updateComplete
      await elementUpdated(element)

      const backButton = HelpersUtil.getByTestId(element, 'header-back')
      backButton?.click()

      expect(goBackSpy).toHaveBeenCalled()
    })
  })

  describe('Close Button', () => {
    it('should render close button', async () => {
      const closeButton = HelpersUtil.getByTestId(element, 'w3m-header-close')
      expect(closeButton).toBeTruthy()
    })

    it('should call ModalController.close when close button is clicked', async () => {
      const closeSpy = vi.spyOn(ModalController, 'close')
      vi.spyOn(SIWXUtil, 'isSIWXCloseDisabled').mockResolvedValue(false)

      const closeButton = HelpersUtil.getByTestId(element, 'w3m-header-close')
      await closeButton?.click()

      expect(closeSpy).toHaveBeenCalled()
    })

    it('should shake modal when trying to close in UnsupportedChain view', async () => {
      const shakeSpy = vi.spyOn(ModalController, 'shake')
      RouterController.state.view = 'UnsupportedChain'
      element.requestUpdate()
      await element.updateComplete
      await elementUpdated(element)

      const closeButton = HelpersUtil.getByTestId(element, 'w3m-header-close')
      await closeButton?.click()

      expect(shakeSpy).toHaveBeenCalled()
    })
  })

  describe('Smart Sessions', () => {
    it('should show smart sessions button in Account view when enabled', async () => {
      RouterController.state.view = 'Account'
      OptionsController.state.features = { smartSessions: true }
      element.requestUpdate()
      await element.updateComplete
      await elementUpdated(element)

      const smartSessionsButton = HelpersUtil.getByTestId(element, 'w3m-header-smart-sessions')
      expect(smartSessionsButton).toBeTruthy()
    })

    it('should not show smart sessions button when disabled', async () => {
      RouterController.state.view = 'Account'
      OptionsController.state.features = { smartSessions: false }
      element.requestUpdate()
      await element.updateComplete
      await elementUpdated(element)

      const smartSessionsButton = HelpersUtil.getByTestId(element, 'w3m-header-smart-sessions')
      expect(smartSessionsButton).toBeFalsy()
    })

    it('should navigate to SmartSessionList when smart sessions button is clicked', async () => {
      RouterController.state.view = 'Account'
      OptionsController.state.features = { smartSessions: true }
      element.requestUpdate()
      await element.updateComplete
      await elementUpdated(element)

      const smartSessionsButton = HelpersUtil.getByTestId(element, 'w3m-header-smart-sessions')
      smartSessionsButton?.dispatchEvent(new Event('click'))

      expect(RouterController.state.view).toBe('SmartSessionList')
    })
  })

  describe('Help Button', () => {
    it('should show help button in Connect view', async () => {
      RouterController.state.view = 'Connect'
      element.requestUpdate()
      await element.updateComplete
      await elementUpdated(element)

      const helpButton = element.shadowRoot?.querySelector('wui-icon-link[icon="helpCircle"]')
      expect(helpButton).toBeTruthy()
    })

    it('should navigate to WhatIsAWallet when help button is clicked', async () => {
      RouterController.state.view = 'Connect'
      element.requestUpdate()
      await element.updateComplete
      await elementUpdated(element)

      const helpButton = element.shadowRoot?.querySelector('wui-icon-link[icon="helpCircle"]')
      helpButton?.dispatchEvent(new Event('click'))

      expect(RouterController.state.view).toBe('WhatIsAWallet')
    })

    it('should track help button click event', async () => {
      const trackSpy = vi.spyOn(EventsController, 'sendEvent')
      RouterController.state.view = 'Connect'
      element.requestUpdate()
      await element.updateComplete
      await elementUpdated(element)

      const helpButton = element.shadowRoot?.querySelector('wui-icon-link[icon="helpCircle"]')
      helpButton?.dispatchEvent(new Event('click'))

      expect(trackSpy).toHaveBeenCalledWith({ type: 'track', event: 'CLICK_WALLET_HELP' })
    })
  })
})
