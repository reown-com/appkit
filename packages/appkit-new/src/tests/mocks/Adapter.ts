import { vi } from 'vitest'
import type { AdapterBlueprint } from '../../adapters/ChainAdapterBlueprint.js'

export const mockUniversalAdapter = {
  namespace: 'eip155',
  setUniversalProvider: vi.fn(),
  setAuthProvider: vi.fn(),
  connectWalletConnect: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn(),
  syncConnectors: vi.fn(),
  getWalletConnectProvider: vi.fn(),
  getBalance: vi.fn(),
  getProfile: vi.fn(),
  signMessage: vi.fn(),
  sendTransaction: vi.fn(),
  switchNetwork: vi.fn(),
  estimateGas: vi.fn(),
  writeContract: vi.fn(),
  parseUnits: vi.fn(),
  formatUnits: vi.fn(),
  getEnsAddress: vi.fn(),
  getCapabilities: vi.fn(),
  grantPermissions: vi.fn(),
  revokePermissions: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn()
} as unknown as AdapterBlueprint

export default mockUniversalAdapter
