'use client'

import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { type AppKitNetwork, mainnet } from '@reown/appkit/networks'

import { AppKitButtons } from '@/src/components/AppKitButtons'
import { AppKitConnections } from '@/src/components/AppKitConnections'
import { AppKitInfo } from '@/src/components/AppKitInfo'
import { Ethers5Tests } from '@/src/components/Ethers/Ethers5Tests'
import InitializeBoundary from '@/src/components/InitializeBoundary'
import { SolanaTests } from '@/src/components/Solana/SolanaTests'
import { AppKitProvider } from '@/src/context/AppKitContext'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'

const networks = [...ConstantsUtil.EvmNetworks, ...ConstantsUtil.SolanaNetworks] as [
  AppKitNetwork,
  ...AppKitNetwork[]
]

const etherAdapter = new EthersAdapter()

const solanaWeb3JsAdapter = new SolanaAdapter()

const config = {
  adapters: [etherAdapter, solanaWeb3JsAdapter],
  networks,
  defaultNetwork: mainnet,
  customWallets: ConstantsUtil.CustomWallets,
  termsConditionsUrl: 'https://reown.com/terms-of-service',
  privacyPolicyUrl: 'https://reown.com/privacy-policy'
}

export default function MultiChainEthers5Solana() {
  return (
    <AppKitProvider config={config}>
      <InitializeBoundary>
        <AppKitButtons />
        <AppKitConnections namespace="eip155" title="EVM Connections" />
        <AppKitConnections namespace="solana" title="Solana Connections" />
        <AppKitInfo />
        <Ethers5Tests />
        <SolanaTests />
      </InitializeBoundary>
    </AppKitProvider>
  )
}
