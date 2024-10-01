import { vi } from 'vitest'

export const mockAuthConnector = {
  onRpcRequest: vi.fn(),
  onRpcError: vi.fn(),
  onRpcSuccess: vi.fn(),
  onNotConnected: vi.fn(),
  onIsConnected: vi.fn(),
  onConnect: vi.fn(),
  onSetPreferredAccount: vi.fn(),
  connect: vi.fn().mockResolvedValue({
    address: '0x1234567890123456789012345678901234567890',
    chainId: 1,
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
