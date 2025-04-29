'use client'

import { Ethers5Adapter } from '@reown/appkit-adapter-ethers5'
import { mainnet } from '@reown/appkit/networks'

import { AppKitButtons } from '@/src/components/AppKitButtons'
import { AppKitInfo } from '@/src/components/AppKitInfo'
import { AppKitWalletButtons } from '@/src/components/AppKitWalletButtons'
import { AppKitProvider } from '@/src/context/AppKitContext'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'

const networks = ConstantsUtil.EvmNetworks

const ethers5Adapter = new Ethers5Adapter()

const config = {
  adapters: [ethers5Adapter],
  networks,
  defaultNetwork: mainnet,
  projectId: ConstantsUtil.ProjectId
}

export default function Ethers() {
  return (
    <AppKitProvider config={config}>
      <AppKitButtons />
      <AppKitInfo />
      <AppKitWalletButtons
        wallets={[...ConstantsUtil.EvmWalletButtons, ...ConstantsUtil.Socials, ConstantsUtil.Email]}
      />
    </AppKitProvider>
  )
}
