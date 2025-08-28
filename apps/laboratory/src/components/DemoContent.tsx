'use client'

import React from 'react'

import { AppKitButtonsMultiChain } from '@/src/components/AppKitButtonsMultiChain'
import { AppKitConnections } from '@/src/components/AppKitConnections'
import { AppKitInfoMultiChain } from '@/src/components/AppKitInfoMultiChain'
import { AppKitWalletButtons } from '@/src/components/AppKitWalletButtons'
import { BitcoinTests } from '@/src/components/Bitcoin/BitcoinTests'
import { SolanaTests } from '@/src/components/Solana/SolanaTests'
import { WagmiTests } from '@/src/components/Wagmi/WagmiTests'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'

import type { Adapter, AppKitConfigObject } from '../constants/appkit-configs'
import { EmbeddedWalletInfo } from './EmbeddedWalletInfo'
import { Ethers5Tests } from './Ethers/Ethers5Tests'
import { EthersTests } from './Ethers/EthersTests'
import { ReownAuthenticationTests } from './ReownAuthentication'
import { SiweData } from './Siwe/SiweData'
import { UpaTests } from './UPA/UpaTests'

const embeddedWalletOptions = [...ConstantsUtil.Socials, ConstantsUtil.Email]

export default function DemoContent({
  config
}: {
  config: AppKitConfigObject[string] | undefined
}) {
  const hasNoAdapters = config?.adapters?.length === 0
  const solanaAdapter = config?.adapters?.find(adapter => adapter === 'solana')
  const bitcoinAdapter = config?.adapters?.find(adapter => adapter === 'bitcoin')
  const evmAdapter = config?.adapters?.find(
    adapter => adapter === 'wagmi' || adapter === 'ethers' || adapter === 'ethers5'
  )
  const siwxEnabled = Boolean(config?.siwx)
  const siweEnabled = Boolean(config?.siweConfig)

  return (
    <>
      <AppKitButtonsMultiChain adapters={config?.adapters} />
      <AppKitInfoMultiChain />
      <EmbeddedWalletInfo />
      {siweEnabled ? <SiweData /> : null}
      {siwxEnabled ? <ReownAuthenticationTests /> : null}

      <AppKitConnections namespace="eip155" title="EVM Connections" />
      <AppKitConnections namespace="solana" title="Solana Connections" />
      <AppKitConnections namespace="bip122" title="Bitcoin Connections" />

      {evmAdapter === 'wagmi' && <WagmiTests />}
      {evmAdapter === 'ethers5' && <Ethers5Tests />}
      {evmAdapter === 'ethers' && <EthersTests />}
      {solanaAdapter ? <SolanaTests /> : null}
      {bitcoinAdapter ? <BitcoinTests /> : null}
      {hasNoAdapters ? <UpaTests /> : null}

      {evmAdapter ? (
        <AppKitWalletButtons
          title="EVM Wallet Buttons"
          namespace="eip155"
          wallets={[...ConstantsUtil.EvmWalletButtons, ...embeddedWalletOptions]}
        />
      ) : null}
      {solanaAdapter ? (
        <AppKitWalletButtons
          title="Solana Wallet Buttons"
          namespace="solana"
          wallets={[...ConstantsUtil.SolanaWalletButtons, ...embeddedWalletOptions]}
        />
      ) : null}
      {bitcoinAdapter ? (
        <AppKitWalletButtons
          title="Bitcoin Wallet Buttons"
          namespace="bip122"
          wallets={ConstantsUtil.BitcoinWalletButtons}
          showActions={false}
        />
      ) : null}
    </>
  )
}
