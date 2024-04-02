import { createWeb3Modal, defaultSolanaConfig } from '@web3modal/solana/react'

import { ThemeStore } from '../../utils/StoreUtil'
import { solana, solanaDevnet, solanaLocalNet, solanaTestnet } from '../../utils/ChainsUtil'
import { Web3ModalButtons } from '../../components/Web3ModalButtons'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { SolanaTests } from '../../components/Solana/SolanaTests'

const chains = [solana, solanaTestnet, solanaDevnet, solanaLocalNet]

export const solanaConfig = defaultSolanaConfig({
  chains,
  projectId: ConstantsUtil.ProjectId,
  metadata: ConstantsUtil.Metadata
})

const modal = createWeb3Modal({
  solanaConfig,
  projectId: ConstantsUtil.ProjectId,
  metadata: ConstantsUtil.Metadata,
  chains,
  enableAnalytics: false,
  termsConditionsUrl: 'https://walletconnect.com/terms',
  privacyPolicyUrl: 'https://walletconnect.com/privacy'
})

ThemeStore.setModal(modal)

export default function Solana() {
  return (
    <>
      <Web3ModalButtons />
      <SolanaTests />
    </>
  )
}
