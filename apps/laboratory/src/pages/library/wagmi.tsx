import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { AppKitButtons } from '../../components/AppKitButtons'
import { WagmiTests } from '../../components/Wagmi/WagmiTests'
import { WagmiModalInfo } from '../../components/Wagmi/WagmiModalInfo'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { createAppKit } from '@reown/appkit/react'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { ThemeStore } from '../../utils/StoreUtil'
import { acala, beam } from 'viem/chains'

const queryClient = new QueryClient()

const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  networks: [...ConstantsUtil.EvmNetworks, acala, beam],
  projectId: ConstantsUtil.ProjectId
})

const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: wagmiAdapter.caipNetworks,
  projectId: ConstantsUtil.ProjectId,
  chainImages: {
    787: 'https://imagedelivery.net/_aTEfDRm7z3tKgu9JhfeKA/59c89b74-8c5a-49e8-467b-607a2c0ac900/md',
    4337: 'https://imagedelivery.net/_aTEfDRm7z3tKgu9JhfeKA/e8537239-736f-4db2-f941-07ff4eb7de00/md'
  },
  features: {
    analytics: true,
    email: true,
    socials: ['google', 'github', 'apple', 'discord']
  }
})

ThemeStore.setModal(modal)

export default function Wagmi() {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppKitButtons />
        <WagmiModalInfo />
        <WagmiTests />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
