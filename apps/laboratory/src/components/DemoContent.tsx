'use client'

import React from 'react'

import { AppKitButtonsMultiChain } from '@/src/components/AppKitButtonsMultiChain'
import { AppKitConnections } from '@/src/components/AppKitConnections'
import { AppKitInfo } from '@/src/components/AppKitInfo'
import { AppKitInfoMultiChain } from '@/src/components/AppKitInfoMultiChain'
import { AppKitWalletButtons } from '@/src/components/AppKitWalletButtons'
import { BitcoinTests } from '@/src/components/Bitcoin/BitcoinTests'
import { SolanaTests } from '@/src/components/Solana/SolanaTests'
import { WagmiTests } from '@/src/components/Wagmi/WagmiTests'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'

const embeddedWalletOptions = [...ConstantsUtil.Socials, ConstantsUtil.Email]

export default function DemoContent({ hasWagmiAdapter }: { hasWagmiAdapter?: boolean }) {
  return (
    <>
      <AppKitButtonsMultiChain />
      <AppKitInfoMultiChain />
      <AppKitConnections namespace="eip155" title="EVM Connections" />
      <AppKitConnections namespace="solana" title="Solana Connections" />
      <AppKitConnections namespace="bip122" title="Bitcoin Connections" />
      <AppKitInfo />
      {hasWagmiAdapter ? <WagmiTests /> : null}
      <SolanaTests />
      <BitcoinTests />
      <AppKitWalletButtons
        title="EVM Wallet Buttons"
        namespace="eip155"
        wallets={[...ConstantsUtil.EvmWalletButtons, ...embeddedWalletOptions]}
      />
      <AppKitWalletButtons
        title="Solana Wallet Buttons"
        namespace="solana"
        wallets={[...ConstantsUtil.SolanaWalletButtons, ...embeddedWalletOptions]}
      />
      <AppKitWalletButtons
        title="Bitcoin Wallet Buttons"
        namespace="bip122"
        wallets={ConstantsUtil.BitcoinWalletButtons}
        showActions={false}
      />
    </>
  )
}
