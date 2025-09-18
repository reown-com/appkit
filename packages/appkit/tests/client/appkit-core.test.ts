import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ConstantsUtil } from '@reown/appkit-common'
import {
  type AccountState,
  ApiController,
  BlockchainApiController,
  ChainController,
  ConnectionController,
  ConnectorController,
  ModalController
} from '@reown/appkit-controllers'

import { AppKit } from '../../src/client/appkit-core'
import { mockOptions } from '../mocks/Options'
import { mockBlockchainApiController, mockStorageUtil, mockWindowAndDocument } from '../test-utils'

describe('AppKitCore', () => {
  let appKit: AppKit

  beforeEach(() => {
    appKit = new AppKit(mockOptions)
    mockWindowAndDocument()
    mockStorageUtil()
    mockBlockchainApiController()
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
      vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
        caipAddress: undefined
      } as unknown as AccountState)
    })

    it('should open modal when not connected', async () => {
      const modalSpy = vi.spyOn(ModalController, 'open')
      await appKit.open({ view: 'Connect' })
      expect(modalSpy).toHaveBeenCalledWith({ view: 'Connect' })
    })

    it('should not open modal when connected', async () => {
      vi.spyOn(ConnectorController, 'isConnected').mockReturnValue(true)
      appKit = new AppKit({
        ...mockOptions
      })

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
      vi.spyOn(ApiController, 'initializeExcludedWallets')

      new AppKit({
        ...mockOptions,
        excludeWalletIds: ['eoa', 'ordinal']
      })

      expect(ApiController.initializeExcludedWallets).not.toHaveBeenCalled()
    })
  })

  describe('syncAccount', () => {
    let appKit: AppKit
    const mockParams = {
      address: '0x123',
      chainId: '1',
      chainNamespace: ConstantsUtil.CHAIN.EVM
    }

    beforeEach(() => {
      appKit = new AppKit({
        ...mockOptions
      })
    })

    it('should not make any blockchain API calls', async () => {
      const blockchainApiSpy = vi.spyOn(BlockchainApiController, 'fetchIdentity')

      await appKit.syncBalance(mockParams)
      await appKit.syncIdentity(mockParams)

      expect(blockchainApiSpy).not.toHaveBeenCalled()
    })
  })
})
