import { createAppKit } from '@web3modal/appkit/react'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { AppKitButtons } from '../../components/AppKitButtons'

const modal = createAppKit({
  projectId: ConstantsUtil.ProjectId,
  enableAnalytics: true,
  metadata: ConstantsUtil.Metadata,
  termsConditionsUrl: 'https://walletconnect.com/terms',
  privacyPolicyUrl: 'https://walletconnect.com/privacy',
  sdkType: 'w3m',
  sdkVersion: 'html-wagmi-1.0.0'
})

ThemeStore.setModal(modal)

export default function AppKitBasic() {
  return <AppKitButtons />
}
