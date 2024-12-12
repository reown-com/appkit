import { createAppKit, useAppKitNetwork } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { ThemeStore } from '../../utils/StoreUtil'
import { ConstantsUtil } from '../../utils/ConstantsUtil'

import { AppKitButtons } from '../../components/AppKitButtons'
import { HuobiWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { mainnet } from '@reown/appkit/networks'
import { DefaultSIWX } from '@reown/appkit-siwx'
import { BitcoinAdapter } from '@reown/appkit-adapter-bitcoin'
import { DefaultSIWXStatus } from '../../components/DefaultSIWXStatus'
import { EthersTests } from '../../components/Ethers/EthersTests'
import { SolanaTests } from '../../components/Solana/SolanaTests'
import { BitcoinTests } from '../../components/Bitcoin/BitcoinTests'

const networks = ConstantsUtil.AllNetworks
networks.push(...ConstantsUtil.BitcoinNetworks)

const etherAdapter = new EthersAdapter()

const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new HuobiWalletAdapter(), new SolflareWalletAdapter()]
})

const bitcoinAdapter = new BitcoinAdapter({})

const modal = createAppKit({
  adapters: [etherAdapter, solanaWeb3JsAdapter, bitcoinAdapter],
  projectId: ConstantsUtil.ProjectId,
  networks,
  defaultNetwork: mainnet,
  features: {
    analytics: true
  },
  termsConditionsUrl: 'https://reown.com/terms-of-service',
  privacyPolicyUrl: 'https://reown.com/privacy-policy',
  siwx: new DefaultSIWX()
})

ThemeStore.setModal(modal)

export default function SIWXDefault() {
  const { caipNetwork } = useAppKitNetwork()

  return (
    <>
      <AppKitButtons />
      <DefaultSIWXStatus />

      {caipNetwork?.chainNamespace === 'eip155' && <EthersTests />}
      {caipNetwork?.chainNamespace === 'solana' && <SolanaTests />}
      {caipNetwork?.chainNamespace === 'bip122' && <BitcoinTests />}
    </>
  )
}
