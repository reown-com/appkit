/**
 * Mock @polkadot/extension-dapp for testing
 * Stubs web3Enable, web3Accounts, web3FromAddress, etc.
 */
import { vi } from 'vitest'
import { MOCK_ACCOUNTS, getAccountsBySource, type InjectedAccountWithMeta } from './mockAccounts.js'

// Track enabled state
let extensionsEnabled = false
let enabledExtensions: any[] = []

// Mock injected extension interface
interface MockInjectedExtension {
  name: string
  version: string
  signer: {
    signRaw: (request: { address: string; data: string; type: string }) => Promise<{ signature: string }>
  }
}

/**
 * Mock web3Enable - simulate extension authorization
 */
export const web3Enable = vi.fn(async (appName: string): Promise<any[]> => {
  console.log('[MockExtension] web3Enable called with:', appName)
  
  if (extensionsEnabled) {
    console.log('[MockExtension] Already enabled, returning cached')
    return enabledExtensions
  }

  // Check if any extensions are available in window.injectedWeb3
  if (typeof window === 'undefined' || !(window as any).injectedWeb3) {
    console.log('[MockExtension] No extensions available')
    return []
  }

  const injectedWeb3 = (window as any).injectedWeb3
  enabledExtensions = Object.keys(injectedWeb3).map(key => ({
    name: key,
    version: injectedWeb3[key].version || '1.0.0'
  }))

  extensionsEnabled = enabledExtensions.length > 0
  console.log('[MockExtension] Enabled extensions:', enabledExtensions.length)
  return enabledExtensions
})

/**
 * Mock web3Accounts - return mock accounts from enabled extensions
 */
export const web3Accounts = vi.fn(async (): Promise<InjectedAccountWithMeta[]> => {
  console.log('[MockExtension] web3Accounts called')
  
  if (!extensionsEnabled) {
    console.log('[MockExtension] Extensions not enabled')
    return []
  }

  // Return accounts from all enabled extensions
  const availableAccounts = MOCK_ACCOUNTS.filter(acc => {
    if (typeof window === 'undefined') return false
    const injectedWeb3 = (window as any).injectedWeb3
    return injectedWeb3 && injectedWeb3[acc.meta.source]
  })

  console.log('[MockExtension] Returning accounts:', availableAccounts.length)
  return availableAccounts
})

/**
 * Mock web3FromAddress - get signer for an address
 */
export const web3FromAddress = vi.fn(async (address: string): Promise<MockInjectedExtension> => {
  console.log('[MockExtension] web3FromAddress called for:', address)
  
  // Find the account to determine its source
  const account = MOCK_ACCOUNTS.find(acc => acc.address === address)
  if (!account) {
    throw new Error(`Account not found: ${address}`)
  }

  // Return mock injector with signer
  return {
    name: account.meta.source,
    version: '1.0.0',
    signer: {
      signRaw: async (request: { address: string; data: string; type: string }) => {
        console.log('[MockExtension] signRaw called:', request)
        
        // Return mock signature (0x + 128 hex chars = 64 bytes)
        const signature = '0x' + 'de'.repeat(64)
        return { signature }
      }
    }
  }
})

/**
 * Mock web3AccountsSubscribe - subscribe to account changes
 */
type AccountSubscriptionCallback = (accounts: InjectedAccountWithMeta[]) => void
let accountSubscriptionCallback: AccountSubscriptionCallback | null = null

export const web3AccountsSubscribe = vi.fn(
  async (callback: AccountSubscriptionCallback): Promise<() => void> => {
    console.log('[MockExtension] web3AccountsSubscribe called')
    accountSubscriptionCallback = callback

    // Immediately call with current accounts
    const accounts = await web3Accounts()
    callback(accounts)

    // Return unsubscribe function
    return () => {
      console.log('[MockExtension] Unsubscribed from account changes')
      accountSubscriptionCallback = null
    }
  }
)

/**
 * Trigger account change (for testing)
 */
export function triggerAccountChange(accounts: InjectedAccountWithMeta[]) {
  if (accountSubscriptionCallback) {
    console.log('[MockExtension] Triggering account change:', accounts.length)
    accountSubscriptionCallback(accounts)
  }
}

/**
 * Reset mock state (call in beforeEach)
 */
export function resetMockExtension() {
  extensionsEnabled = false
  enabledExtensions = []
  accountSubscriptionCallback = null
  web3Enable.mockClear()
  web3Accounts.mockClear()
  web3FromAddress.mockClear()
  web3AccountsSubscribe.mockClear()
}

