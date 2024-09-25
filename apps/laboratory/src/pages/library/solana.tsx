import { createAppKit, type CaipNetwork } from '@reown/appkit/react'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { solana, solanaDevnet, solanaTestnet } from '@reown/appkit/networks'

import { HuobiWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { AppKitButtons } from '../../components/AppKitButtons'
import { SolanaModalInfo } from '../../components/Solana/SolanaModalInfo'
import { SolanaTests } from '../../components/Solana/SolanaTests'

const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new HuobiWalletAdapter(), new SolflareWalletAdapter()]
})

export const solanaNotExist = {
  id: 'solana:chaindoesntexist',
  chainId: 'chaindoesntexist',
  name: 'Solana Unsupported',
  currency: 'SOL',
  explorerUrl: 'https://explorer.solana.com/?cluster=devnet',
  rpcUrl: '',
  chainNamespace: 'solana'
} as CaipNetwork

const modal = createAppKit({
  adapters: [solanaWeb3JsAdapter],
  networks: [solana, solanaTestnet, solanaDevnet, solanaNotExist],
  projectId: ConstantsUtil.ProjectId,
  features: {
    analytics: true,
    email: true,
    socials: ['google', 'github', 'apple', 'discord']
  },
  metadata: ConstantsUtil.Metadata
})

ThemeStore.setModal(modal)

export default function MultiChainSolanaAdapterOnly() {
  return (
    <>
      <AppKitButtons />
      <SolanaModalInfo />
      <SolanaTests />
    </>
  )
}
