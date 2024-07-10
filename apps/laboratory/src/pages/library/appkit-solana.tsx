import { createWeb3Modal } from '@web3modal/base'
import { SolanaWeb3JsClient, defaultSolanaConfig } from '@web3modal/base/adapters/solana/web3js'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { solana, solanaDevnet, solanaTestnet } from '../../utils/ChainsUtil'
import { Web3ModalButtons } from '../../components/Web3ModalButtons'
import { SolanaTests } from '../../components/Solana/SolanaTests'

const solanaConfig = defaultSolanaConfig({
  chains: [solana, solanaTestnet, solanaDevnet],
  projectId: ConstantsUtil.ProjectId,
  metadata: ConstantsUtil.Metadata
})

const solanaWeb3JsAdapter = new SolanaWeb3JsClient({
  solanaConfig,
  chains: [solana, solanaTestnet, solanaDevnet]
})

const modal = createWeb3Modal({
  adapters: [solanaWeb3JsAdapter],
  projectId: ConstantsUtil.ProjectId,
  enableAnalytics: true,
  metadata: ConstantsUtil.Metadata,
  termsConditionsUrl: 'https://walletconnect.com/terms',
  privacyPolicyUrl: 'https://walletconnect.com/privacy',
  customWallets: ConstantsUtil.CustomWallets,
  sdkType: 'w3m',
  sdkVersion: 'html-wagmi-1.0.0'
})

ThemeStore.setModal(modal)

export default function AppKitSolana() {
  return (
    <>
      <Web3ModalButtons />
      <SolanaTests />
    </>
  )
}
