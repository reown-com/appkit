import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AccountController, type AccountControllerState, ModalController } from '@reown/appkit-core'

import { AppKit } from '../../src/client/appkit-basic'
import { mockOptions } from '../mocks/Options'
import { mockBlockchainApiController, mockStorageUtil, mockWindowAndDocument } from '../test-utils'

mockWindowAndDocument()
mockStorageUtil()
mockBlockchainApiController()

describe('AppKitBasic', () => {
  let appKit: AppKit

  beforeEach(() => {
    appKit = new AppKit(mockOptions)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should have valid default state', () => {
    expect(appKit.activeAdapter).toBeUndefined()
    expect(appKit.adapters).toBeUndefined()
    expect(appKit.activeChainNamespace).toBeUndefined()
    expect(appKit.adapter).toBeUndefined()
  })

  describe('open', () => {
    beforeEach(() => {
      vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
        caipAddress: undefined
      } as unknown as AccountControllerState)
    })

    it('should open modal when not connected', async () => {
      const modalSpy = vi.spyOn(ModalController, 'open')
      await appKit.open({ view: 'Connect' })
      expect(modalSpy).toHaveBeenCalledWith({ view: 'Connect' })
    })

    it('should not open modal when connected', async () => {
      vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
        caipAddress: 'eip155:1:0x123'
      } as unknown as AccountControllerState)
      const modalSpy = vi.spyOn(ModalController, 'open')

      await appKit.open({ view: 'Connect' })

      expect(modalSpy).not.toHaveBeenCalled()
    })
  })
})
