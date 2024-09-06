import type { AppKitOptions, ChainAdapter } from '@rerock/base'
import { solana } from '@rerock/base/chains'

export const mockOptions: AppKitOptions = {
  projectId: 'test-project-id',
  adapters: [{ chainNamespace: 'solana' } as unknown as ChainAdapter],
  caipNetworks: [solana],
  metadata: {
    name: 'Test App',
    description: 'Test App Description',
    url: 'https://test-app.com',
    icons: ['https://test-app.com/icon.png']
  }
} as unknown as AppKitOptions
