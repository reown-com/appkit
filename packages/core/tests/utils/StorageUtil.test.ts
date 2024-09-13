import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { StorageUtil } from '../../src/utils/StorageUtil'
import type { WcWallet, ConnectorType, SocialProvider } from '../../src/utils/TypeUtil'

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {}
  return {
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
})()

Object.defineProperty(global, 'localStorage', { value: localStorageMock })

describe('StorageUtil', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  afterEach(() => {
    // Restore all mocks after each test
    vi.restoreAllMocks()
  })

  describe('setWalletConnectDeepLink', () => {
    it('should set WalletConnect deep link in localStorage', () => {
      const deepLink = { href: 'https://example.com', name: 'Example Wallet' }
      StorageUtil.setWalletConnectDeepLink(deepLink)
      expect(localStorage.getItem('WALLETCONNECT_DEEPLINK_CHOICE')).toBe(JSON.stringify(deepLink))
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
      localStorage.setItem('WALLETCONNECT_DEEPLINK_CHOICE', JSON.stringify(deepLink))
      expect(StorageUtil.getWalletConnectDeepLink()).toEqual(deepLink)
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
      localStorage.setItem(
        'WALLETCONNECT_DEEPLINK_CHOICE',
        JSON.stringify({ href: 'https://example.com', name: 'Example Wallet' })
      )
      StorageUtil.deleteWalletConnectDeepLink()
      expect(localStorage.getItem('WALLETCONNECT_DEEPLINK_CHOICE')).toBeNull()
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

  describe('setWeb3ModalRecent', () => {
    it('should add a new wallet to recent wallets', () => {
      const wallet: WcWallet = { id: 'wallet1', name: 'Wallet 1' }
      StorageUtil.setWeb3ModalRecent(wallet)
      expect(StorageUtil.getRecentWallets()).toEqual([wallet])
    })

    it('should not add duplicate wallets', () => {
      const wallet: WcWallet = { id: 'wallet1', name: 'Wallet 1' }
      StorageUtil.setWeb3ModalRecent(wallet)
      StorageUtil.setWeb3ModalRecent(wallet)
      expect(StorageUtil.getRecentWallets()).toEqual([wallet])
    })

    it('should limit recent wallets to 2', () => {
      const wallet1: WcWallet = { id: 'wallet1', name: 'Wallet 1' }
      const wallet2: WcWallet = { id: 'wallet2', name: 'Wallet 2' }
      const wallet3: WcWallet = { id: 'wallet3', name: 'Wallet 3' }
      StorageUtil.setWeb3ModalRecent(wallet1)
      StorageUtil.setWeb3ModalRecent(wallet2)
      StorageUtil.setWeb3ModalRecent(wallet3)
      expect(StorageUtil.getRecentWallets()).toEqual([wallet3, wallet2])
    })
  })

  describe('getRecentWallets', () => {
    it('should return an empty array if no recent wallets', () => {
      expect(StorageUtil.getRecentWallets()).toEqual([])
    })

    it('should return recent wallets', () => {
      const wallet: WcWallet = { id: 'wallet1', name: 'Wallet 1' }
      localStorage.setItem('@w3m/recent', JSON.stringify([wallet]))
      expect(StorageUtil.getRecentWallets()).toEqual([wallet])
    })
  })

  describe('setConnectedConnector', () => {
    it('should set connected connector', () => {
      const connector: ConnectorType = 'INJECTED'
      StorageUtil.setConnectedConnector(connector)
      expect(localStorage.getItem('@w3m/connected_connector')).toBe(connector)
    })
  })

  describe('getConnectedConnector', () => {
    it('should get connected connector', () => {
      const connector: ConnectorType = 'INJECTED'
      localStorage.setItem('@w3m/connected_connector', connector)
      expect(StorageUtil.getConnectedConnector()).toBe(connector)
    })
  })

  describe('setConnectedSocialProvider', () => {
    it('should set connected social provider', () => {
      const provider: SocialProvider = 'google'
      StorageUtil.setConnectedSocialProvider(provider)
      expect(localStorage.getItem('@w3m/connected_social')).toBe(provider)
    })
  })

  describe('getConnectedSocialProvider', () => {
    it('should get connected social provider', () => {
      const provider: SocialProvider = 'google'
      localStorage.setItem('@w3m/connected_social', provider)
      expect(StorageUtil.getConnectedSocialProvider()).toBe(provider)
    })
  })

  describe('getConnectedSocialUsername', () => {
    it('should get connected social username', () => {
      const username = 'testuser'
      localStorage.setItem('@w3m-storage/SOCIAL_USERNAME', username)
      expect(StorageUtil.getConnectedSocialUsername()).toBe(username)
    })
  })
})
