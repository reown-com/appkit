import UniversalProvider from '@walletconnect/universal-provider'

import { createAppKit } from '@reown/appkit'
import { mainnet, solana } from '@reown/appkit/networks'

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694' // this is a public projectId only to use on localhost

let provider: InstanceType<typeof UniversalProvider> | undefined
let modal: ReturnType<typeof createAppKit> | undefined

export async function initializeProvider() {
  // In Next.js, we want to avoid re-initializing on the server side
  if (typeof window === 'undefined') return undefined

  if (!provider) {
    provider = await UniversalProvider.init({
      projectId
    })
  }
  return provider
}

export function initializeModal(universalProvider?: InstanceType<typeof UniversalProvider>) {
  if (!modal && universalProvider) {
    modal = createAppKit({
      projectId,
      networks: [mainnet, solana]
    })
  }
  return modal
}

export { provider, modal }
