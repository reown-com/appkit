'use client'

import { Ethers5Adapter } from '@reown/appkit-adapter-ethers5'
import { mainnet } from '@reown/appkit/networks'

import { AppKitButtons } from '@/src/components/AppKitButtons'
import { AppKitInfo } from '@/src/components/AppKitInfo'
import { Ethers5Tests } from '@/src/components/Ethers/Ethers5Tests'
import InitializeBoundary from '@/src/components/InitializeBoundary'
import { SiweData } from '@/src/components/Siwe/SiweData'
import { AppKitProvider } from '@/src/context/AppKitContext'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'
import { siweConfig } from '@/src/utils/SiweUtils'

const networks = ConstantsUtil.EvmNetworks
const ethers5Adapter = new Ethers5Adapter()

const config = {
  adapters: [ethers5Adapter],
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
      <InitializeBoundary>
        <AppKitButtons />
        <AppKitInfo />
        <SiweData />
        <Ethers5Tests />
      </InitializeBoundary>
    </AppKitProvider>
  )
}
