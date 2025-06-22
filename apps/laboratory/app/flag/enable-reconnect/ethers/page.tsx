'use client'

import { BitcoinAdapter } from '@reown/appkit-adapter-bitcoin'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { mainnet } from '@reown/appkit/networks'

import { AppKitButtons } from '@/src/components/AppKitButtons'
import { AppKitConnections } from '@/src/components/AppKitConnections'
import { AppKitInfo } from '@/src/components/AppKitInfo'
import { EthersTests } from '@/src/components/Ethers/EthersTests'
import { AppKitProvider } from '@/src/context/AppKitContext'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'

const ethersAdapter = new EthersAdapter()
const solanaAdapter = new SolanaAdapter()
const bitcoinAdapter = new BitcoinAdapter()

const config = {
  adapters: [ethersAdapter, solanaAdapter, bitcoinAdapter],
  networks: ConstantsUtil.AllNetworks,
  defaultNetwork: mainnet,
  projectId: ConstantsUtil.ProjectId,
  customWallets: ConstantsUtil.CustomWallets,
  enableReconnect: false
}

export default function Ethers() {
  return (
    <AppKitProvider config={config}>
      <AppKitButtons />
      <AppKitConnections namespace="eip155" title="EVM Connections" />
      <AppKitConnections namespace="solana" title="Solana Connections" />
      <AppKitConnections namespace="bip122" title="Bitcoin Connections" />
      <AppKitInfo />
      <EthersTests />
    </AppKitProvider>
  )
}
