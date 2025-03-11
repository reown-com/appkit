import { vi } from 'vitest'

export const defaultLocalStorageState = {
  '@appkit/eip155_connected_connector_id': 'evm-connector',
  '@appkit/solana_connected_connector_id': 'solana-connector'
}

// Define a mock for localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    // Initialize the store with a default state
    initialize(defaultState: Record<string, string>) {
      store = { ...defaultState }
    },
    // Mock implementation of getItem
    getItem: vi.fn((key: string) => store[key] || null),

    // Mock implementation of setItem
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),

    // Mock implementation of removeItem
    removeItem: vi.fn((key: string) => {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete store[key]
    }),

    // Mock implementation of clear
    clear: vi.fn(() => {
      store = {}
    }),

    // Utility to get the current state of the store (for testing purposes)
    getStore: () => store
  }
})()

export function mockLocalStorage(defaultState?: Record<string, string>) {
  localStorageMock.initialize(defaultState || defaultLocalStorageState)

  return localStorageMock
}
