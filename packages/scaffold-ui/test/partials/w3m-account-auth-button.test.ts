import { W3mAccountAuthButton } from '../../src/partials/w3m-account-auth-button'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { elementUpdated, fixture } from '@open-wc/testing'
import { html } from 'lit'
import {
  ChainController,
  ConnectorController,
  RouterController,
  StorageUtil,
  type ChainControllerState
} from '@reown/appkit-core'
import type { W3mFrameProvider } from '@reown/appkit-wallet'
import { HelpersUtil } from '../utils/HelpersUtil'

describe('W3mAccountAuthButton', () => {
  const mockSocialProvider = 'google'
  const mockSocialUsername = 'testUsername'
  const mockAuthConnector = {
    id: 'ID_AUTH',
    type: 'AUTH' as const,
    chain: 'eip155' as const,
    provider: {
      getEmail: () => 'testEmail'
    } as W3mFrameProvider
  }

  beforeEach(() => {
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      activeChain: 'eip155'
    } as ChainControllerState)

    vi.spyOn(StorageUtil, 'getConnectedSocialProvider').mockReturnValue(mockSocialProvider)
    vi.spyOn(StorageUtil, 'getConnectedSocialUsername').mockReturnValue(mockSocialUsername)
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue(mockAuthConnector)
    vi.spyOn(StorageUtil, 'getConnectedConnector').mockReturnValue('ID_AUTH')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('render', () => {
    it('should not render if there is no active namespace', async () => {
      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        activeChain: undefined
      } as ChainControllerState)
      const element: W3mAccountAuthButton = await fixture(
        html`<w3m-account-auth-button></w3m-account-auth-button>`
      )

      expect(HelpersUtil.querySelect(element, 'wui-list-item')).toBeNull()
    })

    it('should not render if there is no connector', async () => {
      vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue(undefined)
      const element: W3mAccountAuthButton = await fixture(
        html`<w3m-account-auth-button></w3m-account-auth-button>`
      )

      expect(HelpersUtil.querySelect(element, 'wui-list-item')).toBeNull()
    })

    it('should not render if the connector type is not ID_AUTH', async () => {
      vi.spyOn(StorageUtil, 'getConnectedConnector').mockReturnValue('ANNOUNCED')

      const element: W3mAccountAuthButton = await fixture(
        html`<w3m-account-auth-button></w3m-account-auth-button>`
      )

      expect(HelpersUtil.querySelect(element, 'wui-list-item')).toBeNull()
    })

    it('should render correctly', async () => {
      const element: W3mAccountAuthButton = await fixture(
        html`<w3m-account-auth-button></w3m-account-auth-button>`
      )

      const listItem = HelpersUtil.querySelect(element, 'wui-list-item')
      expect(listItem).toBeDefined()

      expect(listItem.getAttribute('icon')).toBe(mockSocialProvider)
      expect(listItem.getAttribute('iconSize')).toBe('xxl')

      const text = HelpersUtil.querySelect(element, 'wui-text')
      expect(text).toBeDefined()
      expect(HelpersUtil.getTextContent(text)).toBe(mockSocialUsername)
    })
  })

  describe('onGoToUpdateEmail', () => {
    it('should call RouterController.push with correct arguments', async () => {
      vi.spyOn(StorageUtil, 'getConnectedSocialProvider').mockReturnValue(undefined)
      const routerControllerSpy = vi.spyOn(RouterController, 'push')
      const element: W3mAccountAuthButton = await fixture(
        html`<w3m-account-auth-button></w3m-account-auth-button>`
      )

      element.requestUpdate()
      await elementUpdated(element)

      const listItem = HelpersUtil.querySelect(element, 'wui-list-item')
      listItem?.dispatchEvent(new Event('click'))

      expect(routerControllerSpy).toHaveBeenCalledTimes(1)
      expect(routerControllerSpy).toHaveBeenCalledWith('UpdateEmailWallet', { email: 'testEmail' })
    })

    it('should not call RouterController.push if socialProvider is not null', async () => {
      const routerControllerSpy = vi.spyOn(RouterController, 'push')
      const element: W3mAccountAuthButton = await fixture(
        html`<w3m-account-auth-button></w3m-account-auth-button>`
      )

      element.requestUpdate()
      await elementUpdated(element)

      const listItem = HelpersUtil.querySelect(element, 'wui-list-item')
      listItem?.dispatchEvent(new Event('click'))

      expect(routerControllerSpy).not.toHaveBeenCalled()
    })
  })

  describe('getAuthName', () => {
    it('should return email if socialProvider is null', async () => {
      vi.spyOn(StorageUtil, 'getConnectedSocialUsername').mockReturnValue(undefined)
      const element: W3mAccountAuthButton = await fixture(
        html`<w3m-account-auth-button></w3m-account-auth-button>`
      )

      const text = HelpersUtil.querySelect(element, 'wui-text')
      expect(HelpersUtil.getTextContent(text)).toBe('testEmail')
    })

    it('should return socialUsername if socialProvider is not null', async () => {
      const element: W3mAccountAuthButton = await fixture(
        html`<w3m-account-auth-button></w3m-account-auth-button>`
      )

      const text = HelpersUtil.querySelect(element, 'wui-text')
      expect(HelpersUtil.getTextContent(text)).toBe(mockSocialUsername)
    })
  })
})
