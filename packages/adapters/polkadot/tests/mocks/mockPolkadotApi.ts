/**
 * Mock @polkadot/api for testing
 * Stubs ApiPromise, WsProvider, and related API calls
 */
import { vi } from 'vitest'

// Track created API instances
const apiInstances = new Map<string, any>()

// Mock account data by address
const mockBalances = new Map<string, string>()

/**
 * Set mock balance for an address (in planck/smallest unit)
 */
export function setMockBalance(address: string, balance: string) {
  mockBalances.set(address, balance)
}

/**
 * Mock AccountInfo structure
 */
function createMockAccountInfo(balance: string) {
  return {
    data: {
      free: {
        toString: () => balance,
        toBigInt: () => BigInt(balance)
      },
      reserved: {
        toString: () => '0',
        toBigInt: () => BigInt(0)
      },
      miscFrozen: {
        toString: () => '0',
        toBigInt: () => BigInt(0)
      },
      feeFrozen: {
        toString: () => '0',
        toBigInt: () => BigInt(0)
      }
    },
    nonce: 0,
    consumers: 0,
    providers: 1,
    sufficients: 0
  }
}

/**
 * Mock WsProvider
 */
export class MockWsProvider {
  public endpoint: string

  constructor(endpoint: string) {
    this.endpoint = endpoint
    console.log('[MockApi] WsProvider created for:', endpoint)
  }

  async connect() {
    return this
  }

  async disconnect() {
    console.log('[MockApi] WsProvider disconnected')
  }
}

/**
 * Mock ApiPromise
 */
export class MockApiPromise {
  public registry: any
  public query: any
  private wsUrl: string

  constructor(wsUrl: string, decimals: number = 10, symbol: string = 'DOT') {
    this.wsUrl = wsUrl
    
    // Mock registry with chain metadata
    this.registry = {
      chainDecimals: [decimals],
      chainTokens: [symbol],
      chainSS58: 42
    }

    // Mock query interface
    this.query = {
      system: {
        account: vi.fn(async (address: string) => {
          console.log('[MockApi] Querying balance for:', address)
          const balance = mockBalances.get(address) || '0'
          return createMockAccountInfo(balance)
        })
      }
    }

    console.log('[MockApi] ApiPromise created for:', wsUrl, { decimals, symbol })
  }

  static async create(options: { provider: any }): Promise<MockApiPromise> {
    const endpoint = options.provider.endpoint
    console.log('[MockApi] ApiPromise.create called for:', endpoint)

    // Check if we already have an instance for this endpoint (caching)
    if (apiInstances.has(endpoint)) {
      console.log('[MockApi] Returning cached instance')
      return apiInstances.get(endpoint)
    }

    // Determine decimals and symbol based on endpoint
    let decimals = 10
    let symbol = 'DOT'
    
    if (endpoint.includes('kusama')) {
      decimals = 12
      symbol = 'KSM'
    } else if (endpoint.includes('westend')) {
      decimals = 12
      symbol = 'WND'
    }

    const api = new MockApiPromise(endpoint, decimals, symbol)
    apiInstances.set(endpoint, api)
    return api
  }

  async disconnect() {
    console.log('[MockApi] ApiPromise disconnected')
    apiInstances.delete(this.wsUrl)
  }

  async isReady() {
    return this
  }
}

/**
 * Mock formatBalance from @polkadot/util
 */
export const formatBalance = vi.fn((value: any, options?: any, decimals?: number): string => {
  console.log('[MockApi] formatBalance called:', { value, decimals })
  
  // Simple formatting: convert planck to decimal
  const dec = decimals || 10
  const val = typeof value === 'string' ? BigInt(value) : BigInt(value.toString())
  const divisor = BigInt(10 ** dec)
  const whole = val / divisor
  const fraction = val % divisor

  // Format with up to 4 decimal places
  const fractionStr = fraction.toString().padStart(dec, '0').slice(0, 4)
  return `${whole}.${fractionStr}`
})

/**
 * Reset mock API state (call in beforeEach)
 */
export function resetMockApi() {
  apiInstances.clear()
  mockBalances.clear()
  formatBalance.mockClear()
}

