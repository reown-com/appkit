'use client'

import { HuobiWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'

import { BitcoinAdapter } from '@reown/appkit-adapter-bitcoin'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { DefaultSIWX } from '@reown/appkit-siwx'
import { mainnet } from '@reown/appkit/networks'
import { useAppKitNetwork } from '@reown/appkit/react'

import { AppKitButtons } from '@/src/components/AppKitButtons'
import { AppKitInfo } from '@/src/components/AppKitInfo'
import { BitcoinTests } from '@/src/components/Bitcoin/BitcoinTests'
import { DefaultSIWXStatus } from '@/src/components/DefaultSIWXStatus'
import { EthersTests } from '@/src/components/Ethers/EthersTests'
import { SolanaTests } from '@/src/components/Solana/SolanaTests'
import { AppKitProvider } from '@/src/context/AppKitContext'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'

const networks = ConstantsUtil.AllNetworks
networks.push(...ConstantsUtil.BitcoinNetworks)

const etherAdapter = new EthersAdapter()

const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new HuobiWalletAdapter(), new SolflareWalletAdapter()]
})

const bitcoinAdapter = new BitcoinAdapter({})

const config = {
  adapters: [solanaWeb3JsAdapter, bitcoinAdapter, etherAdapter],
  networks,
  defaultNetwork: mainnet,

  termsConditionsUrl: 'https://reown.com/terms-of-service',
  privacyPolicyUrl: 'https://reown.com/privacy-policy',
  siwx: new DefaultSIWX()
}

export default function SIWXDefault() {
  const { caipNetwork } = useAppKitNetwork()

  return (
    <AppKitProvider config={config}>
      <AppKitButtons />
      <AppKitInfo />
      <DefaultSIWXStatus />

      {caipNetwork?.chainNamespace === 'eip155' && <EthersTests />}
      {caipNetwork?.chainNamespace === 'solana' && <SolanaTests />}
      {caipNetwork?.chainNamespace === 'bip122' && <BitcoinTests />}
    </AppKitProvider>
  )
}
