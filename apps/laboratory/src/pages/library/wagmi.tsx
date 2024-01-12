import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import { useEffect, useState } from 'react'
import { WagmiConfig } from 'wagmi'
import { Web3ModalButtons } from '../../components/Web3ModalButtons'
import { WagmiTests } from '../../components/Wagmi/WagmiTests'
import { ThemeStore } from '../../utils/StoreUtil'
import { WagmiConstantsUtil } from '../../utils/WagmiConstants'
import { ConstantsUtil } from '../../utils/ConstantsUtil'

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
  termsConditionsUrl: 'https://walletconnect.com/terms',
  privacyPolicyUrl: 'https://walletconnect.com/privacy',
  customWallets: [
    {
      id: 'react-wallet-v2',
      name: 'react-wallet-v2',
      homepage: 'https://react-wallet-v2-git-chore-2111-walletconnect1.vercel.app',
      mobile_link: 'https://react-wallet.walletconnect.com',
      desktop_link: 'https://react-wallet.walletconnect.com',
      webapp_link: 'https://react-wallet.walletconnect.com'
    }
  ]
})

ThemeStore.setModal(modal)

export default function Wagmi() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  return ready ? (
    <WagmiConfig config={wagmiConfig}>
      <Web3ModalButtons />
      <WagmiTests />
    </WagmiConfig>
  ) : null
}
