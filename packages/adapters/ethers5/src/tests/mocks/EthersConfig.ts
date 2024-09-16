import type { ProviderType } from '@reown/appkit-utils/ethers'
import { vi } from 'vitest'

export const mockEthersConfig = {
  metadata: {
    name: 'Mock dApp',
    description: 'A mock dApp for testing',
    url: 'https://mockdapp.com',
    icons: ['https://mockdapp.com/icon.png']
  },
  injected: {
    // Mock injected provider
    request: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn()
  },
  coinbase: {
    // Mock Coinbase provider
    request: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn()
  },
  EIP6963: true
} as unknown as ProviderType

// Mock function to create ethers config
export function mockCreateEthersConfig(): ProviderType {
  return {
    ...mockEthersConfig,
    metadata: {
      ...mockEthersConfig.metadata
    }
  }
}
