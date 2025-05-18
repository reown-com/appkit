import { vi } from 'vitest'

import { Emitter } from '@reown/appkit-common'
import type { AdapterBlueprint } from '@reown/appkit/adapters'
import { bitcoin, mainnet, solana } from '@reown/appkit/networks'

import { TestConstants } from '../constants/TestConstants.js'

/**
 * Create a mock adapter with common methods and optional overrides
 */
export function createMockAdapter(namespace: string, overrides = {}) {
  const emitter = new Emitter()
  
  return {
    namespace,
    construct: vi.fn(),
    syncConnectors: vi.fn().mockResolvedValue(vi.fn()),
    setAuthProvider: vi.fn().mockResolvedValue(vi.fn()),
    setUniversalProvider: vi.fn().mockResolvedValue(vi.fn()),
    getProvider: vi.fn(),
    getAccounts: vi.fn(),
    syncConnection: vi.fn(),
    getBalance: vi.fn(),
    on: emitter.on.bind(emitter),
    off: emitter.off.bind(emitter),
    emit: emitter.emit.bind(emitter),
    removeAllEventListeners: vi.fn(),
    connect: vi.fn(),
    reconnect: vi.fn(),
    disconnect: vi.fn(),
    ...overrides
  } as unknown as AdapterBlueprint
}

/**
 * Create a mock EVM adapter
 */
export function createMockEvmAdapter(overrides = {}) {
  return createMockAdapter('eip155', {
    getAccounts: vi.fn().mockResolvedValue({ 
      accounts: [{ address: TestConstants.accounts.evm[0].address, type: 'eoa' }] 
    }),
    syncConnection: vi.fn().mockResolvedValue({
      id: 'evm-connector',
      type: 'EXTERNAL',
      chainId: mainnet.caipNetworkId,
      address: TestConstants.accounts.evm[0].address
    }),
    getBalance: vi.fn().mockResolvedValue(TestConstants.balances.evm),
    estimateGas: vi.fn().mockResolvedValue({ gas: 21000n }),
    connect: vi.fn().mockResolvedValue({ address: TestConstants.accounts.evm[0].address }),
    reconnect: vi.fn().mockResolvedValue({ address: TestConstants.accounts.evm[0].address }),
    ...overrides
  })
}

/**
 * Create a mock Bitcoin adapter
 */
export function createMockBitcoinAdapter(overrides = {}) {
  return createMockAdapter('bip122', {
    getAccounts: vi.fn().mockResolvedValue({ 
      accounts: [{ address: TestConstants.accounts.bitcoin[0].address, type: 'eoa' }] 
    }),
    syncConnection: vi.fn().mockResolvedValue({
      id: 'bip122-connector',
      type: 'EXTERNAL',
      chainId: bitcoin.caipNetworkId,
      address: TestConstants.accounts.bitcoin[0].address
    }),
    getBalance: vi.fn().mockResolvedValue(TestConstants.balances.bitcoin),
    ...overrides
  })
}

/**
 * Create a mock Solana adapter
 */
export function createMockSolanaAdapter(overrides = {}) {
  return createMockAdapter('solana', {
    getAccounts: vi.fn().mockResolvedValue({ 
      accounts: [{ address: TestConstants.accounts.solana[0].address, type: 'eoa' }] 
    }),
    syncConnection: vi.fn().mockResolvedValue({
      id: 'solana-connector',
      type: 'EXTERNAL',
      chainId: solana.caipNetworkId,
      address: TestConstants.accounts.solana[0].address
    }),
    getBalance: vi.fn().mockResolvedValue(TestConstants.balances.solana),
    estimateGas: vi.fn().mockResolvedValue({ gas: 0n }),
    ...overrides
  })
}
