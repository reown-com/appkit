'use client'

import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { CloudAuthSIWX } from '@reown/appkit-siwx'
import { type AppKitNetwork, mainnet } from '@reown/appkit/networks'

import { AppKitButtons } from '@/src/components/AppKitButtons'
import { AppKitInfo } from '@/src/components/AppKitInfo'
import { CloudAuthTests } from '@/src/components/CloudAuthTests'
import { EthersTests } from '@/src/components/Ethers/EthersTests'
import { SolanaTests } from '@/src/components/Solana/SolanaTests'
import { AppKitProvider } from '@/src/context/AppKitContext'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'

const etherAdapter = new EthersAdapter()
const solanaAdapter = new SolanaAdapter()

const config = {
  adapters: [etherAdapter, solanaAdapter],
  networks: [...ConstantsUtil.EvmNetworks, ...ConstantsUtil.SolanaNetworks] as [
    AppKitNetwork,
    ...AppKitNetwork[]
  ],
  defaultNetwork: mainnet,
  features: {
    analytics: true
  },
  termsConditionsUrl: 'https://reown.com/terms-of-service',
  privacyPolicyUrl: 'https://reown.com/privacy-policy',
  siwx: new CloudAuthSIWX()
}

export default function SIWXCloudAuth() {
  return (
    <AppKitProvider config={config}>
      <AppKitButtons />
      <AppKitInfo />
      <CloudAuthTests />
      <EthersTests />
      <SolanaTests />
    </AppKitProvider>
  )
}
