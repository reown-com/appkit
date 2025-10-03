import { vi } from 'vitest'

import type { AppKit } from '@reown/appkit'
import { mainnet } from '@reown/appkit/networks'

export const mockAppKit = {
  setIsConnected: vi.fn(),
  getIsConnectedState: vi.fn().mockReturnValue(true),
  setCaipAddress: vi.fn(),
  getCaipAddress: vi
    .fn()
    .mockReturnValue(
      'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:f558d7ee6670ce7a44846ecd311532f499b9a13a21a754672ae5bdc484cee935'
    ),
  setRequestedCaipNetworks: vi.fn(),
  setConnectors: vi.fn(),
  getConnectors: vi.fn().mockReturnValue([]),
  setConnectedWalletInfo: vi.fn(),
  resetWcConnection: vi.fn(),
  resetNetwork: vi.fn(),
  resetAccount: vi.fn(),
  setPreferredAccountType: vi.fn(),
  getPreferredAccountType: vi.fn().mockReturnValue('eoa'),
  setEIP6963Enabled: vi.fn(),
  getCaipNetwork: vi.fn().mockReturnValue(mainnet),
  subscribeState: vi.fn().mockImplementation(callback => vi.fn(() => callback({}))),
  setApprovedCaipNetworksData: vi.fn(),
  getAddress: vi
    .fn()
    .mockReturnValue('f558d7ee6670ce7a44846ecd311532f499b9a13a21a754672ae5bdc484cee935'),
  addConnector: vi.fn(),
  setCaipNetwork: vi.fn(),
  setLoading: vi.fn(),
  setAllAccounts: vi.fn(),
  setStatus: vi.fn(),
  setSmartAccountDeployed: vi.fn(),
  open: vi.fn(),
  isOpen: vi.fn().mockReturnValue(false),
  isTransactionStackEmpty: vi.fn().mockReturnValue(true),
  replace: vi.fn(),
  redirect: vi.fn(),
  showErrorMessage: vi.fn(),
  close: vi.fn(),
  popTransactionStack: vi.fn(),
  setProfileName: vi.fn(),
  setProfileImage: vi.fn(),
  setAddressExplorerUrl: vi.fn(),
  setBalance: vi.fn(),
  getReownName: vi.fn().mockResolvedValue([]),
  fetchIdentity: vi.fn().mockResolvedValue(null),
  getActiveChainNamespace: vi.fn().mockReturnValue('solana'),
  setClientId: vi.fn(),
  universalAdapter: {
    connectionControllerClient: {
      connectWalletConnect: vi.fn(),
      disconnect: vi.fn()
    }
  },
  getConnectorImage: vi.fn()
} as unknown as AppKit

export default mockAppKit
