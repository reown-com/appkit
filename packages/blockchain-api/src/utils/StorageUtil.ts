import type {
  BlockchainApiBalanceResponse,
  BlockchainApiIdentityResponse,
  BlockchainApiLookupEnsName
} from '../types/index.js'
import { CACHE_EXPIRY } from './constants.js'

// Define keys for localStorage
const STORAGE_KEYS = {
  PORTFOLIO_CACHE: 'w3m_blockchain_api_portfolio_cache',
  NATIVE_BALANCE_CACHE: 'w3m_blockchain_api_native_balance_cache',
  ENS_CACHE: 'w3m_blockchain_api_ens_cache',
  IDENTITY_CACHE: 'w3m_blockchain_api_identity_cache'
}

// Interface for SafeLocalStorage access
interface StorageProvider {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

// Use localStorage if available, otherwise use memory storage
const getStorage = (): StorageProvider => {
  // Check if localStorage is available
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage
  }

  // Fallback to in-memory storage
  const memoryStorage: Record<string, string> = {}
  return {
    getItem: key => memoryStorage[key] || null,
    setItem: (key, value) => {
      memoryStorage[key] = value
    },
    removeItem: key => {
      delete memoryStorage[key]
    }
  }
}

// Storage Utility
export const StorageUtil = {
  // Helper to check if cache is expired
  isCacheExpired(timestamp: number, cacheExpiry: number): boolean {
    return Date.now() - timestamp > cacheExpiry
  },

  // Balance cache methods
  getBalanceCache(): Record<string, { timestamp: number; balance: BlockchainApiBalanceResponse }> {
    let cache: Record<string, { timestamp: number; balance: BlockchainApiBalanceResponse }> = {}
    try {
      const storage = getStorage()
      const result = storage.getItem(STORAGE_KEYS.PORTFOLIO_CACHE)
      cache = result ? JSON.parse(result) : {}
    } catch (error) {
      console.info('Unable to get balance cache')
    }
    return cache
  },

  getBalanceCacheForCaipAddress(caipAddress: string): BlockchainApiBalanceResponse | undefined {
    const cache = this.getBalanceCache()
    const item = cache[caipAddress]

    if (item && !this.isCacheExpired(item.timestamp, CACHE_EXPIRY.PORTFOLIO)) {
      return item.balance
    }

    return undefined
  },

  updateBalanceCache(params: {
    caipAddress: string
    balance: BlockchainApiBalanceResponse
    timestamp: number
  }): void {
    try {
      const storage = getStorage()
      const cache = this.getBalanceCache()
      cache[params.caipAddress] = params
      storage.setItem(STORAGE_KEYS.PORTFOLIO_CACHE, JSON.stringify(cache))
    } catch (error) {
      console.info('Unable to update balance cache', params)
    }
  },

  // ENS cache methods
  getEnsCache(): Record<string, { ens: BlockchainApiLookupEnsName[]; timestamp: number }> {
    let cache: Record<string, { ens: BlockchainApiLookupEnsName[]; timestamp: number }> = {}
    try {
      const storage = getStorage()
      const result = storage.getItem(STORAGE_KEYS.ENS_CACHE)
      cache = result ? JSON.parse(result) : {}
    } catch (error) {
      console.info('Unable to get ENS name cache')
    }
    return cache
  },

  getEnsCacheForAddress(address: string): BlockchainApiLookupEnsName[] | undefined {
    const cache = this.getEnsCache()
    const item = cache[address]

    if (item && !this.isCacheExpired(item.timestamp, CACHE_EXPIRY.ENS)) {
      return item.ens
    }

    return undefined
  },

  updateEnsCache(params: {
    address: string
    timestamp: number
    ens: BlockchainApiLookupEnsName[]
  }): void {
    try {
      const storage = getStorage()
      const cache = this.getEnsCache()
      cache[params.address] = params
      storage.setItem(STORAGE_KEYS.ENS_CACHE, JSON.stringify(cache))
    } catch (error) {
      console.info('Unable to update ENS name cache', params)
    }
  },

  // Identity cache methods
  getIdentityCache(): Record<
    string,
    { identity: BlockchainApiIdentityResponse; timestamp: number }
  > {
    let cache: Record<string, { identity: BlockchainApiIdentityResponse; timestamp: number }> = {}
    try {
      const storage = getStorage()
      const result = storage.getItem(STORAGE_KEYS.IDENTITY_CACHE)
      cache = result ? JSON.parse(result) : {}
    } catch (error) {
      console.info('Unable to get identity cache')
    }
    return cache
  },

  getIdentityFromCacheForAddress(address: string): BlockchainApiIdentityResponse | undefined {
    const cache = this.getIdentityCache()
    const item = cache[address]

    if (item && !this.isCacheExpired(item.timestamp, CACHE_EXPIRY.IDENTITY)) {
      return item.identity
    }

    return undefined
  },

  updateIdentityCache(params: {
    address: string
    timestamp: number
    identity: BlockchainApiIdentityResponse
  }): void {
    try {
      const storage = getStorage()
      const cache = this.getIdentityCache()
      cache[params.address] = {
        identity: params.identity,
        timestamp: params.timestamp
      }
      storage.setItem(STORAGE_KEYS.IDENTITY_CACHE, JSON.stringify(cache))
    } catch (error) {
      console.info('Unable to update identity cache', params)
    }
  },

  // Clear all caches
  clearAllCaches(): void {
    try {
      const storage = getStorage()
      storage.removeItem(STORAGE_KEYS.PORTFOLIO_CACHE)
      storage.removeItem(STORAGE_KEYS.NATIVE_BALANCE_CACHE)
      storage.removeItem(STORAGE_KEYS.ENS_CACHE)
      storage.removeItem(STORAGE_KEYS.IDENTITY_CACHE)
    } catch (error) {
      console.info('Unable to clear caches')
    }
  }
}
