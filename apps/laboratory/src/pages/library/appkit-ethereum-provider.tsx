import { createAppKit } from '@web3modal/appkit/react'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { siweConfig } from '../../utils/SiweUtils'
import { EthereumAdapterClient } from '@web3modal/appkit/adapters/walletconnect/ethereum'

import { AppKitButtons } from '../../components/AppKitButtons'

const ethereumAdapter = new EthereumAdapterClient({
  chains: [
    {
      chainId: 1,
      chain: 'evm',
      name: 'Ethereum',
      currency: 'ETH',
      explorerUrl: 'https://etherscan.io',
      rpcUrl: 'https://cloudflare-eth.com'
    },
    {
      chainId: 42161,
      chain: 'evm',
      name: 'Arbitrum',
      currency: 'ETH',
      explorerUrl: 'https://arbiscan.io',
      rpcUrl: 'https://arb1.arbitrum.io/rpc'
    }
  ]
})

const modal = createAppKit({
  adapters: [ethereumAdapter],
  projectId: ConstantsUtil.ProjectId,
  enableAnalytics: true,
  metadata: ConstantsUtil.Metadata,
  termsConditionsUrl: 'https://walletconnect.com/terms',
  privacyPolicyUrl: 'https://walletconnect.com/privacy',
  enableOnramp: true,
  siweConfig,
  // customWallets: ConstantsUtil.CustomWallets,
  enableWalletFeatures: true
})

ThemeStore.setModal(modal)

export default function AppKit() {
  return (
    <>
      <AppKitButtons />
      {/* <AppKitInfo /> */}
    </>
  )
}
