import { createWeb3Modal } from '@web3modal/base/react'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { Web3ModalButtons } from '../../components/Web3ModalButtons'
import { mainnet, optimism, arbitrum, solana } from '../../utils/ChainsUtil'
import { MultiChainInfo } from '../../components/MultiChainInfo'

const modal = createWeb3Modal({
  adapters: [],
  chains: [mainnet, optimism, arbitrum, solana],
  projectId: ConstantsUtil.ProjectId,
  metadata: ConstantsUtil.Metadata
})

ThemeStore.setModal(modal)

export default function MultiChainWagmiAdapterOnly() {
  return (
    <>
      <Web3ModalButtons />
      <MultiChainInfo />
    </>
  )
}
