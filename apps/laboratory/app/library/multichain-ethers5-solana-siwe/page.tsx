'use client'

import { HuobiWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'

import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { type AppKitNetwork, mainnet } from '@reown/appkit/networks'
import { createAppKit } from '@reown/appkit/react'

import { AppKitButtons } from '@/src/components/AppKitButtons'
import { AppKitInfo } from '@/src/components/AppKitInfo'
import { EthersTests } from '@/src/components/Ethers/EthersTests'
import { SiweData } from '@/src/components/Siwe/SiweData'
import { SolanaTests } from '@/src/components/Solana/SolanaTests'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'
import { siweConfig } from '@/src/utils/SiweUtils'
import { ThemeStore } from '@/src/utils/StoreUtil'

const networks = [...ConstantsUtil.EvmNetworks, ...ConstantsUtil.SolanaNetworks] as [
  AppKitNetwork,
  ...AppKitNetwork[]
]

const etherAdapter = new EthersAdapter()

const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new HuobiWalletAdapter(), new SolflareWalletAdapter()]
})

const modal = createAppKit({
  adapters: [etherAdapter, solanaWeb3JsAdapter],
  projectId: ConstantsUtil.ProjectId,
  networks,
  defaultNetwork: mainnet,
  features: {
    analytics: true
  },
  termsConditionsUrl: 'https://reown.com/terms-of-service',
  privacyPolicyUrl: 'https://reown.com/privacy-policy',
  siweConfig
})

ThemeStore.setModal(modal)

export default function MultiChainEthers5Solana() {
  return (
    <>
      <AppKitButtons />
      <AppKitInfo />
      <SiweData />
      <EthersTests />
      <SolanaTests />
    </>
  )
}
