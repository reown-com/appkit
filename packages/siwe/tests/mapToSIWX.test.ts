import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mapToSIWX } from '../src/mapToSIWX'
import { ChainController, type SIWXSession } from '@reown/appkit-core'
import type { AppKitSIWEClient } from '../exports'
import type { CaipNetworkId } from '@reown/appkit'

describe('mapToSIWX', () => {
  let mockSIWEClient: AppKitSIWEClient

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock ChainController
    vi.spyOn(ChainController, 'getActiveCaipNetwork').mockReturnValue({
      caipNetworkId: 'eip155:1',
      id: 1,
      name: 'Ethereum Mainnet',
      assets: {
        imageId: '12341',
        imageUrl: ''
      },
      chainNamespace: 'eip155',
      nativeCurrency: {
        name: 'Ethereum',
        decimals: 18,
        symbol: 'ETH'
      },
      rpcUrls: {
        default: {
          http: ['']
        }
      }
    })

    // Setup mock SIWE client
    mockSIWEClient = {
      // @ts-expect-error some of the properties are not defined in the type
      options: {
        signOutOnNetworkChange: true,
        signOutOnAccountChange: true,
        signOutOnDisconnect: true
      },
      // @ts-expect-error some of the properties are not defined in the type
      methods: {
        getSession: vi.fn().mockResolvedValue({
          address: '0x123',
          chainId: 1
        }),
        signOut: vi.fn(),
        onSignOut: vi.fn(),
        onSignIn: vi.fn(),
        getMessageParams: vi.fn().mockResolvedValue({
          domain: 'reown.com',
          uri: 'https://reown.com',
          statement: 'Sign in with X'
        }),
        verifyMessage: vi.fn().mockResolvedValue(true)
      },
      getNonce: vi.fn().mockResolvedValue('123456'),
      createMessage: vi.fn().mockReturnValue('signed message string')
    }
  })

  describe('createMessage', () => {
    it('should create a valid message with required parameters', async () => {
      const siwx = mapToSIWX(mockSIWEClient)
      const input = {
        accountAddress: '0x123',
        chainId: 'eip155:1' as CaipNetworkId
      }

      const message = await siwx.createMessage(input)

      expect(message).toMatchObject({
        nonce: '123456',
        version: '1',
        accountAddress: '0x123',
        chainId: 'eip155:1',
        domain: 'reown.com',
        uri: 'https://reown.com'
      })
      expect(typeof message.toString).toBe('function')
    })

    it('should throw error when message params are not available', async () => {
      mockSIWEClient.methods.getMessageParams = vi.fn().mockResolvedValue(null)
      const siwx = mapToSIWX(mockSIWEClient)

      await expect(
        siwx.createMessage({
          accountAddress: '0x123',
          chainId: 'eip155:1'
        })
      ).rejects.toThrow('Failed to get message params!')
    })
  })

  describe('addSession', () => {
    it('should successfully add valid EVM session', async () => {
      const siwx = mapToSIWX(mockSIWEClient)
      const session: SIWXSession = {
        data: {
          accountAddress: '0x123',
          chainId: 'eip155:1',
          domain: 'reown.com',
          uri: 'https://reown.com',
          version: '1',
          nonce: '123456'
        },
        message: 'test message',
        signature: 'test signature'
      }

      await siwx.addSession(session)

      expect(mockSIWEClient.methods.verifyMessage).toHaveBeenCalledWith(session)
      expect(mockSIWEClient.methods.onSignIn).toHaveBeenCalledWith({
        address: '0x123',
        chainId: 1
      })
    })

    it('should ignore non-EVM chains', async () => {
      const siwx = mapToSIWX(mockSIWEClient)
      const session: SIWXSession = {
        data: {
          accountAddress: '0x123',
          chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
          domain: 'reown.com',
          uri: 'https://reown.com',
          version: '1',
          nonce: '123456'
        },
        message: 'test message',
        signature: 'test signature'
      }

      await siwx.addSession(session)

      expect(mockSIWEClient.methods.verifyMessage).not.toHaveBeenCalled()
      expect(mockSIWEClient.methods.onSignIn).not.toHaveBeenCalled()
    })
  })

  describe('getSessions', () => {
    it('should return current session for matching EVM address and chain', async () => {
      const siwx = mapToSIWX(mockSIWEClient)
      const sessions = await siwx.getSessions('eip155:1', '0x123')

      expect(sessions).toHaveLength(1)
      expect(sessions?.[0]?.data).toMatchObject({
        accountAddress: '0x123',
        chainId: 'eip155:1'
      })
    })

    it('should return empty array when session does not match', async () => {
      const siwx = mapToSIWX(mockSIWEClient)
      const sessions = await siwx.getSessions('eip155:1', '0x456')

      expect(sessions).toHaveLength(0)
    })

    it('should handle non-EVM chains', async () => {
      const siwx = mapToSIWX(mockSIWEClient)
      const sessions = await siwx.getSessions('solana:1', 'solanaAddress')

      expect(sessions).toHaveLength(1)
      expect(sessions?.[0]?.data).toMatchObject({
        accountAddress: 'solanaAddress',
        chainId: 'solana:1'
      })
    })
  })

  describe('setSessions', () => {
    it('should sign out when sessions array is empty', async () => {
      const siwx = mapToSIWX(mockSIWEClient)
      await siwx.setSessions([])

      expect(mockSIWEClient.methods.signOut).toHaveBeenCalled()
    })

    it('should add first matching session when multiple sessions provided', async () => {
      const siwx = mapToSIWX(mockSIWEClient)
      const sessions: SIWXSession[] = [
        {
          data: {
            accountAddress: '0x123',
            chainId: 'eip155:1',
            domain: 'reown.com',
            uri: 'https://reown.com',
            version: '1',
            nonce: '123456'
          },
          message: 'test message',
          signature: 'test signature'
        },
        {
          data: {
            accountAddress: '0x456',
            chainId: 'eip155:137',
            domain: 'reown.com',
            uri: 'https://reown.com',
            version: '1',
            nonce: '123456'
          },
          message: 'test message',
          signature: 'test signature'
        }
      ]

      await siwx.setSessions(sessions)

      expect(mockSIWEClient.methods.verifyMessage).toHaveBeenCalledWith(sessions[0])
    })
  })
})
