import { createAppKit } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'

import { AppKitButtons } from '../../components/AppKitButtons'
import { MultiChainTestsEthersSolana } from '../../components/MultiChainTestsEthersSolana'
import { mainnet } from '@reown/appkit/networks'
import { CloudAuthSIWX } from '@reown/appkit-siwx'

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
