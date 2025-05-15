import UniversalProvider from '@walletconnect/universal-provider'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { type AppKitNetwork } from '@reown/appkit-common'
import {
  AccountController,
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
import { mockOptions } from '../mocks/Options'
import { mockUniversalProvider } from '../mocks/Providers.js'
import {
  mockBlockchainApiController,
  mockStorageUtil,
  mockWindowAndDocument
} from '../test-utils.js'

describe('Base', () => {
  beforeEach(() => {
    mockWindowAndDocument()
    mockStorageUtil()
    mockBlockchainApiController()
  })

  describe('Base Initialization', () => {
    it('should initialize controllers', async () => {
      const initialize = vi.spyOn(ChainController, 'initialize')

      new AppKit(mockOptions)

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

      // Event is sent at the end of the initialize method, we need to wait for it to be sent
      await new Promise(resolve =>
        PublicStateController.subscribe(state => {
          if (state.initialized) {
            resolve(true)
          }
        })
      )

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
    it('should set EIP6963 enabled by default', () => {
      const setEIP6963Enabled = vi.spyOn(OptionsController, 'setEIP6963Enabled')

      new AppKit(mockOptions)

      expect(setEIP6963Enabled).toHaveBeenCalledWith(true)
    })

    it('should set EIP6963 disabled when option is disabled in config', () => {
      const setEIP6963Enabled = vi.spyOn(OptionsController, 'setEIP6963Enabled')

      new AppKit({
        ...mockOptions,
        enableEIP6963: false
      })

      expect(setEIP6963Enabled).toHaveBeenCalledWith(false)
    })

    it('should set default account types', () => {
      const setDefaultAccountTypes = vi.spyOn(OptionsController, 'setDefaultAccountTypes')
      const setPreferredAccountTypes = vi.spyOn(AccountController, 'setPreferredAccountTypes')
      vi.spyOn(StorageUtil, 'getPreferredAccountTypes').mockReturnValueOnce({
        bip122: 'ordinal'
      })

      new AppKit({
        ...mockOptions,
        defaultAccountTypes: {
          eip155: 'eoa'
        }
      })

      expect(setDefaultAccountTypes).toHaveBeenCalledWith({
        eip155: 'eoa'
      })
      expect(setPreferredAccountTypes).toHaveBeenCalledWith({
        eip155: 'eoa',
        bip122: 'ordinal',
        solana: 'eoa',
        polkadot: 'eoa'
      })
    })

    it('should use default account types when no account types are set', () => {
      vi.spyOn(StorageUtil, 'getPreferredAccountTypes').mockReturnValueOnce(
        ConstantsUtil.DEFAULT_ACCOUNT_TYPES
      )
      const setPreferredAccountTypes = vi.spyOn(AccountController, 'setPreferredAccountTypes')

      new AppKit(mockOptions)

      expect(setPreferredAccountTypes).toHaveBeenCalledWith(ConstantsUtil.DEFAULT_ACCOUNT_TYPES)
    })

    it('should use stored account types', () => {
      vi.spyOn(StorageUtil, 'getPreferredAccountTypes').mockReturnValueOnce({
        eip155: 'eoa',
        bip122: 'ordinal'
      })
      const setPreferredAccountTypes = vi.spyOn(AccountController, 'setPreferredAccountTypes')
      const setDefaultAccountTypes = vi.spyOn(OptionsController, 'setDefaultAccountTypes')

      new AppKit(mockOptions)

      expect(setDefaultAccountTypes).toHaveBeenCalledWith(undefined)
      expect(setPreferredAccountTypes).toHaveBeenCalledWith({
        eip155: 'eoa',
        bip122: 'ordinal',
        solana: 'eoa',
        polkadot: 'eoa'
      })
    })

    it('should use default network prop when defaultNetwork prop is not included in the networks array', () => {
      vi.spyOn(StorageUtil, 'getActiveCaipNetworkId').mockReturnValueOnce(undefined)
      const setActiveCaipNetwork = vi.spyOn(ChainController, 'setActiveCaipNetwork')

      new AppKit({
        ...mockOptions,
        defaultNetwork: polygon
      })

      expect(setActiveCaipNetwork).toHaveBeenCalledWith(mainnet)
    })

    it('should use default network prop when there is no network in storage', () => {
      vi.spyOn(StorageUtil, 'getActiveCaipNetworkId').mockReturnValueOnce(undefined)
      const setActiveCaipNetwork = vi.spyOn(ChainController, 'setActiveCaipNetwork')

      new AppKit({
        ...mockOptions,
        defaultNetwork: sepolia
      })

      expect(setActiveCaipNetwork).toHaveBeenCalledWith(sepolia)
    })

    it('should not use default network prop when there is a network in storage', () => {
      vi.spyOn(StorageUtil, 'getActiveCaipNetworkId').mockReturnValueOnce(sepolia.caipNetworkId)
      const setActiveCaipNetwork = vi.spyOn(ChainController, 'setActiveCaipNetwork')

      new AppKit({
        ...mockOptions,
        defaultNetwork: polygon
      })

      expect(setActiveCaipNetwork).toHaveBeenCalledWith(sepolia)
    })

    it('should check allowed origins if social or email feature is enabled', async () => {
      const fetchAllowedOriginsSpy = vi
        .spyOn(ApiController, 'fetchAllowedOrigins')
        .mockResolvedValue(['http://localhost:3000'])

      new AppKit({
        ...mockOptions,
        features: {
          socials: ['google']
        }
      })

      await new Promise(resolve => setTimeout(resolve, 0))

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
