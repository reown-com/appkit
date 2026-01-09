import UniversalProvider from '@walletconnect/universal-provider'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { type AppKitNetwork, ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
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
import { ReownAuthentication } from '@reown/appkit-controllers/features'
import { CaipNetworksUtil, ErrorUtil } from '@reown/appkit-utils'

import { AppKit } from '../../src/client/appkit.js'
import { mockEvmAdapter, mockSolanaAdapter } from '../mocks/Adapter.js'
import { mainnet, polygon, sepolia, solana } from '../mocks/Networks'
import { mockOptions, mockRemoteFeaturesConfig } from '../mocks/Options'
import { mockUniversalProvider } from '../mocks/Providers.js'
import {
  mockBlockchainApiController,
  mockRemoteFeatures,
  mockStorageUtil,
  mockWindowAndDocument
} from '../test-utils.js'

vi.mock('@reown/appkit-controllers/features', () => ({
  ReownAuthentication: vi.fn()
}))

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
        connectionControllerClient: expect.any(Object)
      })
    })

    it('should construct', async () => {
      const solanaConstruct = vi.spyOn(mockSolanaAdapter, 'construct')
      const evmConstruct = vi.spyOn(mockEvmAdapter, 'construct')

      new AppKit(mockOptions)

      await vi.waitFor(() => {
        expect(solanaConstruct).toHaveBeenCalledWith({
          networks: CaipNetworksUtil.extendCaipNetworks([solana], {
            projectId: mockOptions.projectId,
            customNetworkImageUrls: {},
            customRpcUrls: {}
          }),
          projectId: mockOptions.projectId,
          namespace: CommonConstantsUtil.CHAIN.SOLANA
        })
        expect(evmConstruct).toHaveBeenCalledWith({
          networks: CaipNetworksUtil.extendCaipNetworks([mainnet, sepolia], {
            projectId: mockOptions.projectId,
            customNetworkImageUrls: {},
            customRpcUrls: {}
          }),
          projectId: mockOptions.projectId,
          namespace: CommonConstantsUtil.CHAIN.EVM
        })
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

    it('should disable email and social features when pay feature is enabled', async () => {
      const appKit = new AppKit({
        ...mockOptions,
        features: {
          pay: true
        }
      })

      await appKit.ready()

      expect(OptionsController.state.remoteFeatures?.email).toBe(false)
      expect(OptionsController.state.remoteFeatures?.socials).toBe(false)
    })

    it('should not disable email and social features when pay feature is disabled', async () => {
      const appKit = new AppKit({
        ...mockOptions,
        features: {
          pay: false
        }
      })

      await appKit.ready()

      const remoteFeatures = OptionsController.state.remoteFeatures
      expect(remoteFeatures?.email).toBe(mockRemoteFeaturesConfig.email)
      expect(remoteFeatures?.socials).toEqual(mockRemoteFeaturesConfig.socials)
    })

    it('should not affect other features when pay feature is enabled', async () => {
      const appKit = new AppKit({
        ...mockOptions,
        features: {
          pay: true
        }
      })

      await appKit.ready()

      const remoteFeatures = OptionsController.state.remoteFeatures

      expect(remoteFeatures?.swaps).toEqual(mockRemoteFeaturesConfig.swaps)
      expect(remoteFeatures?.onramp).toEqual(mockRemoteFeaturesConfig.onramp)
      expect(remoteFeatures?.activity).toBe(mockRemoteFeaturesConfig.activity)
    })

    it('should override SIWX instance if reownAuthentication feature is enabled', async () => {
      const setSIWX = vi.spyOn(OptionsController, 'setSIWX')

      const appKit = new AppKit({
        ...mockOptions,
        features: {
          reownAuthentication: true
        }
      })

      await appKit.ready()

      expect(setSIWX).toHaveBeenCalledWith(expect.any(ReownAuthentication))
    })

    it('should override SIWX instance if reownAuthentication remote feature is enabled', async () => {
      const setSIWX = vi.spyOn(OptionsController, 'setSIWX')

      // Mock ConfigUtil to return remote features with reownAuthentication enabled
      const { ConfigUtil } = await import('../../src/utils/ConfigUtil.js')
      vi.spyOn(ConfigUtil, 'fetchRemoteFeatures').mockResolvedValue({
        ...mockRemoteFeaturesConfig,
        reownAuthentication: true
      })

      const appKit = new AppKit(mockOptions)

      await appKit.ready()

      expect(setSIWX).toHaveBeenCalledWith(expect.any(ReownAuthentication))
    })

    it('should override SIWX instance when features.reownAuthentication is false but remoteFeatures.reownAuthentication is true', async () => {
      const setSIWX = vi.spyOn(OptionsController, 'setSIWX')

      // Mock ConfigUtil to return remote features with reownAuthentication enabled
      const { ConfigUtil } = await import('../../src/utils/ConfigUtil.js')
      vi.spyOn(ConfigUtil, 'fetchRemoteFeatures').mockResolvedValue({
        ...mockRemoteFeaturesConfig,
        reownAuthentication: true
      })

      const appKit = new AppKit({
        ...mockOptions,
        features: {
          reownAuthentication: false // Explicitly disabled in features
        }
      })

      await appKit.ready()

      expect(setSIWX).toHaveBeenCalledWith(expect.any(ReownAuthentication))
    })

    it('should not override SIWX instance when both features and remoteFeatures have reownAuthentication disabled', async () => {
      const setSIWX = vi.spyOn(OptionsController, 'setSIWX')

      // Mock ConfigUtil to return remote features with reownAuthentication disabled
      const { ConfigUtil } = await import('../../src/utils/ConfigUtil.js')
      vi.spyOn(ConfigUtil, 'fetchRemoteFeatures').mockResolvedValue({
        ...mockRemoteFeaturesConfig,
        reownAuthentication: false
      })

      const appKit = new AppKit({
        ...mockOptions,
        features: {
          reownAuthentication: false // Explicitly disabled in features
        }
      })

      await appKit.ready()

      // Should not have been called with ReownAuthentication instance
      expect(setSIWX).not.toHaveBeenCalledWith(expect.any(ReownAuthentication))
    })

    it('should override SIWX instance when both features and remoteFeatures have reownAuthentication enabled', async () => {
      const setSIWX = vi.spyOn(OptionsController, 'setSIWX')

      // Mock ConfigUtil to return remote features with reownAuthentication enabled
      const { ConfigUtil } = await import('../../src/utils/ConfigUtil.js')
      vi.spyOn(ConfigUtil, 'fetchRemoteFeatures').mockResolvedValue({
        ...mockRemoteFeaturesConfig,
        reownAuthentication: true
      })

      const appKit = new AppKit({
        ...mockOptions,
        features: {
          reownAuthentication: true // Explicitly enabled in features
        }
      })

      await appKit.ready()

      expect(setSIWX).toHaveBeenCalledWith(expect.any(ReownAuthentication))
    })

    it('should handle undefined features.reownAuthentication and rely on remoteFeatures', async () => {
      const setSIWX = vi.spyOn(OptionsController, 'setSIWX')

      // Mock ConfigUtil to return remote features with reownAuthentication enabled
      const { ConfigUtil } = await import('../../src/utils/ConfigUtil.js')
      vi.spyOn(ConfigUtil, 'fetchRemoteFeatures').mockResolvedValue({
        ...mockRemoteFeaturesConfig,
        reownAuthentication: true
      })

      const appKit = new AppKit({
        ...mockOptions,
        features: {
          // reownAuthentication is undefined
        }
      })

      await appKit.ready()

      expect(setSIWX).toHaveBeenCalledWith(expect.any(ReownAuthentication))
    })
  })

  describe('Alert Errors', () => {
    it('should handle alert errors based on error messages', () => {
      const open = vi.spyOn(AlertController, 'open')

      const errors = [
        {
          alert: ErrorUtil.ALERT_ERRORS.ORIGIN_NOT_ALLOWED,
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
