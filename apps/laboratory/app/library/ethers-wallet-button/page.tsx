'use client'

import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { mainnet } from '@reown/appkit/networks'
import { createAppKit } from '@reown/appkit/react'

import { AppKitButtons } from '@/src/components/AppKitButtons'
import { AppKitInfo } from '@/src/components/AppKitInfo'
import { AppKitWalletButtons } from '@/src/components/AppKitWalletButtons'
import InitializeBoundary from '@/src/components/InitializeBoundary'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'
import { ThemeStore } from '@/src/utils/StoreUtil'

const networks = ConstantsUtil.EvmNetworks

const ethersAdapter = new EthersAdapter()

const modal = createAppKit({
  adapters: [ethersAdapter],
  networks,
  defaultNetwork: mainnet,
  projectId: ConstantsUtil.ProjectId
})

ThemeStore.setModal(modal)

export default function Ethers() {
  return (
    <InitializeBoundary>
      <AppKitButtons />
      <AppKitInfo />
      <AppKitWalletButtons
        wallets={[...ConstantsUtil.EvmWalletButtons, ...ConstantsUtil.Socials, ConstantsUtil.Email]}
      />
    </InitializeBoundary>
  )
}
