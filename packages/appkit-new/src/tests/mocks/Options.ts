import type { ChainAdapter } from '@reown/appkit-core'
import type { AppKitOptions } from '../../utils/index.js'
import { mainnet, solana } from '../../networks/index.js'
import type { SdkVersion } from '@reown/appkit-core'

export const mockOptions = {
  projectId: 'test-project-id',
  adapters: [{ chainNamespace: 'eip155' } as unknown as ChainAdapter],
  networks: [mainnet, solana],
  metadata: {
    name: 'Test App',
    description: 'Test App Description',
    url: 'https://test-app.com',
    icons: ['https://test-app.com/icon.png']
  },
  sdkVersion: `html-wagmi-5.1.6` as SdkVersion
} as unknown as AppKitOptions & {
  sdkVersion: SdkVersion
}
