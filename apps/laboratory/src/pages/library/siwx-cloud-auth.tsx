import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { CloudAuthSIWX } from '@reown/appkit-siwx'
import { mainnet } from '@reown/appkit/networks'
import { createAppKit } from '@reown/appkit/react'

import { AppKitButtons } from '../../components/AppKitButtons'
import { MultiChainTestsEthersSolana } from '../../components/MultiChainTestsEthersSolana'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { ThemeStore } from '../../utils/StoreUtil'

const networks = ConstantsUtil.EvmNetworks

const etherAdapter = new EthersAdapter()

const modal = createAppKit({
  adapters: [etherAdapter],
  projectId: ConstantsUtil.ProjectId,
  networks,
  defaultNetwork: mainnet,
  features: {
    analytics: true
  },
  termsConditionsUrl: 'https://reown.com/terms-of-service',
  privacyPolicyUrl: 'https://reown.com/privacy-policy',
  siwx: new CloudAuthSIWX()
})

ThemeStore.setModal(modal)

export default function SIWXCloudAuth() {
  return (
    <>
      <AppKitButtons />
      <MultiChainTestsEthersSolana />
    </>
  )
}
