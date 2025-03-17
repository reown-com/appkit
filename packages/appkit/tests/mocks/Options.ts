import type { SdkVersion } from '@reown/appkit-controllers'

import type { AppKitOptions } from '../../src/utils/index.js'
import { mockEvmAdapter, mockSolanaAdapter } from './Adapter.js'
import { mainnet, sepolia, solana } from './Networks.js'

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
