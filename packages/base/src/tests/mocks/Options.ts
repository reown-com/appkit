import type { ChainAdapter } from '@rerock/core'
import type { AppKitOptions } from '../../utils/index.js'
import { mainnet, solana } from '../../chains/index.js'

export const mockOptions: AppKitOptions = {
  projectId: 'test-project-id',
  adapters: [{ chainNamespace: 'eip155' } as unknown as ChainAdapter],
  caipNetworks: [mainnet, solana],
  metadata: {
    name: 'Test App',
    description: 'Test App Description',
    url: 'https://test-app.com',
    icons: ['https://test-app.com/icon.png']
  }
} as unknown as AppKitOptions
