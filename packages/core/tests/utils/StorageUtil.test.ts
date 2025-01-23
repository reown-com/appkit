import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { SafeLocalStorage, getSafeConnectorIdKey } from '@reown/appkit-common'
import { SafeLocalStorageKeys } from '@reown/appkit-common'
import { W3mFrameConstants, W3mFrameHelpers, W3mFrameStorage } from '@reown/appkit-wallet'

import { StorageUtil } from '../../src/utils/StorageUtil'
import type { SocialProvider, WcWallet } from '../../src/utils/TypeUtil'

const previousLocalStorage = globalThis.localStorage
const previousWindow = globalThis.window
let store: { [key: string]: string } = {}

afterAll(() => {
  Object.assign(globalThis, { localStorage: previousLocalStorage, window: previousWindow })
})

describe('StorageUtil', () => {
  beforeAll(() => {
    Object.assign(globalThis, {
      window: {},
      localStorage: {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
          store[key] = value.toString()
        },
        removeItem: (key: string) => {
          delete store[key]
        },
        clear: () => {
          store = {}
        }
      }
    })
  })

  beforeEach(() => {
    // Clear localStorage before each test
    SafeLocalStorage.clear()
  })

  afterEach(() => {
    // Restore all mocks after each test
    vi.restoreAllMocks()
  })

  describe('setWalletConnectDeepLink', () => {
    it('should set WalletConnect deep link in localStorage', () => {
      const deepLink = { href: 'https://example.com', name: 'Example Wallet' }
      StorageUtil.setWalletConnectDeepLink(deepLink)
      expect(SafeLocalStorageKeys.DEEPLINK_CHOICE).toBe('WALLETCONNECT_DEEPLINK_CHOICE')
      const savedDL = SafeLocalStorage.getItem(SafeLocalStorageKeys.DEEPLINK_CHOICE)
      expect(savedDL).toBe(JSON.stringify({ href: deepLink.href, name: deepLink.name }))
    })

    it('should handle errors when setting deep link', () => {
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
      vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('Storage error')
      })

      StorageUtil.setWalletConnectDeepLink({ href: 'https://example.com', name: 'Example Wallet' })
      expect(consoleSpy).toHaveBeenCalledWith('Unable to set WalletConnect deep link')
    })
  })

  describe('getWalletConnectDeepLink', () => {
    it('should get WalletConnect deep link from localStorage', () => {
      const deepLink = { href: 'https://example.com', name: 'Example Wallet' }
      SafeLocalStorage.setItem(
        SafeLocalStorageKeys.DEEPLINK_CHOICE,
        JSON.stringify({ href: deepLink.href, name: deepLink.name })
      )
      expect(StorageUtil.getWalletConnectDeepLink()).toEqual({
        href: deepLink.href,
        name: deepLink.name
      })
    })

    it('should return undefined if deep link is not set', () => {
      expect(StorageUtil.getWalletConnectDeepLink()).toBeUndefined()
    })

    it('should handle errors when getting deep link', () => {
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
      vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
        throw new Error('Storage error')
      })

      expect(StorageUtil.getWalletConnectDeepLink()).toBeUndefined()
      expect(consoleSpy).toHaveBeenCalledWith('Unable to get WalletConnect deep link')
    })
  })

  describe('deleteWalletConnectDeepLink', () => {
    it('should delete WalletConnect deep link from localStorage', () => {
      SafeLocalStorage.setItem(
        SafeLocalStorageKeys.DEEPLINK_CHOICE,
        JSON.stringify({ href: 'https://example.com', name: 'Example' })
      )
      StorageUtil.deleteWalletConnectDeepLink()
      expect(SafeLocalStorage.getItem(SafeLocalStorageKeys.DEEPLINK_CHOICE)).toBeUndefined()
    })

    it('should handle errors when deleting deep link', () => {
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
      vi.spyOn(localStorage, 'removeItem').mockImplementation(() => {
        throw new Error('Storage error')
      })

      StorageUtil.deleteWalletConnectDeepLink()
      expect(consoleSpy).toHaveBeenCalledWith('Unable to delete WalletConnect deep link')
    })
  })

  describe('setAppKitRecent', () => {
    it('should add a new wallet to recent wallets', () => {
      const wallet: WcWallet = { id: 'wallet1', name: 'Wallet 1' }
      StorageUtil.setAppKitRecent(wallet)
      expect(StorageUtil.getRecentWallets()).toEqual([wallet])
    })

    it('should not add duplicate wallets', () => {
      const wallet: WcWallet = { id: 'wallet1', name: 'Wallet 1' }
      StorageUtil.setAppKitRecent(wallet)
      StorageUtil.setAppKitRecent(wallet)
      expect(StorageUtil.getRecentWallets()).toEqual([wallet])
    })

    it('should limit recent wallets to 2', () => {
      const wallet1: WcWallet = { id: 'wallet1', name: 'Wallet 1' }
      const wallet2: WcWallet = { id: 'wallet2', name: 'Wallet 2' }
      const wallet3: WcWallet = { id: 'wallet3', name: 'Wallet 3' }
      StorageUtil.setAppKitRecent(wallet1)
      StorageUtil.setAppKitRecent(wallet2)
      StorageUtil.setAppKitRecent(wallet3)
      expect(StorageUtil.getRecentWallets()).toEqual([wallet3, wallet2])
    })
  })

  describe('getRecentWallets', () => {
    it('should return an empty array if no recent wallets', () => {
      expect(StorageUtil.getRecentWallets()).toEqual([])
    })

    it('should return recent wallets', () => {
      const wallet: WcWallet = { id: 'wallet1', name: 'Wallet 1' }
      SafeLocalStorage.setItem(SafeLocalStorageKeys.RECENT_WALLETS, JSON.stringify([wallet]))
      expect(StorageUtil.getRecentWallets()).toEqual([wallet])
    })
  })

  describe('setConnectedConnectorId', () => {
    it('should set connected connector', () => {
      const connectorId = 'io.metamask'

      StorageUtil.setConnectedConnectorId('eip155', connectorId)
      const key = getSafeConnectorIdKey('eip155')
      expect(SafeLocalStorage.getItem(key)).toBe(connectorId)
    })
  })

  describe('getConnectedConnector', () => {
    it('should get connected connector', () => {
      const connectorId = 'io.metamask'
      const key = getSafeConnectorIdKey('eip155')
      SafeLocalStorage.setItem(key, connectorId)
      expect(StorageUtil.getConnectedConnectorId('eip155')).toBe(connectorId)
    })
  })

  describe('setConnectedSocialProvider', () => {
    it('should set connected social provider', () => {
      const provider: SocialProvider = 'google'
      StorageUtil.setConnectedSocialProvider(provider)
      expect(SafeLocalStorage.getItem(SafeLocalStorageKeys.CONNECTED_SOCIAL)).toBe(provider)
    })
  })

  describe('getConnectedSocialProvider', () => {
    it('should get connected social provider', () => {
      const provider: SocialProvider = 'google'
      SafeLocalStorage.setItem(SafeLocalStorageKeys.CONNECTED_SOCIAL, provider)
      expect(StorageUtil.getConnectedSocialProvider()).toBe(provider)
    })
  })

  describe('getConnectedSocialUsername', () => {
    it('should set username on W3mFrameStorage and get connected social username', () => {
      const username = 'testuser'
      vi.spyOn(W3mFrameHelpers, 'isClient', 'get').mockReturnValue(true)
      W3mFrameStorage.set(W3mFrameConstants.SOCIAL_USERNAME, username)
      expect(StorageUtil.getConnectedSocialUsername()).toBe(username)
    })
  })
})
