import { createWeb3Modal } from '@rerock/base/react'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { AppKitButtons } from '../../components/AppKitButtons'
import { mainnet, optimism, arbitrum, solana } from '@rerock/base/chains'
import { MultiChainInfo } from '../../components/MultiChainInfo'

const modal = createWeb3Modal({
  caipNetworks: [mainnet, optimism, arbitrum, solana],
  projectId: ConstantsUtil.ProjectId,
  metadata: ConstantsUtil.Metadata
})

ThemeStore.setModal(modal)

export default function MultiChainWagmiAdapterOnly() {
  return (
    <>
      <AppKitButtons />
      <MultiChainInfo />
    </>
  )
}
