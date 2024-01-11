import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiConfig } from 'wagmi'
import { Web3ModalButtons } from '../../components/Web3ModalButtons'
import { WagmiTests } from '../../components/Wagmi/WagmiTests'
import { ThemeStore } from '../../utils/StoreUtil'
import { WagmiConstantsUtil } from '../../utils/WagmiConstants'
import { SiweData } from '../../components/Siwe/SiweData'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { siweConfig } from '../../utils/SiweUtils'

const queryClient = new QueryClient()

export const wagmiConfig = defaultWagmiConfig({
  chains: WagmiConstantsUtil.chains,
  projectId: ConstantsUtil.ProjectId,
  metadata: ConstantsUtil.Metadata
})

const modal = createWeb3Modal({
  wagmiConfig,
  projectId: ConstantsUtil.ProjectId,
  chains: WagmiConstantsUtil.chains,
  enableAnalytics: true,
  metadata: ConstantsUtil.Metadata,
  siweConfig
})

ThemeStore.setModal(modal)

export default function Wagmi() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <Web3ModalButtons />
        <SiweData />
        <WagmiTests />
      </QueryClientProvider>
    </WagmiConfig>
  )
}
