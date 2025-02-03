import { afterEach, describe, expect, it, vi } from 'vitest'

import { type AppKitNetwork } from '@reown/appkit-common'
import {
  BlockchainApiController,
  ChainController,
  EventsController,
  OptionsController,
  StorageUtil
} from '@reown/appkit-core'

import { AppKit } from '../src/client'
import { mainnet, mockOptions, sepolia, solana } from './mocks/Options'

// Mock all controllers and UniversalAdapterClient
vi.mock('../src/universal-adapter/client')

vi.mocked(global).window = { location: { origin: '' } } as any
vi.mocked(global).document = {
  body: {
    insertAdjacentElement: vi.fn()
  } as any,
  createElement: vi.fn().mockReturnValue({ appendChild: vi.fn() }),
  getElementsByTagName: vi.fn().mockReturnValue([{ textContent: '' }]),
  querySelector: vi.fn()
} as any

/**
 * In the initializeBlockchainApiController method, we call the getSupportedNetworks method.
 * This method is mocked to return the mainnet and polygon networks.
 */
vi.spyOn(BlockchainApiController, 'getSupportedNetworks').mockResolvedValue({
  http: ['eip155:1', 'eip155:137'],
  ws: ['eip155:1', 'eip155:137']
})
/**
 * Make the StorageUtil return the mainnet network by default.
 * Depending on the specific cases, this might be overriden.
 */
vi.spyOn(StorageUtil, 'getActiveNetworkProps').mockReturnValue({
  namespace: mainnet.chainNamespace,
  caipNetworkId: mainnet.caipNetworkId,
  chainId: mainnet.id
})

describe('Base', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Base Initialization', () => {
    it('should initialize controllers', async () => {
      const sendEvent = vi.spyOn(EventsController, 'sendEvent')
      const initialize = vi.spyOn(ChainController, 'initialize')

      new AppKit(mockOptions)

      const options = { ...mockOptions }
      delete options.adapters

      expect(sendEvent).toHaveBeenCalled()
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

      expect(initialize).toHaveBeenCalledOnce()
      expect(initialize).toHaveBeenCalledWith(mockOptions.adapters, [mainnet, sepolia, solana], {
        connectionControllerClient: expect.any(Object),
        networkControllerClient: expect.any(Object)
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

    it('should set partially defaultAccountType', () => {
      const setDefaultAccountTypes = vi.spyOn(OptionsController, 'setDefaultAccountTypes')

      new AppKit({
        ...mockOptions,
        defaultAccountTypes: {
          eip155: 'eoa',
          bip122: 'ordinal'
        }
      })

      expect(setDefaultAccountTypes).toHaveBeenCalledWith({
        eip155: 'eoa',
        bip122: 'ordinal'
      })
    })
  })
})
