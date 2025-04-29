import { vi } from 'vitest'

import { Emitter } from '@reown/appkit-common'

import type { AdapterBlueprint } from '../../src/adapters/ChainAdapterBlueprint.js'
import { bitcoin, mainnet, solana } from './Networks.js'
import { mockProvider } from './Providers.js'

export const mockUniversalAdapter = {
  namespace: 'eip155',
  setUniversalProvider: vi.fn(),
  setAuthProvider: vi.fn(),
  connectWalletConnect: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn(),
  syncConnectors: vi.fn(),
  getWalletConnectProvider: vi.fn(),
  getBalance: vi.fn().mockResolvedValue({ balance: '0', symbol: 'ETH' }),
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
  emit: vi.fn(),
  construct: vi.fn()
} as unknown as AdapterBlueprint

export const mockBitcoinAdapter = {
  namespace: 'bip122',
  construct: vi.fn(),
  syncConnectors: vi.fn().mockResolvedValue(vi.fn()),
  setAuthProvider: vi.fn().mockResolvedValue(vi.fn()),
  setUniversalProvider: vi.fn().mockResolvedValue(vi.fn()),
  getProvider: vi.fn().mockReturnValue(mockProvider),
  getAccounts: vi.fn().mockResolvedValue({ accounts: [{ address: '03kh342934h', type: 'eoa' }] }),
  syncConnection: vi.fn().mockResolvedValue({
    id: 'bip122-connector',
    type: 'EXTERNAL',
    chainId: bitcoin.caipNetworkId,
    address: '03kh342934h'
  }),
  getBalance: vi.fn().mockResolvedValue({ balance: '1.00', symbol: 'BTC' }),
  getProfile: vi.fn().mockResolvedValue({}),
  getWalletConnectProvider: vi.fn().mockResolvedValue(mockProvider),
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  removeAllEventListeners: vi.fn()
} as unknown as AdapterBlueprint

export const emitter = new Emitter()
export const solanaEmitter = new Emitter()

export const mockEvmAdapter = {
  namespace: 'eip155',
  construct: vi.fn(),
  syncConnectors: vi.fn().mockResolvedValue(vi.fn()),
  setAuthProvider: vi.fn().mockResolvedValue(vi.fn()),
  setUniversalProvider: vi.fn().mockResolvedValue(vi.fn()),
  getProvider: vi.fn().mockReturnValue(mockProvider),
  getAccounts: vi.fn().mockResolvedValue({ accounts: [{ address: '0x123', type: 'eoa' }] }),
  syncConnection: vi.fn().mockResolvedValue({
    id: 'evm-connector',
    type: 'EXTERNAL',
    chainId: mainnet.caipNetworkId,
    address: '0x123'
  }),
  getBalance: vi.fn().mockResolvedValue({ balance: '1.00', symbol: 'ETH' }),
  getProfile: vi.fn().mockResolvedValue({}),
  getWalletConnectProvider: vi.fn().mockResolvedValue(mockProvider),
  estimateGas: vi.fn().mockResolvedValue({ gas: 21000n }),
  on: emitter.on.bind(emitter),
  off: emitter.off.bind(emitter),
  emit: emitter.emit.bind(emitter),
  removeAllEventListeners: vi.fn(),
  connect: vi.fn().mockResolvedValue({ address: '0x123' }),
  reconnect: vi.fn().mockResolvedValue({ address: '0x123' }),
  connectWalletConnect: vi.fn().mockResolvedValue({ clientId: 'test-client' }),
  disconnect: vi.fn().mockResolvedValue(undefined)
} as unknown as AdapterBlueprint

export const mockSolanaAdapter = {
  namespace: 'solana',
  construct: vi.fn(),
  syncConnectors: vi.fn().mockResolvedValue(vi.fn()),
  setAuthProvider: vi.fn().mockResolvedValue(vi.fn()),
  setUniversalProvider: vi.fn().mockResolvedValue(vi.fn()),
  getAccounts: vi.fn().mockResolvedValue({ accounts: [{ address: '7y523k4jsh90d', type: 'eoa' }] }),
  syncConnection: vi.fn().mockResolvedValue({
    id: 'solana-connector',
    type: 'EXTERNAL',
    chainId: solana.caipNetworkId,
    address: '7y523k4jsh90d'
  }),
  getBalance: vi.fn().mockResolvedValue({ balance: '1.00', symbol: 'SOL' }),
  getProfile: vi.fn().mockResolvedValue({}),
  estimateGas: vi.fn().mockResolvedValue({ gas: 0n }),
  on: solanaEmitter.on.bind(solanaEmitter),
  off: solanaEmitter.off.bind(solanaEmitter),
  emit: solanaEmitter.emit.bind(solanaEmitter),
  removeAllEventListeners: vi.fn()
} as unknown as AdapterBlueprint
