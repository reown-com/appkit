import { vi } from 'vitest'

import type { AppKit } from '../../src/client/appkit.js'
import { mainnet } from '../../src/networks/index.js'

export const mockAppKit = {
  setIsConnected: vi.fn(),
  getIsConnectedState: vi.fn().mockReturnValue(true),
  setCaipAddress: vi.fn(),
  getCaipAddress: vi.fn().mockReturnValue('eip155:1:0xE62a3eD41B21447b67a63880607CD2E746A0E35d'),
  setRequestedCaipNetworks: vi.fn(),
  setConnectors: vi.fn(),
  getConnectors: vi.fn().mockReturnValue([]),
  setConnectedWalletInfo: vi.fn(),
  resetWcConnection: vi.fn(),
  resetNetwork: vi.fn(),
  resetAccount: vi.fn(),
  setAllAccounts: vi.fn(),
  setPreferredAccountType: vi.fn(),
  getPreferredAccountType: vi.fn().mockReturnValue('eoa'),
  getCaipNetwork: vi.fn().mockReturnValue(mainnet),
  setApprovedCaipNetworksData: vi.fn(),
  getAddress: vi.fn().mockReturnValue('0xE62a3eD41B21447b67a63880607CD2E746A0E35d'),
  setClientId: vi.fn()
} as unknown as AppKit

export default mockAppKit
