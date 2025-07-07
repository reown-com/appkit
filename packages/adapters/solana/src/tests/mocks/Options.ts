import type { AppKitOptions, ChainAdapter } from '@reown/appkit'
import { ConstantsUtil } from '@reown/appkit-common'
import { solana } from '@reown/appkit/networks'

export const mockSolanaChainImage =
  'https://assets.coingecko.com/coins/images/4128/large/solana.png'

export const mockOptions: AppKitOptions = {
  projectId: 'test-project-id',
  adapters: [{ chainNamespace: ConstantsUtil.CHAIN.SOLANA } as unknown as ChainAdapter],
  networks: [solana],
  chainImages: {
    [solana.id]: mockSolanaChainImage
  },
  metadata: {
    name: 'Test App',
    description: 'Test App Description',
    url: 'https://test-app.com',
    icons: ['https://test-app.com/icon.png']
  }
} as unknown as AppKitOptions
