import { describe, expect, it, vi } from 'vitest'

import { ChainController, ConnectionController } from '@reown/appkit-core'

import { AppKit } from '../../src/client'
import { mainnet, sepolia } from '../mocks/Networks'
import { mockOptions } from '../mocks/Options'
import { mockUniversalProvider } from '../mocks/Providers'
import { mockBlockchainApiController, mockStorageUtil, mockWindowAndDocument } from '../test-utils'

mockWindowAndDocument()
mockStorageUtil()
mockBlockchainApiController()

describe('WalletConnect Events', () => {
  describe('chainChanged', () => {
    it('should call setUnsupportedNetwork', () => {
      const appkit = new AppKit({
        ...mockOptions,
        adapters: [],
        universalProvider: mockUniversalProvider as any
      })
      const setUnsupportedNetworkSpy = vi.spyOn(appkit as any, 'setUnsupportedNetwork')
      const chainChangedCallback = mockUniversalProvider.on.mock.calls.find(
        ([event]) => event === 'chainChanged'
      )?.[1]

      if (!chainChangedCallback) {
        throw new Error('chainChanged callback not found')
      }

      chainChangedCallback('unknown_chain_id')

      expect(setUnsupportedNetworkSpy).toHaveBeenCalledWith('unknown_chain_id')
    })

    it('should call setCaipNetwork', () => {
      new AppKit({
        ...mockOptions,
        adapters: [],
        universalProvider: mockUniversalProvider as any
      })
      const setActiveCaipNetwork = vi.spyOn(ChainController, 'setActiveCaipNetwork')

      const chainChangedCallback = mockUniversalProvider.on.mock.calls.find(
        ([event]) => event === 'chainChanged'
      )?.[1]

      if (!chainChangedCallback) {
        throw new Error('chainChanged callback not found')
      }

      chainChangedCallback(sepolia.id)
      expect(setActiveCaipNetwork).toHaveBeenCalledWith(sepolia)

      chainChangedCallback(mainnet.id.toString())
      expect(setActiveCaipNetwork).toHaveBeenCalledWith(mainnet)
    })
  })

  describe('display_uri', () => {
    it('should call openUri', () => {
      new AppKit({
        ...mockOptions,
        adapters: [],
        universalProvider: mockUniversalProvider as any
      })

      const setUriSpy = vi.spyOn(ConnectionController, 'setUri')
      const displayUriCallback = mockUniversalProvider.on.mock.calls.find(
        ([event]) => event === 'display_uri'
      )?.[1]

      if (!displayUriCallback) {
        throw new Error('display_uri callback not found')
      }

      displayUriCallback('mock_uri')
      expect(setUriSpy).toHaveBeenCalledWith('mock_uri')
    })
  })
})
