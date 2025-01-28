import UniversalProvider from '@walletconnect/universal-provider'

import { createAppKit } from '@reown/appkit'
import { mainnet, solana } from '@reown/appkit/networks'

export const projectId = import.meta.env.VITE_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694' // this is a public projectId only to use on localhost

const provider = await UniversalProvider.init({
  projectId
})

const modal = createAppKit({
  projectId,
  networks: [mainnet, solana],
  universalProvider: provider
})

export { provider, modal }
