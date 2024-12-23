import { createAppKit } from '@reown/appkit/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { AppKitButtons } from '../../components/AppKitButtons'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { WagmiModalInfo } from '../../components/Wagmi/WagmiModalInfo'
import { AppKitWalletButtons } from '../../components/AppKitWalletButtons'

const queryClient = new QueryClient()

const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  networks: ConstantsUtil.EvmNetworks,
  projectId: ConstantsUtil.ProjectId
})

const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: ConstantsUtil.EvmNetworks,
  projectId: ConstantsUtil.ProjectId
})

ThemeStore.setModal(modal)

export default function Wagmi() {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppKitButtons />
        <AppKitWalletButtons
          wallets={[...ConstantsUtil.EvmWalletButtons, ...ConstantsUtil.Socials]}
        />
        <WagmiModalInfo />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
