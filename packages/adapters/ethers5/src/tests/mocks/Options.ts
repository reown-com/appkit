import type { AppKitOptions, ChainAdapter } from '@rerock/appkit'
import { mainnet, solana } from '@rerock/appkit/chains'

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
