import { createWeb3Modal } from '@web3modal/base/react'
import { EVMEthersClient, defaultConfig } from '@web3modal/base/adapters/evm/ethers'
import { SolanaWeb3JsClient } from '@web3modal/base/adapters/solana/web3js'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { mainnet, solana, arbitrum, optimism } from '../../utils/NetworksUtil'
import { AppKitButtons } from '../../components/AppKitButtons'
import { HuobiWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { MultiChainTests } from '../../components/MultiChainTests'
import { MultiChainInfo } from '../../components/MultiChainInfo'

const etherAdapter = new EVMEthersClient({
  ethersConfig: defaultConfig({
    metadata: ConstantsUtil.Metadata,
    defaultChainId: 1,
    rpcUrl: 'https://cloudflare-eth.com',
    coinbasePreference: 'smartWalletOnly'
  })
})

const solanaWeb3JsAdapter = new SolanaWeb3JsClient({
  solanaConfig: {
    metadata: ConstantsUtil.Metadata
  },
  wallets: [new HuobiWalletAdapter(), new SolflareWalletAdapter()]
})

const modal = createWeb3Modal({
  adapters: [etherAdapter, solanaWeb3JsAdapter],
  projectId: ConstantsUtil.ProjectId,
  caipNetworks: [mainnet, arbitrum, optimism, solana],
  enableAnalytics: true,
  metadata: ConstantsUtil.Metadata,
  termsConditionsUrl: 'https://walletconnect.com/terms',
  privacyPolicyUrl: 'https://walletconnect.com/privacy'
})

ThemeStore.setModal(modal)

export default function MultiChainAllAdapters() {
  return (
    <>
      <AppKitButtons />
      <MultiChainInfo />
      <MultiChainTests />
    </>
  )
}
