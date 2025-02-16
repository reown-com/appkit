import UniversalProvider from '@walletconnect/universal-provider'

import { createAppKit } from '@reown/appkit'
import { mainnet, solana } from '@reown/appkit/networks'

export const projectId = import.meta.env.VITE_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694' // this is a public projectId only to use on localhost

let provider: InstanceType<typeof UniversalProvider> | undefined
let modal: ReturnType<typeof createAppKit> | undefined

export async function initializeProvider() {
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
