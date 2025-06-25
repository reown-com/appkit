import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { type SIWXConfig, SIWXUtil } from '../../exports/index.js'
import { ChainController } from '../../src/controllers/ChainController.js'
import { ConnectionController } from '../../src/controllers/ConnectionController.js'
import { EventsController } from '../../src/controllers/EventsController.js'
import { OptionsController } from '../../src/controllers/OptionsController.js'
import { SnackController } from '../../src/controllers/SnackController.js'
import { CoreHelperUtil } from '../../src/utils/CoreHelperUtil.js'

describe('SIWXUtil', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('requestSignMessage', () => {
    it('should show signature declined error and send SIWX_AUTH_ERROR event when error occurs', async () => {
      const showErrorSpy = vi.spyOn(SnackController, 'showError')
      const sendEventSpy = vi.spyOn(EventsController, 'sendEvent')
      const getSIWXEventPropertiesSpy = vi
        .spyOn(SIWXUtil, 'getSIWXEventProperties')
        .mockReturnValue({
          network: 'eip155:1',
          isSmartAccount: false
        })

      const mockSIWX = {
        createMessage: vi.fn().mockRejectedValue(new Error('Test error'))
      }

      vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
        ...OptionsController.state,
        siwx: mockSIWX as unknown as SIWXConfig
      })
      vi.spyOn(ChainController, 'getActiveCaipAddress').mockReturnValue(
        'eip155:1:0x1234567890123456789012345678901234567890'
      )
      vi.spyOn(CoreHelperUtil, 'getPlainAddress').mockReturnValue(
        '0x1234567890123456789012345678901234567890'
      )
      vi.spyOn(ChainController, 'getActiveCaipNetwork').mockReturnValue({
        caipNetworkId: 'eip155:1',
        chainNamespace: 'eip155',
        name: 'Ethereum Mainnet',
        nativeCurrency: {
          decimals: 18,
          name: 'Ether',
          symbol: 'ETH'
        },
        rpcUrls: {
          default: {
            http: [],
            webSocket: undefined
          }
        },
        id: ''
      })
      vi.spyOn(ConnectionController, '_getClient').mockReturnValue({
        signMessage: vi.fn()
      } as any)

      await SIWXUtil.requestSignMessage()

      expect(showErrorSpy).toHaveBeenCalledWith('Error signing message')
      expect(sendEventSpy).toHaveBeenCalledWith({
        type: 'track',
        event: 'SIWX_AUTH_ERROR',
        properties: {
          network: 'eip155:1',
          isSmartAccount: false
        }
      })
      expect(getSIWXEventPropertiesSpy).toHaveBeenCalled()
    })
  })
})
