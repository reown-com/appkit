import { EthersTests } from '../../components/Ethers/EthersTests'
import { Web3ModalButtons } from '../../components/Web3ModalButtons'
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react'
import { ThemeStore } from '../../utils/StoreUtil'
import { EthersConstants } from '../../utils/EthersConstants'
import { ConstantsUtil } from '../../utils/ConstantsUtil'

const modal = createWeb3Modal({
  ethersConfig: defaultConfig({
    metadata: ConstantsUtil.Metadata,
    defaultChainId: 1,
    rpcUrl: 'https://cloudflare-eth.com'
  }),
  chains: EthersConstants.chains,
  projectId: ConstantsUtil.ProjectId,
  enableAnalytics: true,
  metadata: ConstantsUtil.Metadata,
  termsConditionsUrl: 'https://walletconnect.com/terms',
  privacyPolicyUrl: 'https://walletconnect.com/privacy',
  customWallets: [
    {
      id: 'react-wallet-v2',
      name: 'react-wallet-v2',
      homepage: 'https://react-wallet-v2-git-chore-2111-walletconnect1.vercel.app',
      webapp_link: 'https://react-wallet.walletconnect.com',
      desktop_link: 'https://react-wallet.walletconnect.com'
    },
    {
      id: 'kotlin-web3wallet',
      name: 'kotlin-web3wallet',
      homepage: 'https://walletconnect.com',
      mobile_link: 'kotlin-web3wallet'
    },
    {
      id: 'swift-web3wallet',
      name: 'swift-web3wallet',
      homepage: 'https://walletconnect.com',
      mobile_link: 'walletapp'
    },
    {
      id: 'flutter-web3wallet',
      name: 'flutter-web3wallet',
      homepage: 'https://walletconnect.com',
      mobile_link: 'wcflutterwallet'
    }
  ]
})

ThemeStore.setModal(modal)

export default function Ethers() {
  return (
    <>
      <Web3ModalButtons />
      <EthersTests />
    </>
  )
}
