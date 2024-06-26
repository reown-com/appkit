import { createAppKit } from '@web3modal/appkit'
import { SolanaWeb3JsClient, defaultSolanaConfig } from '@web3modal/appkit/adapters/solana/web3js'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { AppKitButtons } from '../../components/AppKitButtons'
import { solana, solanaDevnet, solanaTestnet } from '../../utils/ChainsUtil'

const solanaConfig = defaultSolanaConfig({
  chains: [solana, solanaTestnet, solanaDevnet],
  projectId: ConstantsUtil.ProjectId,
  metadata: ConstantsUtil.Metadata
})

const solanaWeb3JsAdapter = new SolanaWeb3JsClient({
  solanaConfig,
  chains: [solana, solanaTestnet, solanaDevnet]
})

const modal = createAppKit({
  adapters: [solanaWeb3JsAdapter],
  projectId: ConstantsUtil.ProjectId,
  enableAnalytics: true,
  metadata: ConstantsUtil.Metadata,
  termsConditionsUrl: 'https://walletconnect.com/terms',
  privacyPolicyUrl: 'https://walletconnect.com/privacy',
  sdkType: 'w3m',
  sdkVersion: 'html-wagmi-1.0.0'
})

ThemeStore.setModal(modal)

export default function AppKitSolana() {
  return <AppKitButtons />
}
