import { createWeb3Modal } from '@web3modal/base/react'
import { EVMEthersClient, defaultConfig } from '@web3modal/base/adapters/evm/ethers'
import { SolanaWeb3JsClient, defaultSolanaConfig } from '@web3modal/base/adapters/solana/web3js'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { mainnet, solana, arbitrum, optimism } from '../../utils/NetworksUtil'
import { Web3ModalButtons } from '../../components/Web3ModalButtons'
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack'
import { HuobiWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { EthersConstants } from '../../utils/EthersConstants'
import { EthersModalInfo } from '../../components/Ethers/EthersModalInfo'
import { EthersTests } from '../../components/Ethers/EthersTests'
import { MultiChainTests } from '../../components/MultiChainTests'
import { MultiChainInfo } from '../../components/MultiChainInfo'

const etherAdapter = new EVMEthersClient({
  ethersConfig: defaultConfig({
    metadata: ConstantsUtil.Metadata,
    defaultChainId: 1,
    rpcUrl: 'https://cloudflare-eth.com',
    chains: EthersConstants.chains,
    coinbasePreference: 'smartWalletOnly'
  }),
  chains: [mainnet, arbitrum, optimism]
})

const solanaConfig = defaultSolanaConfig({
  chains: [solana],
  projectId: ConstantsUtil.ProjectId,
  metadata: ConstantsUtil.Metadata
})

const solanaWeb3JsAdapter = new SolanaWeb3JsClient({
  solanaConfig,
  chains: [solana],
  projectId: ConstantsUtil.ProjectId,
  wallets: [new BackpackWalletAdapter(), new HuobiWalletAdapter(), new SolflareWalletAdapter()]
})

const modal = createWeb3Modal({
  adapters: [etherAdapter, solanaWeb3JsAdapter],
  projectId: ConstantsUtil.ProjectId,
  chains: [mainnet, arbitrum, optimism, solana],
  enableAnalytics: true,
  metadata: ConstantsUtil.Metadata,
  termsConditionsUrl: 'https://walletconnect.com/terms',
  privacyPolicyUrl: 'https://walletconnect.com/privacy'
})

ThemeStore.setModal(modal)

export default function MultiChainAllAdapters() {
  return (
    <>
      <Web3ModalButtons />
      <MultiChainInfo />
      <MultiChainTests />
    </>
  )
}
