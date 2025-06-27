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

  describe('authConnectorAuthenticate', () => {
    it('should call authConnector.connect without siwxMessage when SIWX is not enabled', async () => {
      const mockAuthConnector = {
        connect: vi.fn().mockResolvedValue({
          address: '0x1234567890123456789012345678901234567890',
          chainId: 1,
          accounts: ['0x1234567890123456789012345678901234567890']
        })
      }

      vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
        ...OptionsController.state,
        siwx: undefined
      })

      const result = await SIWXUtil.authConnectorAuthenticate({
        authConnector: mockAuthConnector as any,
        chainId: 1,
        socialUri: 'test-uri',
        preferredAccountType: 'eoa',
        chainNamespace: 'eip155'
      })

      expect(mockAuthConnector.connect).toHaveBeenCalledWith({
        chainId: 1,
        socialUri: 'test-uri',
        preferredAccountType: 'eoa'
      })
      expect(mockAuthConnector.connect).not.toHaveBeenCalledWith(
        expect.objectContaining({
          siwxMessage: expect.any(Object)
        })
      )
      expect(result).toEqual({
        address: '0x1234567890123456789012345678901234567890',
        chainId: 1,
        accounts: ['0x1234567890123456789012345678901234567890']
      })
    })

    it('should call authConnector.connect with siwxMessage when SIWX is enabled and chainNamespace includes eip155', async () => {
      const mockSiwxMessage = {
        accountAddress: '',
        chainId: 'eip155:1',
        domain: 'example.com',
        uri: 'https://example.com',
        version: '1',
        nonce: 'test-nonce',
        notBefore: '2023-01-01T00:00:00Z',
        statement: 'Sign in with Ethereum',
        resources: ['https://example.com'],
        requestId: 'test-request-id',
        issuedAt: '2023-01-01T00:00:00Z',
        expirationTime: '2023-01-02T00:00:00Z'
      }

      const mockSIWX = {
        createMessage: vi.fn().mockResolvedValue(mockSiwxMessage)
      }

      const mockAuthConnector = {
        connect: vi.fn().mockResolvedValue({
          address: '0x1234567890123456789012345678901234567890',
          chainId: 1,
          accounts: ['0x1234567890123456789012345678901234567890'],
          signature: '0xsignature',
          message: 'test message'
        })
      }

      const addEmbeddedWalletSessionSpy = vi
        .spyOn(SIWXUtil, 'addEmbeddedWalletSession')
        .mockResolvedValue()

      vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
        ...OptionsController.state,
        siwx: mockSIWX as unknown as SIWXConfig
      })
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

      const result = await SIWXUtil.authConnectorAuthenticate({
        authConnector: mockAuthConnector as any,
        chainId: 1,
        socialUri: 'test-uri',
        preferredAccountType: 'eoa',
        chainNamespace: 'eip155'
      })

      expect(mockSIWX.createMessage).toHaveBeenCalledWith({
        chainId: 'eip155:1',
        accountAddress: ''
      })
      expect(mockAuthConnector.connect).toHaveBeenCalledWith({
        chainId: 1,
        socialUri: 'test-uri',
        siwxMessage: mockSiwxMessage,
        preferredAccountType: 'eoa'
      })
      expect(addEmbeddedWalletSessionSpy).toHaveBeenCalledWith(
        mockSiwxMessage,
        'test message',
        '0xsignature'
      )
      expect(result).toEqual({
        address: '0x1234567890123456789012345678901234567890',
        chainId: 1,
        accounts: ['0x1234567890123456789012345678901234567890']
      })
    })
  })
})
