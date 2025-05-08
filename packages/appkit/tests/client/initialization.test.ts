import UniversalProvider from '@walletconnect/universal-provider'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { type AppKitNetwork } from '@reown/appkit-common'
import {
  AlertController,
  ApiController,
  ChainController,
  EventsController,
  OptionsController,
  PublicStateController,
  StorageUtil
} from '@reown/appkit-controllers'
import { ErrorUtil } from '@reown/appkit-utils'

import { AppKit } from '../../src/client/appkit.js'
import { mainnet, polygon, sepolia, solana } from '../mocks/Networks'
import { mockOptions } from '../mocks/Options'
import { mockUniversalProvider } from '../mocks/Providers.js'
import {
  mockBlockchainApiController,
  mockRemoteFeatures,
  mockStorageUtil,
  mockWindowAndDocument
} from '../test-utils.js'

describe('Base', () => {
  beforeEach(() => {
    mockWindowAndDocument()
    mockStorageUtil()
    mockBlockchainApiController()
    mockRemoteFeatures()
  })

  describe('Base Initialization', () => {
    it('should initialize controllers', async () => {
      const initialize = vi.spyOn(ChainController, 'initialize')

      new AppKit(mockOptions)

      await new Promise(resolve => {
        const unsubscribe = PublicStateController.subscribe(state => {
          if (state.initialized) {
            unsubscribe()
            resolve(true)
          }
        })
      })

      expect(initialize).toHaveBeenCalledOnce()

      expect(initialize).toHaveBeenCalledWith(mockOptions.adapters, [mainnet, sepolia, solana], {
        connectionControllerClient: expect.any(Object),
        networkControllerClient: expect.any(Object)
      })
    })

    it('should send initialize event', async () => {
      const sendEvent = vi.spyOn(EventsController, 'sendEvent').mockResolvedValue()

      new AppKit({
        ...mockOptions,
        universalProvider: mockUniversalProvider as unknown as UniversalProvider
      })
      const options = { ...mockOptions }
      delete options.adapters

      await new Promise(resolve => {
        const unsubscribe = PublicStateController.subscribe(state => {
          if (state.initialized) {
            unsubscribe()
            resolve(true)
          }
        })
      })

      expect(sendEvent).toHaveBeenCalledWith({
        type: 'track',
        event: 'INITIALIZE',
        properties: {
          ...options,
          networks: options.networks.map((n: AppKitNetwork) => n.id),
          siweConfig: {
            options: options.siweConfig?.options || {}
          }
        }
      })
    })
    it('should set EIP6963 enabled by default', async () => {
      const setEIP6963Enabled = vi.spyOn(OptionsController, 'setEIP6963Enabled')

      new AppKit(mockOptions)

      await new Promise(resolve => {
        const unsubscribe = PublicStateController.subscribe(state => {
          if (state.initialized) {
            unsubscribe()
            resolve(true)
          }
        })
      })

      expect(setEIP6963Enabled).toHaveBeenCalledWith(true)
    })

    it('should set EIP6963 disabled when option is disabled in config', async () => {
      const setEIP6963Enabled = vi.spyOn(OptionsController, 'setEIP6963Enabled')

      new AppKit({
        ...mockOptions,
        enableEIP6963: false
      })

      await new Promise(resolve => {
        const unsubscribe = PublicStateController.subscribe(state => {
          if (state.initialized) {
            unsubscribe()
            resolve(true)
          }
        })
      })

      expect(setEIP6963Enabled).toHaveBeenCalledWith(false)
    })

    it('should set partially defaultAccountType', async () => {
      const setDefaultAccountTypes = vi.spyOn(OptionsController, 'setDefaultAccountTypes')

      new AppKit({
        ...mockOptions,
        defaultAccountTypes: {
          eip155: 'eoa',
          bip122: 'ordinal'
        }
      })

      await new Promise(resolve => {
        const unsubscribe = PublicStateController.subscribe(state => {
          if (state.initialized) {
            unsubscribe()
            resolve(true)
          }
        })
      })

      expect(setDefaultAccountTypes).toHaveBeenCalledWith({
        eip155: 'eoa',
        bip122: 'ordinal'
      })
    })

    it('should use default network prop when defaultNetwork prop is not included in the networks array', async () => {
      vi.spyOn(StorageUtil, 'getActiveCaipNetworkId').mockReturnValueOnce(undefined)
      const setActiveCaipNetwork = vi.spyOn(ChainController, 'setActiveCaipNetwork')

      new AppKit({
        ...mockOptions,
        defaultNetwork: polygon
      })

      await new Promise(resolve => {
        const unsubscribe = PublicStateController.subscribe(state => {
          if (state.initialized) {
            unsubscribe()
            resolve(true)
          }
        })
      })

      expect(setActiveCaipNetwork).toHaveBeenCalledWith(mainnet)
    })

    it('should use default network prop when there is no network in storage', async () => {
      vi.spyOn(StorageUtil, 'getActiveCaipNetworkId').mockReturnValueOnce(undefined)
      const setActiveCaipNetwork = vi.spyOn(ChainController, 'setActiveCaipNetwork')

      new AppKit({
        ...mockOptions,
        defaultNetwork: sepolia
      })

      await new Promise(resolve => {
        const unsubscribe = PublicStateController.subscribe(state => {
          if (state.initialized) {
            unsubscribe()
            resolve(true)
          }
        })
      })

      expect(setActiveCaipNetwork).toHaveBeenCalledWith(sepolia)
    })

    it('should not use default network prop when there is a network in storage', async () => {
      vi.spyOn(StorageUtil, 'getActiveCaipNetworkId').mockReturnValueOnce(sepolia.caipNetworkId)
      const setActiveCaipNetwork = vi.spyOn(ChainController, 'setActiveCaipNetwork')

      new AppKit({
        ...mockOptions,
        defaultNetwork: polygon
      })

      await new Promise(resolve => {
        const unsubscribe = PublicStateController.subscribe(state => {
          if (state.initialized) {
            unsubscribe()
            resolve(true)
          }
        })
      })

      expect(setActiveCaipNetwork).toHaveBeenCalledWith(sepolia)
    })

    it('should check allowed origins if social or email feature is enabled', async () => {
      const fetchAllowedOriginsSpy = vi
        .spyOn(ApiController, 'fetchAllowedOrigins')
        .mockResolvedValue([window.location.origin])

      new AppKit({
        ...mockOptions
      })

      await new Promise(resolve => {
        const unsubscribe = PublicStateController.subscribe(state => {
          if (state.initialized) {
            unsubscribe()
            resolve(true)
          }
        })
      })

      expect(fetchAllowedOriginsSpy).toHaveBeenCalled()
    })
  })

  describe('Alert Errors', () => {
    it('should handle alert errors based on error messages', () => {
      const open = vi.spyOn(AlertController, 'open')

      const errors = [
        {
          alert: ErrorUtil.ALERT_ERRORS.INVALID_APP_CONFIGURATION,
          message:
            'Error: WebSocket connection closed abnormally with code: 3000 (Unauthorized: origin not allowed)'
        },
        {
          alert: ErrorUtil.ALERT_ERRORS.JWT_TOKEN_NOT_VALID,
          message:
            'WebSocket connection closed abnormally with code: 3000 (JWT validation error: JWT Token is not yet valid:)'
        },
        {
          alert: ErrorUtil.ALERT_ERRORS.INVALID_PROJECT_ID,
          message:
            'Uncaught Error: WebSocket connection closed abnormally with code: 3000 (Unauthorized: invalid key)'
        }
      ]

      const appKit = new AppKit(mockOptions)

      for (const { alert, message } of errors) {
        // @ts-expect-error
        appKit.handleAlertError(new Error(message))
        expect(open).toHaveBeenCalledWith(alert, 'error')
      }
    })
  })
})
