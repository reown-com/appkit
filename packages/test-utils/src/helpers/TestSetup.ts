import { vi } from 'vitest'

import { ChainController, type ConnectionControllerClient, type NetworkControllerClient } from '@reown/appkit-controllers'
import type { CaipNetwork } from '@reown/appkit-common'

import { createMockBitcoinAdapter, createMockEvmAdapter, createMockSolanaAdapter } from '../mocks/MockAdapter.js'

/**
 * Initialize ChainController with mock adapters for testing
 */
export function setupChainController(networks: CaipNetwork[], namespace: string) {
  let adapter
  
  switch (namespace) {
    case 'eip155':
      adapter = createMockEvmAdapter()
      break
    case 'bip122':
      adapter = createMockBitcoinAdapter()
      break
    case 'solana':
      adapter = createMockSolanaAdapter()
      break
    default:
      throw new Error(`Unsupported namespace: ${namespace}`)
  }
  
  ChainController.initialize([adapter], networks, {
    connectionControllerClient: vi.fn() as unknown as ConnectionControllerClient,
    networkControllerClient: vi.fn() as unknown as NetworkControllerClient
  })
  
  ChainController.setRequestedCaipNetworks(networks, namespace)
  
  return adapter
}

/**
 * Reset all mocks between tests
 */
export function resetAllMocks() {
  vi.clearAllMocks()
}
