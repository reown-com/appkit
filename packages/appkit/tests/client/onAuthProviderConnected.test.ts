import { beforeEach, describe, expect, it, vi } from 'vitest'

import { type AccountState, ChainController, SIWXUtil } from '@reown/appkit-controllers'

import { AppKit } from '../../src/client/appkit.js'
import { mockOptions } from '../mocks/Options.js'
import {
  mockBlockchainApiController,
  mockStorageUtil,
  mockWindowAndDocument
} from '../test-utils.js'

// Mock the SIWXUtil
vi.mock('@reown/appkit-controllers', async () => {
  const actual = await vi.importActual('@reown/appkit-controllers')
  return {
    ...actual,
    SIWXUtil: {
      addEmbeddedWalletSession: vi.fn()
    }
  }
})

describe('onAuthProviderConnected', () => {
  let appKit: AppKit

  beforeEach(() => {
    mockWindowAndDocument()
    mockStorageUtil()
    mockBlockchainApiController()
    vi.clearAllMocks()

    appKit = new AppKit(mockOptions)
  })

  describe('basic functionality', () => {
    it('should handle basic user connection without SIWX', async () => {
      const mockUser = {
        address: '0x1234567890123456789012345678901234567890',
        chainId: 'eip155:1',
        preferredAccountType: 'eoa',
        smartAccountDeployed: false,
        email: 'test@example.com',
        username: 'testuser'
      }

      const setCaipAddressSpy = vi.spyOn(appKit, 'setCaipAddress')
      const setUserSpy = vi.spyOn(appKit, 'setUser')
      const setSmartAccountDeployedSpy = vi.spyOn(appKit, 'setSmartAccountDeployed')
      const setPreferredAccountTypeSpy = vi.spyOn(appKit, 'setPreferredAccountType')
      const syncAuthConnectorThemeSpy = vi.spyOn(appKit as any, 'syncAuthConnectorTheme')
      const syncAccountSpy = vi.spyOn(appKit as any, 'syncAccount')
      const setLoadingSpy = vi.spyOn(appKit, 'setLoading')

      vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
        user: { accounts: [{ type: 'eoa', address: '0x1234567890123456789012345678901234567890' }] }
      } as AccountState)

      await appKit['onAuthProviderConnected'](mockUser)

      expect(setCaipAddressSpy).toHaveBeenCalled()
      expect(setUserSpy).toHaveBeenCalledWith(
        {
          accounts: [{ type: 'eoa', address: '0x1234567890123456789012345678901234567890' }],
          address: '0x1234567890123456789012345678901234567890',
          chainId: 'eip155:1',
          preferredAccountType: 'eoa',
          smartAccountDeployed: false,
          email: 'test@example.com',
          username: 'testuser'
        },
        'eip155'
      )
      expect(setSmartAccountDeployedSpy).toHaveBeenCalledWith(false, 'eip155')
      expect(setPreferredAccountTypeSpy).toHaveBeenCalledWith('eoa', 'eip155')
      expect(syncAuthConnectorThemeSpy).toHaveBeenCalledWith(undefined)
      expect(syncAccountSpy).toHaveBeenCalledWith({
        address: '0x1234567890123456789012345678901234567890',
        chainId: 'eip155:1',
        chainNamespace: 'eip155'
      })
      expect(setLoadingSpy).toHaveBeenCalledWith(false, 'eip155')
    })

    it('should handle user connection with SIWX data', async () => {
      const mockUser = {
        address: '0x1234567890123456789012345678901234567890',
        chainId: 'eip155:1',
        preferredAccountType: 'eoa',
        smartAccountDeployed: true,
        email: 'test@example.com',
        username: 'testuser',
        message: 'test message',
        signature: 'test signature',
        siwxMessage: {
          chainId: 'eip155:1',
          accountAddress: '0x1234567890123456789012345678901234567890',
          notBefore: '2023-01-01T00:00:00Z',
          statement: 'test statement',
          resources: ['test resource'],
          requestId: 'test-request-id',
          issuedAt: '2023-01-01T00:00:00Z',
          domain: 'test.com',
          uri: 'https://test.com',
          version: '1',
          nonce: 'test-nonce'
        }
      }

      const addEmbeddedWalletSessionSpy = vi.spyOn(SIWXUtil, 'addEmbeddedWalletSession')
      const setCaipAddressSpy = vi.spyOn(appKit, 'setCaipAddress')
      const setUserSpy = vi.spyOn(appKit, 'setUser')
      const setSmartAccountDeployedSpy = vi.spyOn(appKit, 'setSmartAccountDeployed')
      const setPreferredAccountTypeSpy = vi.spyOn(appKit, 'setPreferredAccountType')
      const syncAuthConnectorThemeSpy = vi.spyOn(appKit as any, 'syncAuthConnectorTheme')
      const syncAccountSpy = vi.spyOn(appKit as any, 'syncAccount')
      const setLoadingSpy = vi.spyOn(appKit, 'setLoading')

      vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
        user: { accounts: [{ type: 'eoa', address: '0x1234567890123456789012345678901234567890' }] }
      } as AccountState)

      await appKit['onAuthProviderConnected'](mockUser)

      expect(addEmbeddedWalletSessionSpy).toHaveBeenCalledWith(
        {
          chainId: 'eip155:1',
          accountAddress: '0x1234567890123456789012345678901234567890',
          notBefore: '2023-01-01T00:00:00Z',
          statement: 'test statement',
          resources: ['test resource'],
          requestId: 'test-request-id',
          issuedAt: '2023-01-01T00:00:00Z',
          domain: 'test.com',
          uri: 'https://test.com',
          version: '1',
          nonce: 'test-nonce'
        },
        'test message',
        'test signature'
      )
      expect(setCaipAddressSpy).toHaveBeenCalled()
      expect(setUserSpy).toHaveBeenCalledWith(
        {
          accounts: [{ type: 'eoa', address: '0x1234567890123456789012345678901234567890' }],
          address: '0x1234567890123456789012345678901234567890',
          chainId: 'eip155:1',
          preferredAccountType: 'eoa',
          smartAccountDeployed: true,
          email: 'test@example.com',
          username: 'testuser'
        },
        'eip155'
      )
      expect(setSmartAccountDeployedSpy).toHaveBeenCalledWith(true, 'eip155')
      expect(setPreferredAccountTypeSpy).toHaveBeenCalledWith('eoa', 'eip155')
      expect(syncAuthConnectorThemeSpy).toHaveBeenCalledWith(undefined)
      expect(syncAccountSpy).toHaveBeenCalledWith({
        address: '0x1234567890123456789012345678901234567890',
        chainId: 'eip155:1',
        chainNamespace: 'eip155'
      })
      expect(setLoadingSpy).toHaveBeenCalledWith(false, 'eip155')
    })
  })
})
