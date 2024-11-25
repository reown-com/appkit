import { createAppKit } from '@reown/appkit-new/react'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { AppKitButtons } from '../../components/AppKitButtons'
import { mainnet } from '@reown/appkit-new/networks'
import { MultiChainInfo } from '../../components/MultiChainInfo'
import { UpaTests } from '../../components/UPA/UpaTests'

const networks = ConstantsUtil.AllNetworks

const modal = createAppKit({
  networks,
  defaultNetwork: mainnet,
  projectId: ConstantsUtil.ProjectId,
  metadata: ConstantsUtil.Metadata
})

ThemeStore.setModal(modal)

export default function MultiChainWagmiAdapterOnly() {
  return (
    <>
      <AppKitButtons />
      <MultiChainInfo />
      <UpaTests />
    </>
  )
}
