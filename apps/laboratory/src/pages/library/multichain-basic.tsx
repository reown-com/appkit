import { createAppKit } from '@reown/appkit/react'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { AppKitButtons } from '../../components/AppKitButtons'
import { mainnet, optimism, arbitrum, solana } from '@reown/appkit/chains'
import { MultiChainInfo } from '../../components/MultiChainInfo'

const modal = createAppKit({
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
