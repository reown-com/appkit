'use client'

import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { CloudAuthSIWX } from '@reown/appkit-siwx'
import { mainnet } from '@reown/appkit/networks'
import { createAppKit } from '@reown/appkit/react'

import { AppKitButtons } from '@/src/components/AppKitButtons'
import { AppKitInfo } from '@/src/components/AppKitInfo'
import { EthersTests } from '@/src/components/Ethers/EthersTests'
import InitializeBoundary from '@/src/components/InitializeBoundary'
import { SolanaTests } from '@/src/components/Solana/SolanaTests'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'
import { ThemeStore } from '@/src/utils/StoreUtil'

const etherAdapter = new EthersAdapter()
const solanaAdapter = new SolanaAdapter()

const modal = createAppKit({
  adapters: [etherAdapter, solanaAdapter],
  projectId: ConstantsUtil.ProjectId,
  networks: [...ConstantsUtil.EvmNetworks, ...ConstantsUtil.SolanaNetworks],
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
    <InitializeBoundary>
      <AppKitButtons />
      <AppKitInfo />
      <EthersTests />
      <SolanaTests />
    </InitializeBoundary>
  )
}
