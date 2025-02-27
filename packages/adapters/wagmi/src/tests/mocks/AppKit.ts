import { vi } from 'vitest'

import type { AppKit } from '@reown/appkit'
import { type Chain, mainnet } from '@reown/appkit/networks'

export const mockCaipNetworks = [mainnet] as [Chain, ...Chain[]]
export const mockAddress = '0xf5B035287c1465F29C7e08FbB5c3b8a4975Bf831'
export const mockCaipNetworkId = 'eip155:1'
export const mockCaipAddress = `${mockCaipNetworkId}:${mockAddress}`
export const mockAccounts = [mockCaipAddress]

export const mockSession = {
  namespaces: {
    eip155: {
      accounts: mockAccounts,
      chains: [mockCaipNetworkId]
    }
  }
}

export const mockProvider = {
  on: vi.fn(),
  removeListener: vi.fn(),
  enable: vi.fn().mockResolvedValue([mockAddress]),
  request: vi.fn(),
  disconnect: vi.fn(),
  events: {
    setMaxListeners: vi.fn()
  },
  session: mockSession,
  setDefaultChain: vi.fn()
}

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
  setPreferredAccountType: vi.fn(),
  getPreferredAccountType: vi.fn().mockReturnValue('eoa'),
  setEIP6963Enabled: vi.fn(),
  getCaipNetwork: vi.fn().mockReturnValue(mainnet),
  getCaipNetworks: vi.fn().mockReturnValue(mockCaipNetworks),
  subscribeState: vi.fn().mockImplementation(callback => vi.fn(() => callback({}))),
  setApprovedCaipNetworksData: vi.fn(),
  getActiveChainNamespace: vi.fn().mockReturnValue('eip155'),
  getAddress: vi.fn().mockReturnValue('0xE62a3eD41B21447b67a63880607CD2E746A0E35d'),
  addConnector: vi.fn(),
  setCaipNetwork: vi.fn(),
  setLoading: vi.fn(),
  setSmartAccountEnabledNetworks: vi.fn(),
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
  setClientId: vi.fn(),
  getAccounts: vi.fn(),
  signMessage: vi.fn(),
  sendTransaction: vi.fn(),
  writeContract: vi.fn(),
  getEnsAddress: vi.fn(),
  estimateGas: vi.fn(),
  parseUnits: vi.fn(),
  formatUnits: vi.fn(),
  syncConnectors: vi.fn(),
  syncConnection: vi.fn(),
  connectWalletConnect: vi.fn(),
  connect: vi.fn(),
  reconnect: vi.fn(),
  getBalance: vi.fn(),
  getProfile: vi.fn(),
  getWalletConnectProvider: vi.fn(),
  disconnect: vi.fn(),
  switchNetwork: vi.fn(),
  getCapabilities: vi.fn(),
  grantPermissions: vi.fn(),
  revokePermissions: vi.fn(),
  walletGetAssets: vi.fn(),
  getUniversalProvider: vi.fn().mockResolvedValue(mockProvider),
  getProvider: vi.fn(),
  universalAdapter: {
    connectionControllerClient: {
      connectWalletConnect: vi.fn(),
      disconnect: vi.fn()
    },
    networkControllerClient: {
      switchCaipNetwork: vi.fn()
    }
  },
  getConnectorImage: vi.fn(),
  handleUnsafeRPCRequest: vi.fn().mockImplementation(() => {
    if (mockAppKit.isOpen()) {
      if (mockAppKit.isTransactionStackEmpty()) {
        return
      }
      mockAppKit.redirect('ApproveTransaction')
    } else {
      mockAppKit.open({ view: 'ApproveTransaction' })
    }
  })
} as unknown as AppKit
