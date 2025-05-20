import { vi } from 'vitest'

import { TestConstants } from '../constants/TestConstants.js'

/**
 * Mock Ethers JsonRpcProvider
 */
export function mockEthersJsonRpcProvider(overrides: Record<string, any> = {}): Record<string, any> {
  return {
    getBalance: vi.fn().mockResolvedValue(BigInt(1000000000000000000)), // 1 ETH in wei
    estimateGas: vi.fn().mockResolvedValue(BigInt(21000)),
    getGasPrice: vi.fn().mockResolvedValue(BigInt(2000000000)), // 2 gwei
    getTransactionCount: vi.fn().mockResolvedValue(1),
    getSigner: vi.fn().mockReturnValue({
      address: TestConstants.accounts.evm[0].address,
      signMessage: vi.fn().mockResolvedValue(TestConstants.signatures.evm),
      sendTransaction: vi.fn().mockResolvedValue({
        hash: TestConstants.signatures.evm
      })
    }),
    ...overrides
  }
}

/**
 * Mock Ethers BrowserProvider
 */
export function mockEthersBrowserProvider(overrides: Record<string, any> = {}): Record<string, any> {
  return {
    on: vi.fn(),
    removeListener: vi.fn(),
    getSigner: vi.fn().mockReturnValue({
      address: TestConstants.accounts.evm[0].address,
      signMessage: vi.fn().mockResolvedValue(TestConstants.signatures.evm),
      sendTransaction: vi.fn().mockResolvedValue({
        hash: TestConstants.signatures.evm
      })
    }),
    ...overrides
  }
}

/**
 * Mock Auth connector for Ethers testing
 */
export function mockAuthConnector(overrides: Record<string, any> = {}): Record<string, any> {
  return {
    connect: vi.fn().mockResolvedValue({
      address: TestConstants.accounts.evm[0].address,
      chainId: 1,
      smartAccountDeployed: true,
      preferredAccountType: 'eoa',
      accounts: []
    }),
    getUser: vi.fn().mockResolvedValue({
      address: TestConstants.accounts.evm[0].address,
      chainId: 1,
      smartAccountDeployed: true,
      preferredAccountType: 'eoa',
      accounts: []
    }),
    on: vi.fn(),
    removeListener: vi.fn(),
    request: vi.fn(),
    disconnect: vi.fn(),
    switchNetwork: vi.fn(),
    ...overrides
  }
}
