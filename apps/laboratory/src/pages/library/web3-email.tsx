import { createWeb3Modal, defaultConfig } from 'web3modal-web3js/react'
import { ThemeStore } from '../../utils/StoreUtil'
import { Web3Constants } from '../../utils/Web3Constants'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { Web3Tests } from '../../components/Web3/Web3Tests'
import { Web3ModalButtons } from '../../components/Web3ModalButtons'

const modal = createWeb3Modal({
  web3Config: defaultConfig({
    metadata: ConstantsUtil.Metadata,
    defaultChainId: 1,
    rpcUrl: 'https://cloudflare-eth.com',
    enableEmail: true
  }),
  chains: Web3Constants.chains,
  projectId: ConstantsUtil.ProjectId,
  enableAnalytics: true,
  metadata: ConstantsUtil.Metadata,
  termsConditionsUrl: 'https://walletconnect.com/terms',
  privacyPolicyUrl: 'https://walletconnect.com/privacy',
  enableOnramp: true,
  customWallets: ConstantsUtil.CustomWallets
})

ThemeStore.setModal(modal)

export default function Web3() {
  return (
    <>
      <Web3ModalButtons />
      <Web3Tests />
    </>
  )
}
