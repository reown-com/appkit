import { vi } from 'vitest'

export const mockAuthConnector = {
  onRpcRequest: vi.fn(),
  onRpcError: vi.fn(),
  onRpcSuccess: vi.fn(),
  onConnect: vi.fn(),
  onNotConnected: vi.fn(),
  onIsConnected: vi.fn(),
  onSetPreferredAccount: vi.fn(),
  connect: vi.fn().mockResolvedValue({
    address: 'f558d7ee6670ce7a44846ecd311532f499b9a13a21a754672ae5bdc484cee935',
    chainId: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
    smartAccountDeployed: true,
    preferredAccountType: 'eoa',
    accounts: []
  }),
  getSmartAccountEnabledNetworks: vi.fn().mockResolvedValue({
    smartAccountEnabledNetworks: [1, 137]
  }),
  on: vi.fn(),
  removeListener: vi.fn(),
  getLoginEmailUsed: vi.fn().mockReturnValue(false),
  isConnected: vi.fn().mockResolvedValue({ isConnected: false }),
  disconnect: vi.fn(),
  switchNetwork: vi.fn(),
  rejectRpcRequests: vi.fn(),
  request: vi.fn()
}
