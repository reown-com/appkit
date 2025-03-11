import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  AccountController,
  type AccountControllerState,
  ApiController,
  ConnectionController,
  ModalController
} from '@reown/appkit-controllers'

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

  describe('close', () => {
    it('should call finalizeWcConnection when manualWCControl is true', async () => {
      vi.spyOn(ConnectionController, 'finalizeWcConnection')
      const appKit = new AppKit({ ...mockOptions, manualWCControl: true })
      await appKit.close()
      expect(ConnectionController.finalizeWcConnection).toHaveBeenCalled()
    })

    it('should not call finalizeWcConnection when manualWCControl is false', async () => {
      vi.spyOn(ConnectionController, 'finalizeWcConnection')
      const appKit = new AppKit({ ...mockOptions, manualWCControl: false })
      await appKit.close()
      expect(ConnectionController.finalizeWcConnection).not.toHaveBeenCalled()
    })
  })

  describe('initialize', () => {
    it('should not initialize excluded wallet rdns if basic is true', () => {
      vi.spyOn(ApiController, 'initializeExcludedWalletRdns')

      new AppKit({
        ...mockOptions,
        excludeWalletIds: ['eoa', 'ordinal']
      })

      expect(ApiController.initializeExcludedWalletRdns).not.toHaveBeenCalled()
    })
  })
})
