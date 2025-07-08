import UniversalProvider from '@walletconnect/universal-provider'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { type AppKitNetwork } from '@reown/appkit-common'
import {
  AlertController,
  ApiController,
  ChainController,
  ConstantsUtil,
  EventsController,
  OptionsController,
  PublicStateController,
  StorageUtil
} from '@reown/appkit-controllers'
import { ErrorUtil } from '@reown/appkit-utils'

import { AppKit } from '../../src/client/appkit.js'
import { mainnet, polygon, sepolia, solana } from '../mocks/Networks'
import { mockOptions, mockRemoteFeaturesConfig } from '../mocks/Options'
import { mockUniversalProvider } from '../mocks/Providers.js'
import {
  mockBlockchainApiController,
  mockRemoteFeatures,
  mockStorageUtil,
  mockWindowAndDocument
} from '../test-utils.js'

describe('Base', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(UniversalProvider, 'init').mockResolvedValue(mockUniversalProvider as any)
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
      const sendEvent = vi.spyOn(EventsController, 'sendEvent')

      const appKit = new AppKit({
        ...mockOptions,
        universalProvider: mockUniversalProvider as unknown as UniversalProvider
      })
      const options = { ...mockOptions }
      delete options.adapters

      await appKit.ready()

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

      const appKit = new AppKit(mockOptions)

      await appKit.ready()

      expect(setEIP6963Enabled).toHaveBeenCalledWith(true)
    })

    it('should set EIP6963 disabled when option is disabled in config', async () => {
      const setEIP6963Enabled = vi.spyOn(OptionsController, 'setEIP6963Enabled')

      const appKit = new AppKit({
        ...mockOptions,
        enableEIP6963: false
      })

      await appKit.ready()

      expect(setEIP6963Enabled).toHaveBeenCalledWith(false)
    })

    it('should use default account types when no account types are set', async () => {
      vi.spyOn(StorageUtil, 'getPreferredAccountTypes').mockReturnValueOnce(
        ConstantsUtil.DEFAULT_ACCOUNT_TYPES
      )

      const appKit = new AppKit(mockOptions)

      await appKit.ready()

      expect(
        ChainController.state.chains.get('eip155')?.accountState?.preferredAccountType
      ).toEqual('smartAccount')
    })

    it('should set default account types', async () => {
      vi.spyOn(StorageUtil, 'getPreferredAccountTypes').mockReturnValueOnce({
        bip122: 'ordinal'
      })

      const appKit = new AppKit({
        ...mockOptions,
        defaultAccountTypes: {
          eip155: 'eoa'
        }
      })

      await appKit.ready()

      expect(
        ChainController.state.chains.get('eip155')?.accountState?.preferredAccountType
      ).toEqual('eoa')
    })

    it('should use stored account types', () => {
      vi.spyOn(StorageUtil, 'getPreferredAccountTypes').mockReturnValueOnce({
        eip155: 'eoa',
        bip122: 'ordinal'
      })
      const setDefaultAccountTypes = vi.spyOn(OptionsController, 'setDefaultAccountTypes')

      new AppKit(mockOptions)

      expect(setDefaultAccountTypes).toHaveBeenCalledWith(undefined)
    })

    it('should use default network prop when defaultNetwork prop is not included in the networks array', async () => {
      vi.spyOn(StorageUtil, 'getActiveCaipNetworkId').mockReturnValueOnce(undefined)
      const setActiveCaipNetwork = vi.spyOn(ChainController, 'setActiveCaipNetwork')

      const appKit = new AppKit({
        ...mockOptions,
        defaultNetwork: polygon
      })

      await appKit.ready()

      expect(setActiveCaipNetwork).toHaveBeenCalledWith(mainnet)
    })

    it('should use default network prop when there is no network in storage', async () => {
      vi.spyOn(StorageUtil, 'getActiveCaipNetworkId').mockReturnValueOnce(undefined)
      const setActiveCaipNetwork = vi.spyOn(ChainController, 'setActiveCaipNetwork')

      const appKit = new AppKit({
        ...mockOptions,
        defaultNetwork: sepolia
      })

      await appKit.ready()

      expect(setActiveCaipNetwork).toHaveBeenCalledWith(sepolia)
    })

    it('should not use default network prop when there is a network in storage', async () => {
      vi.spyOn(StorageUtil, 'getActiveCaipNetworkId').mockReturnValueOnce(sepolia.caipNetworkId)
      const setActiveCaipNetwork = vi.spyOn(ChainController, 'setActiveCaipNetwork')

      const appKit = new AppKit({
        ...mockOptions,
        defaultNetwork: polygon
      })

      await appKit.ready()

      expect(setActiveCaipNetwork).toHaveBeenCalledWith(sepolia)
    })

    it('should check allowed origins if social or email feature is enabled', async () => {
      const fetchAllowedOriginsSpy = vi
        .spyOn(ApiController, 'fetchAllowedOrigins')
        .mockResolvedValue([window.location.origin])

      const appKit = new AppKit({
        ...mockOptions
      })

      await appKit.ready()

      expect(fetchAllowedOriginsSpy).toHaveBeenCalled()
    })

    it('should check if OptionsController.state.remoteFeatures is correctly updated', async () => {
      const appKit = new AppKit({
        ...mockOptions
      })

      await appKit.ready()

      expect(OptionsController.state.remoteFeatures).toEqual(mockRemoteFeaturesConfig)
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
