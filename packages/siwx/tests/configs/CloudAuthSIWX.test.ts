import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { AccountController, BlockchainApiController, ChainController } from '@reown/appkit-core'
import { ConstantsUtil } from '@reown/appkit-utils'

import { CloudAuthSIWX } from '../../src/configs/CloudAuthSIWX'
import { mockSession } from '../mocks/mockSession'

vi.useFakeTimers({
  now: new Date('2024-12-05T16:02:32.905Z')
})

const mocks = {
  mockFetchResponse: (response: unknown) => {
    return {
      json: async () => response,
      headers: {
        get: () => 'application/json'
      }
    } as any
  }
}

describe('CloudAuthSIWX', () => {
  let siwx: CloudAuthSIWX

  beforeAll(() => {
    global.fetch = vi.fn()
    document.location.host = 'mocked.com'
    document.location.href = 'http://mocked.com/'
  })

  beforeEach(() => {
    siwx = new CloudAuthSIWX()
  })

  describe('createMessage', () => {
    it('creates a message', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch')
      const setItemSpy = vi.spyOn(localStorage, 'setItem')

      fetchSpy.mockResolvedValueOnce(
        mocks.mockFetchResponse({ token: 'mock_token', nonce: 'mock_nonce' })
      )

      const message = await siwx.createMessage({
        accountAddress: '0x1234567890abcdef1234567890abcdef12345678',
        chainId: 'eip155:1'
      })

      expect(message).toEqual({
        accountAddress: '0x1234567890abcdef1234567890abcdef12345678',
        chainId: 'eip155:1',
        domain: 'mocked.com',
        expirationTime: undefined,
        issuedAt: '2024-12-05T16:02:32.905Z',
        nonce: 'mock_nonce',
        notBefore: undefined,
        requestId: undefined,
        resources: undefined,
        statement: undefined,
        toString: expect.any(Function),
        uri: 'http://mocked.com/',
        version: '1'
      })

      expect(message.toString())
        .toBe(`mocked.com wants you to sign in with your **blockchain** account:
0x1234567890abcdef1234567890abcdef12345678

URI: http://mocked.com/
Version: 1
Chain ID: 1
Nonce: mock_nonce
Issued At: 2024-12-05T16:02:32.905Z`)

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://api.web3modal.org/auth/v1/nonce?projectId=&st=appkit&sv=html-wagmi-undefined',
        {
          body: undefined,
          headers: undefined,
          method: 'GET'
        }
      )

      expect(setItemSpy).toHaveBeenCalledWith('@appkit/siwx-nonce-token', 'mock_token')
    })

    it('should throw an text error if response is not json', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch')
      fetchSpy.mockResolvedValueOnce({
        headers: {
          get: () => 'text/plain'
        },
        text: async () => 'mock_error'
      } as any)

      await expect(
        siwx.createMessage({
          accountAddress: '0x1234567890abcdef1234567890abcdef12345678',
          chainId: 'eip155:1'
        })
      ).rejects.toThrowError('mock_error')
    })

    it('should use default domain and uri if document is not available', async () => {
      const documentSpy = vi.spyOn(global, 'document', 'get').mockReturnValue(undefined as any)

      siwx = new CloudAuthSIWX()

      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        mocks.mockFetchResponse({ token: 'mock_token', nonce: 'mock_nonce' })
      )

      const message = await siwx.createMessage({
        accountAddress: '0x1234567890abcdef1234567890abcdef12345678',
        chainId: 'eip155:1'
      })

      expect(message.domain).toBe('Unknown Domain')
      expect(message.uri).toBe('Unknown URI')

      documentSpy.mockRestore()
    })
  })

  describe('addSession', () => {
    it('adds a session', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch')
      const setItemSpy = vi.spyOn(localStorage, 'setItem')

      vi.spyOn(localStorage, 'getItem').mockReturnValueOnce('mock_nonce_token')

      fetchSpy.mockResolvedValueOnce(mocks.mockFetchResponse({ token: 'mock_authenticate_token' }))

      await siwx.addSession(mockSession())

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://api.web3modal.org/auth/v1/authenticate?projectId=&st=appkit&sv=html-wagmi-undefined',
        {
          body: '{"message":"Hello AppKit!","signature":"0x3c70e0a2d87f677dc0c3faf98fdf6313e99a3d9191bb79f7ecfce0c2cf46b7b33fd4c4bb83bca82fe872e35963382027d0d18018342d7dc36a675918cb73e9061c","clientId":null}',
          headers: {
            'x-nonce-jwt': 'Bearer mock_nonce_token'
          },
          method: 'POST'
        }
      )
      expect(setItemSpy).toHaveBeenCalledWith('@appkit/siwx-auth-token', 'mock_authenticate_token')
    })

    it('should use correct client id', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch')

      vi.spyOn(localStorage, 'getItem').mockReturnValueOnce('mock_nonce_token')
      vi.spyOn(BlockchainApiController.state, 'clientId', 'get').mockReturnValueOnce(
        'mock_client_id'
      )

      fetchSpy.mockResolvedValueOnce(mocks.mockFetchResponse({ token: 'mock_authenticate_token' }))

      await siwx.addSession(mockSession())

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://api.web3modal.org/auth/v1/authenticate?projectId=&st=appkit&sv=html-wagmi-undefined',
        {
          body: '{"message":"Hello AppKit!","signature":"0x3c70e0a2d87f677dc0c3faf98fdf6313e99a3d9191bb79f7ecfce0c2cf46b7b33fd4c4bb83bca82fe872e35963382027d0d18018342d7dc36a675918cb73e9061c","clientId":"mock_client_id"}',
          headers: {
            'x-nonce-jwt': 'Bearer mock_nonce_token'
          },
          method: 'POST'
        }
      )
    })

    it.each([
      {
        walletInfo: {
          name: 'mock_wallet_name',
          icon: 'mock_wallet_icon'
        },
        expectedBody:
          '{"message":"Hello AppKit!","signature":"0x3c70e0a2d87f677dc0c3faf98fdf6313e99a3d9191bb79f7ecfce0c2cf46b7b33fd4c4bb83bca82fe872e35963382027d0d18018342d7dc36a675918cb73e9061c","walletInfo":{"type":"unknown","name":"mock_wallet_name","icon":"mock_wallet_icon"}}'
      },
      {
        walletInfo: {
          type: ConstantsUtil.CONNECTOR_TYPE_ANNOUNCED,
          name: 'mock_wallet_name',
          icon: 'mock_wallet_icon'
        },
        expectedBody:
          '{"message":"Hello AppKit!","signature":"0x3c70e0a2d87f677dc0c3faf98fdf6313e99a3d9191bb79f7ecfce0c2cf46b7b33fd4c4bb83bca82fe872e35963382027d0d18018342d7dc36a675918cb73e9061c","walletInfo":{"type":"extension","name":"mock_wallet_name","icon":"mock_wallet_icon"}}'
      },
      {
        walletInfo: {
          type: ConstantsUtil.CONNECTOR_TYPE_WALLET_CONNECT,
          name: 'mock_wallet_name',
          icon: 'mock_wallet_icon'
        },
        expectedBody:
          '{"message":"Hello AppKit!","signature":"0x3c70e0a2d87f677dc0c3faf98fdf6313e99a3d9191bb79f7ecfce0c2cf46b7b33fd4c4bb83bca82fe872e35963382027d0d18018342d7dc36a675918cb73e9061c","walletInfo":{"type":"walletconnect","name":"mock_wallet_name","icon":"mock_wallet_icon"}}'
      },
      {
        walletInfo: {
          type: ConstantsUtil.CONNECTOR_TYPE_AUTH,
          name: ConstantsUtil.CONNECTOR_TYPE_AUTH,
          social: 'google',
          identifier: 'mock_identifier'
        },
        expectedBody:
          '{"message":"Hello AppKit!","signature":"0x3c70e0a2d87f677dc0c3faf98fdf6313e99a3d9191bb79f7ecfce0c2cf46b7b33fd4c4bb83bca82fe872e35963382027d0d18018342d7dc36a675918cb73e9061c","walletInfo":{"type":"social","social":"google","identifier":"mock_identifier"}}'
      }
    ])('should use correct wallet info', async ({ walletInfo, expectedBody }) => {
      const fetchSpy = vi.spyOn(global, 'fetch')

      vi.spyOn(localStorage, 'getItem').mockReturnValueOnce('mock_nonce_token')
      AccountController.state.connectedWalletInfo = undefined
      vi.spyOn(AccountController.state, 'connectedWalletInfo', 'get').mockReturnValueOnce(
        walletInfo
      )

      fetchSpy.mockResolvedValueOnce(mocks.mockFetchResponse({ token: 'mock_authenticate_token' }))

      await siwx.addSession(mockSession())

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://api.web3modal.org/auth/v1/authenticate?projectId=&st=appkit&sv=html-wagmi-undefined',
        {
          body: expectedBody,
          headers: {
            'x-nonce-jwt': 'Bearer mock_nonce_token'
          },
          method: 'POST'
        }
      )
    })
  })

  describe('getSessions', () => {
    beforeEach(() => {
      vi.spyOn(localStorage, 'getItem').mockReturnValueOnce('mock_token')
    })

    it('gets sessions', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch')

      fetchSpy.mockResolvedValueOnce(
        mocks.mockFetchResponse({
          address: '0x1234567890abcdef1234567890abcdef12345678',
          chainId: 1
        })
      )

      const sessions = await siwx.getSessions(
        'eip155:1',
        '0x1234567890abcdef1234567890abcdef12345678'
      )

      expect(sessions).toEqual([
        {
          data: {
            accountAddress: '0x1234567890abcdef1234567890abcdef12345678',
            chainId: 'eip155:1'
          },
          message: '',
          signature: ''
        }
      ])

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://api.web3modal.org/auth/v1/me?projectId=&st=appkit&sv=html-wagmi-undefined',
        {
          body: undefined,
          headers: {
            Authorization: 'Bearer mock_token'
          },
          method: 'GET'
        }
      )
    })

    it('gets sessions when address is not lowercased', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch')

      fetchSpy.mockResolvedValueOnce(
        mocks.mockFetchResponse({
          address: '0x1234567890abcdef1234567890abcdef12345678',
          chainId: 1
        })
      )

      const sessions = await siwx.getSessions(
        'eip155:1',
        '0x1234567890ABCDEF1234567890abcdef12345678'
      )

      expect(sessions).toEqual([
        {
          data: {
            accountAddress: '0x1234567890abcdef1234567890abcdef12345678',
            chainId: 'eip155:1'
          },
          message: '',
          signature: ''
        }
      ])
    })

    it('returns empty array if session is not found', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch')

      fetchSpy.mockResolvedValueOnce(
        mocks.mockFetchResponse({
          address: 'different_address',
          chainId: 1
        })
      )
      await expect(
        siwx.getSessions('eip155:1', '0x1234567890abcdef1234567890abcdef12345678')
      ).resolves.toEqual([])

      fetchSpy.mockResolvedValueOnce(
        mocks.mockFetchResponse({
          address: '0x1234567890abcdef1234567890abcdef12345678',
          chainId: 2
        })
      )
      await expect(
        siwx.getSessions('eip155:1', '0x1234567890abcdef1234567890abcdef12345678')
      ).resolves.toEqual([])

      fetchSpy.mockResolvedValueOnce(mocks.mockFetchResponse(null))
      await expect(
        siwx.getSessions('eip155:1', '0x1234567890abcdef1234567890abcdef12345678')
      ).resolves.toEqual([])

      fetchSpy.mockRejectedValueOnce(new Error())
      await expect(
        siwx.getSessions('eip155:1', '0x1234567890abcdef1234567890abcdef12345678')
      ).resolves.toEqual([])
    })
  })

  describe('revokeSession', () => {
    it('revokes a session', async () => {
      const removeItemSpy = vi.spyOn(localStorage, 'removeItem')

      await siwx.revokeSession('eip155:1', '0x1234567890abcdef1234567890abcdef12345678')

      expect(removeItemSpy).toHaveBeenCalledWith('@appkit/siwx-auth-token')
    })
  })

  describe('setSessions', () => {
    it('clears storage token if sessions are empty', async () => {
      const removeItemSpy = vi.spyOn(localStorage, 'removeItem')

      await siwx.setSessions([])

      expect(removeItemSpy).toHaveBeenCalledWith('@appkit/siwx-auth-token')
    })

    it('adds a session with default first item', async () => {
      const addSessionSpy = vi.spyOn(siwx, 'addSession')
      addSessionSpy.mockResolvedValueOnce()

      const session = mockSession()
      await siwx.setSessions([session])

      expect(addSessionSpy).toHaveBeenCalledWith(session)
    })

    it('should use the correct session if there are multiple sessions', async () => {
      const addSessionSpy = vi.spyOn(siwx, 'addSession')
      addSessionSpy.mockResolvedValueOnce()

      vi.spyOn(ChainController, 'getActiveCaipNetwork').mockReturnValue({
        caipNetworkId: 'eip155:2'
      } as any)

      const session = mockSession()
      const session2 = mockSession({ data: { chainId: 'eip155:2' } })
      await siwx.setSessions([session, session2])

      expect(addSessionSpy).toHaveBeenCalledWith(session2)
    })
  })

  describe('getRequired', () => {
    it('should return true for getRequired() by default', () => {
      expect(siwx.getRequired()).toBe(true)
    })

    it('should return false for getRequired()', () => {
      siwx = new CloudAuthSIWX({ required: false })
      expect(siwx.getRequired()).toBe(false)
    })
  })
})
