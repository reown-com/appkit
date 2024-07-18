import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react'
import { ThemeStore } from '../../utils/StoreUtil'
import { EthersConstants } from '../../utils/EthersConstants'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { EthersTests } from '../../components/Ethers/EthersTests'
import { Web3ModalButtons } from '../../components/Web3ModalButtons'
import { siweConfig } from '../../utils/SiweUtils'
import { SiweData } from '../../components/Siwe/SiweData'
import { EthersModalInfo } from '../../components/Ethers/EthersModalInfo'

const modal = createWeb3Modal({
  ethersConfig: defaultConfig({
    metadata: ConstantsUtil.Metadata,
    defaultChainId: 1,
    rpcUrl: 'https://cloudflare-eth.com',
    auth: {
      socials: ['google', 'x', 'discord', 'apple', 'github']
    },
    coinbasePreference: 'smartWalletOnly'
  }),
  chains: EthersConstants.chains,
  projectId: ConstantsUtil.ProjectId,
  enableAnalytics: true,
  metadata: ConstantsUtil.Metadata,
  termsConditionsUrl: 'https://walletconnect.com/terms',
  privacyPolicyUrl: 'https://walletconnect.com/privacy',
  siweConfig,
  customWallets: ConstantsUtil.CustomWallets
})

ThemeStore.setModal(modal)

export default function Ethers() {
  return (
    <>
      <Web3ModalButtons />
      <EthersModalInfo />
      <SiweData />
      <EthersTests />
    </>
  )
}
