import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  cookieStorage,
  cookieToInitialState,
  createStorage,
  WagmiProvider,
  type Config
} from 'wagmi'
import { AppKitButtons } from '../../components/AppKitButtons'
import { WagmiTests } from '../../components/Wagmi/WagmiTests'
import { WagmiModalInfo } from '../../components/Wagmi/WagmiModalInfo'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { createAppKit } from '@reown/appkit/react'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { ThemeStore } from '../../utils/StoreUtil'
import { CookiesStorage } from '../../utils/CookiesStorage'
import type { GetServerSideProps } from 'next'

const queryClient = new QueryClient()

const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  networks: ConstantsUtil.EvmNetworks,
  projectId: ConstantsUtil.ProjectId
})

const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: ConstantsUtil.EvmNetworks,
  projectId: ConstantsUtil.ProjectId,
  features: {
    analytics: true
  },
  customWallets: ConstantsUtil.CustomWallets,
  storage: CookiesStorage
})

const config = wagmiAdapter.wagmiConfig
ThemeStore.setModal(modal)

interface WagmiProps {
  cookies: string
}

export const getServerSideProps: GetServerSideProps<WagmiProps> = async ({ req }) => {
  const cookies = Object.entries(req.cookies)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ')

  return {
    props: {
      cookies
    }
  }
}

export default function Wagmi({ cookies }: WagmiProps) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)
  modal.setInitialState(cookies)

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <AppKitButtons />
        <WagmiModalInfo />
        <WagmiTests config={config} />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
