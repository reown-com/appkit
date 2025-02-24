import { UniversalProvider } from '@walletconnect/universal-provider'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { ChainNamespace } from '@reown/appkit-common'
import { ChainController, ConnectorController } from '@reown/appkit-core'

import { AppKit } from '../../src/client.js'
import { mockBitcoinAdapter } from '../mocks/Adapter.js'
import { bitcoin } from '../mocks/Networks.js'
import { mockOptions } from '../mocks/Options.js'
import { mockUniversalProvider } from '../mocks/Providers.js'
import { mockBlockchainApiController, mockStorageUtil, mockWindowAndDocument } from '../test-utils'

mockWindowAndDocument()
mockStorageUtil()
mockBlockchainApiController()

describe('Adapter Management', () => {
  beforeEach(() => {
    vi.spyOn(UniversalProvider, 'init').mockResolvedValue(mockUniversalProvider)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('addAdapter', () => {
    it('should add a new adapter successfully', () => {
      const addAdapter = vi.spyOn(ChainController, 'addAdapter')

      const appKit = new AppKit(mockOptions)

      appKit.addAdapter(mockBitcoinAdapter, [bitcoin])

      expect(appKit.chainAdapters?.bip122).toBeDefined()
      expect(appKit.chainNamespaces).toContain('bip122')
      expect(addAdapter).toHaveBeenCalledWith(
        mockBitcoinAdapter,
        {
          connectionControllerClient: expect.any(Object),
          networkControllerClient: expect.any(Object)
        },
        expect.any(Array)
      )
    })

    it('should not add adapter if clients are not initialized', () => {
      const appKit = new AppKit(mockOptions)

      // Remove clients
      ;(appKit as any).connectionControllerClient = undefined
      ;(appKit as any).networkControllerClient = undefined

      appKit.addAdapter(mockBitcoinAdapter, [bitcoin])

      expect(appKit.chainAdapters?.bip122).toBeUndefined()
    })

    it('should not add adapter if chainAdapters is not initialized', () => {
      const addAdapter = vi.spyOn(ChainController, 'addAdapter')

      const appKit = new AppKit(mockOptions)
      const initChainAdapter = vi.spyOn(appKit as any, 'initChainAdapter')
      const createAdapter = vi.spyOn(appKit as any, 'createAdapter')
      // Remove chainAdapters
      ;(appKit as any).chainAdapters = undefined

      appKit.addAdapter(mockBitcoinAdapter, [bitcoin])

      expect(createAdapter).not.toHaveBeenCalled()
      expect(initChainAdapter).not.toHaveBeenCalled()
      expect(addAdapter).not.toHaveBeenCalled()
    })
  })

  describe('removeAdapter', () => {
    it('should remove an existing adapter successfully', () => {
      const removeAdapter = vi.spyOn(ChainController, 'removeAdapter')
      const removeConnectorAdapter = vi.spyOn(ConnectorController, 'removeAdapter')

      const appKit = new AppKit(mockOptions)
      appKit.removeAdapter('eip155')

      expect(appKit.chainAdapters?.eip155).toBeUndefined()
      expect(appKit.chainNamespaces).not.toContain('eip155')
      expect(removeAdapter).toHaveBeenCalledWith('eip155')
      expect(removeConnectorAdapter).toHaveBeenCalledWith('eip155')
    })

    it('should not remove adapter if user is connected', () => {
      const removeAdapter = vi.spyOn(ChainController, 'removeAdapter')
      const removeConnectorAdapter = vi.spyOn(ConnectorController, 'removeAdapter')
      vi.spyOn(ChainController.state, 'activeCaipAddress', 'get').mockReturnValue('eip155:1:0x123')

      const appKit = new AppKit(mockOptions)
      appKit.removeAdapter('eip155')

      expect(appKit.chainAdapters?.eip155).toBeDefined()
      expect(appKit.chainNamespaces).toContain('eip155')
      expect(removeAdapter).not.toHaveBeenCalled()
      expect(removeConnectorAdapter).not.toHaveBeenCalled()

      vi.spyOn(ChainController.state, 'activeCaipAddress', 'get').mockClear()
    })

    it('should not remove adapter if adapter does not exist', () => {
      const removeAdapter = vi.spyOn(ChainController, 'removeAdapter')
      const removeConnectorAdapter = vi.spyOn(ConnectorController, 'removeAdapter')

      const appKit = new AppKit(mockOptions)
      appKit.removeAdapter('bip122' as ChainNamespace)

      expect(removeAdapter).not.toHaveBeenCalled()
      expect(removeConnectorAdapter).not.toHaveBeenCalled()
    })

    it('should not remove adapter if chainAdapters is not initialized', () => {
      const appKit = new AppKit(mockOptions)
      // Remove chainAdapters
      ;(appKit as any).chainAdapters = undefined
      appKit.removeAdapter('eip155')

      expect(ChainController.removeAdapter).not.toHaveBeenCalled()
      expect(ConnectorController.removeAdapter).not.toHaveBeenCalled()
    })
  })
})
