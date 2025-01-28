import { useEffect } from 'react'

import { EthereumProvider } from '@walletconnect/ethereum-provider'

export const projectId = import.meta.env.VITE_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694' // this is a public projectId only to use on localhost

export let provider: InstanceType<typeof EthereumProvider> | undefined

export async function initializeProvider() {
  if (!provider) {
    provider = await EthereumProvider.init({
      projectId,
      metadata: {
        name: 'AppKit React Ethereum Provider Example',
        description: 'AppKit React Ethereum Provider Example',
        url: 'https://reown.com/appkit',
        icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4']
      },
      showQrModal: true,
      qrModalOptions: {
        themeMode: 'light'
      },
      chains: [1, 137],
      optionalChains: [1, 137]
    })
  }
  return provider
}
