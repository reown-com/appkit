import type UniversalProvider from '@walletconnect/universal-provider'
import { type Mocked, vi } from 'vitest'

import { mockUser } from './Account.js'

export const mockProvider = {
  connect: vi.fn(),
  connectors: [],
  construct: vi.fn(),
  emit: vi.fn(),
  getAccounts: vi.fn().mockResolvedValue({ accounts: [] }),
  getSmartAccountEnabledNetworks: vi.fn(),
  namespace: 'eip155',
  off: vi.fn(),
  on: vi.fn(),
  onConnect: vi.fn(callback => callback(mockUser)),
  onGetSmartAccountEnabledNetworks: vi.fn(),
  onRpcError: vi.fn(),
  onRpcRequest: vi.fn(),
  onSetPreferredAccount: vi.fn(),
  removeAllEventListeners: vi.fn(),
  setAuthProvider: vi.fn(),
  setUniversalProvider: vi.fn(),
  syncConnectors: vi.fn()
}

export const mockAuthProvider = {
  connect: vi.fn(),
  getEmail: vi.fn().mockReturnValue('email@email.com'),
  getLoginEmailUsed: vi.fn().mockReturnValue(false),
  getSmartAccountEnabledNetworks: vi.fn(),
  getUsername: vi.fn().mockReturnValue('test'),
  isConnected: vi.fn().mockResolvedValue({ isConnected: false }),
  onConnect: vi.fn(callback => callback(mockUser)),
  onGetSmartAccountEnabledNetworks: vi.fn(),
  onIsConnected: vi.fn(),
  onNotConnected: vi.fn(),
  onRpcError: vi.fn(),
  onRpcRequest: vi.fn(),
  onRpcSuccess: vi.fn(),
  onSetPreferredAccount: vi.fn(),
  onSocialConnected: vi.fn(),
  syncDappData: vi.fn(),
  syncTheme: vi.fn()
}

export const mockUniversalProvider: Mocked<Pick<UniversalProvider, 'on' | 'off'>> = {
  off: vi.fn(),
  on: vi.fn()
}
