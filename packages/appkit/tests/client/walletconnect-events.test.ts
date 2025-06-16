import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import type { ChainNamespace } from '@reown/appkit-common'
import { ChainController, ConnectionController, StorageUtil } from '@reown/appkit-controllers'

import { AppKit } from '../../src/client/appkit.js'
import { mainnet, sepolia } from '../mocks/Networks.js'
import { mockOptions } from '../mocks/Options.js'
import { mockUniversalProvider } from '../mocks/Providers.js'
import {
  mockBlockchainApiController,
  mockRemoteFeatures,
  mockStorageUtil,
  mockWindowAndDocument
} from '../test-utils.js'

describe('WalletConnect Events', () => {
  beforeAll(() => {
    mockWindowAndDocument()
    mockStorageUtil()
    mockBlockchainApiController()
    mockRemoteFeatures()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('chainChanged', () => {
    it('should call setUnsupportedNetwork', async () => {
      const appkit = new AppKit({
        ...mockOptions,
        adapters: [],
        universalProvider: mockUniversalProvider as any
      })
      await appkit.ready()
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

    it('should not call setCaipNetwork if any of the namespaces is connected', async () => {
      vi.spyOn(StorageUtil, 'getConnectedConnectorId').mockImplementation(namespace => {
        if (namespace === 'solana') {
          return 'WALLET_CONNECT'
        }

        return undefined
      })
      const appkit = new AppKit({
        ...mockOptions,
        adapters: [],
        universalProvider: mockUniversalProvider as any
      })
      await appkit.ready()
      const setActiveCaipNetwork = vi.spyOn(ChainController, 'setActiveCaipNetwork')

      const chainChangedCallback = mockUniversalProvider.on.mock.calls.find(
        ([event]) => event === 'chainChanged'
      )?.[1]

      if (!chainChangedCallback) {
        throw new Error('chainChanged callback not found')
      }

      chainChangedCallback(sepolia.id)
      expect(setActiveCaipNetwork).not.toHaveBeenCalledWith(sepolia)

      chainChangedCallback(mainnet.id.toString())
      expect(setActiveCaipNetwork).not.toHaveBeenCalledWith(mainnet)
    })

    it('should call setCaipNetwork any of the namespaces is not connected', async () => {
      vi.spyOn(StorageUtil, 'getConnectedConnectorId').mockImplementation(() => {
        return undefined
      })

      const appkit = new AppKit({
        ...mockOptions,
        networks: [mainnet, sepolia],
        adapters: [],
        universalProvider: mockUniversalProvider as any
      })
      await appkit.ready()
      const setActiveCaipNetwork = vi.spyOn(ChainController, 'setActiveCaipNetwork')

      const chainChangedCallback = mockUniversalProvider.on.mock.calls.find(
        ([event]) => event === 'chainChanged'
      )?.[1]

      if (!chainChangedCallback) {
        throw new Error('chainChanged callback not found')
      }

      chainChangedCallback(sepolia.id.toString())
      expect(setActiveCaipNetwork).toHaveBeenCalledWith(sepolia)
    })
  })

  describe('display_uri', () => {
    it('should call openUri', async () => {
      const appkit = new AppKit({
        ...mockOptions,
        adapters: [],
        universalProvider: mockUniversalProvider as any
      })
      await appkit.ready()
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

  describe('connect', () => {
    it('should call finalizeWcConnection once connected', async () => {
      const finalizeWcConnectionSpy = vi
        .spyOn(ConnectionController, 'finalizeWcConnection')
        .mockReturnValueOnce()
      mockUniversalProvider.on.mockClear()

      const appkit = new AppKit({
        ...mockOptions,
        adapters: [],
        universalProvider: mockUniversalProvider as any
      })
      await appkit.ready()

      const connectCallback = mockUniversalProvider.on.mock.calls.find(
        ([event]) => event === 'connect'
      )?.[1]

      if (!connectCallback) {
        throw new Error('connect callback not found')
      }

      connectCallback()

      expect(finalizeWcConnectionSpy).toHaveBeenCalledOnce()
    })
  })
})
