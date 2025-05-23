'use client'

import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { mainnet } from '@reown/appkit/networks'

import { AppKitButtons } from '@/src/components/AppKitButtons'
import { AppKitInfo } from '@/src/components/AppKitInfo'
import { EthersTests } from '@/src/components/Ethers/EthersTests'
import { SiweData } from '@/src/components/Siwe/SiweData'
import { AppKitProvider } from '@/src/context/AppKitContext'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'
import { siweConfig } from '@/src/utils/SiweUtils'

const networks = ConstantsUtil.EvmNetworks

const ethersAdapter = new EthersAdapter()

const config = {
  adapters: [ethersAdapter],
  networks,
  defaultNetwork: mainnet,
  projectId: ConstantsUtil.ProjectId,
  termsConditionsUrl: 'https://reown.com/terms-of-service',
  privacyPolicyUrl: 'https://reown.com/privacy-policy',
  siweConfig,
  customWallets: ConstantsUtil.CustomWallets
}

export default function Ethers() {
  return (
    <AppKitProvider config={config}>
      <AppKitButtons />
      <AppKitInfo />
      <SiweData />
      <EthersTests />
    </AppKitProvider>
  )
}
