import { SiweData } from '../../components/Siwe/SiweData'
import { Web3Tests } from '../../components/Web3/Web3Tests'
import { Web3ModalButtons } from '../../components/Web3ModalButtons'
import { createWeb3Modal, defaultConfig } from 'web3modal-web3js/react'
import { ThemeStore } from '../../utils/StoreUtil'
import { Web3Constants } from '../../utils/Web3Constants'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { siweConfig } from '../../utils/SiweUtils'

const modal = createWeb3Modal({
  web3Config: defaultConfig({
    metadata: ConstantsUtil.Metadata,
    defaultChainId: 1,
    rpcUrl: 'https://cloudflare-eth.com'
  }),
  chains: Web3Constants.chains,
  projectId: ConstantsUtil.ProjectId,
  enableAnalytics: true,
  metadata: ConstantsUtil.Metadata,
  siweConfig,
  enableOnramp: true,
  customWallets: ConstantsUtil.CustomWallets
})

ThemeStore.setModal(modal)

export default function Web3Siwe() {
  return (
    <>
      <Web3ModalButtons />
      <SiweData />
      <Web3Tests />
    </>
  )
}
