import { vi } from 'vitest'

import type { CaipNetwork } from '@reown/appkit-common'
import type { ChainAdapter } from '@reown/appkit-core'
import type { SdkVersion } from '@reown/appkit-core'
import { CaipNetworksUtil } from '@reown/appkit-utils'

import {
  base as baseNetwork,
  mainnet as mainnetNetwork,
  polygon as polygonNetwork,
  sepolia as sepoliaNetwork,
  solana as solanaNetwork
} from '../../src/networks/index.js'
import type { AppKitOptions } from '../../src/utils/index.js'

const [base, mainnet, polygon, sepolia, solana] = CaipNetworksUtil.extendCaipNetworks(
  [baseNetwork, mainnetNetwork, polygonNetwork, sepoliaNetwork, solanaNetwork],
  { customNetworkImageUrls: {}, projectId: 'test-project-id' }
) as [CaipNetwork, CaipNetwork, CaipNetwork, CaipNetwork, CaipNetwork]

export { base, mainnet, polygon, sepolia, solana }

export const mockEvmAdapter = {
  chainNamespace: 'eip155',
  construct: vi.fn(),
  syncConnectors: vi.fn(),
  setAuthProvider: vi.fn(),
  getAccounts: vi.fn().mockResolvedValue({ accounts: [{ address: '0x123', type: 'eoa' }] }),
  syncConnection: vi.fn().mockResolvedValue({
    chainId: mainnet.caipNetworkId,
    address: '0x123'
  }),
  getBalance: vi.fn().mockResolvedValue({ balance: '0', symbol: 'ETH' }),
  getProfile: vi.fn().mockResolvedValue({}),
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn()
} as unknown as ChainAdapter

export const mockSolanaAdapter = {
  chainNamespace: 'solana',
  construct: vi.fn(),
  syncConnectors: vi.fn(),
  setAuthProvider: vi.fn(),
  getAccounts: vi.fn().mockResolvedValue({ accounts: [{ address: '0x123', type: 'eoa' }] }),
  syncConnection: vi.fn().mockResolvedValue({
    chainId: solana.caipNetworkId,
    address: '7y523k4jsh90d'
  }),
  getBalance: vi.fn().mockResolvedValue({ balance: '0', symbol: 'ETH' }),
  getProfile: vi.fn().mockResolvedValue({}),
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn()
} as unknown as ChainAdapter

export const mockOptions: AppKitOptions & {
  sdkVersion: SdkVersion
  sdkType: string
} = {
  projectId: 'test-project-id',
  adapters: [mockEvmAdapter, mockSolanaAdapter],
  networks: [mainnet, sepolia, solana],
  defaultNetwork: mainnet,
  metadata: {
    name: 'Test App',
    description: 'Test App Description',
    url: 'https://test-app.com',
    icons: ['https://test-app.com/icon.png']
  },
  sdkVersion: `html-wagmi-5.1.6`,
  sdkType: 'appkit'
}

export const mockUser = {
  address: '0x123',
  accounts: [
    { address: '0x1', type: 'eoa' },
    { address: '0x2', type: 'smartAccount' }
  ],
  preferredAccountType: 'eoa',
  user: {
    email: 'email@test.com',
    username: 'test'
  }
}

export const mockAuthProvider = {
  onConnect: vi.fn(callback => callback(mockUser)),
  connect: vi.fn(),
  getSmartAccountEnabledNetworks: vi.fn(),
  onGetSmartAccountEnabledNetworks: vi.fn(),
  onSetPreferredAccount: vi.fn(),
  onRpcRequest: vi.fn(),
  onRpcError: vi.fn(),
  onRpcSuccess: vi.fn(),
  onNotConnected: vi.fn(),
  onIsConnected: vi.fn(),
  getLoginEmailUsed: vi.fn().mockReturnValue(false),
  isConnected: vi.fn().mockResolvedValue({ isConnected: false }),
  getEmail: vi.fn().mockReturnValue('email@email.com'),
  getUsername: vi.fn().mockReturnValue('test'),
  onSocialConnected: vi.fn(),
  syncDappData: vi.fn(),
  syncTheme: vi.fn()
}
