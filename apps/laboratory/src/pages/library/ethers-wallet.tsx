import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react'
import { ThemeStore } from '../../utils/StoreUtil'
import { EthersConstants } from '../../utils/EthersConstants'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { EthersTests } from '../../components/Ethers/EthersTests'
import { Web3ModalButtons } from '../../components/Web3ModalButtons'

const modal = createWeb3Modal({
  ethersConfig: defaultConfig({
    metadata: ConstantsUtil.Metadata,
    defaultChainId: 1,
    rpcUrl: 'https://cloudflare-eth.com',
    enableEmail: true
  }),
  chains: EthersConstants.chains,
  projectId: ConstantsUtil.ProjectId,
  enableAnalytics: true,
  metadata: ConstantsUtil.Metadata,
  termsConditionsUrl: 'https://walletconnect.com/terms',
  privacyPolicyUrl: 'https://walletconnect.com/privacy',
  enableOnramp: true,
  customWallets: ConstantsUtil.CustomWallets,
  enableWalletFeatures: true
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
