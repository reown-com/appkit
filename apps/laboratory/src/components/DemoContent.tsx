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

import type { AppKitConfigObject } from '../constants/appKitConfigs'
import { AppKitPay } from './AppKitPay'
import { Ethers5Tests } from './Ethers/Ethers5Tests'
import { EthersTests } from './Ethers/EthersTests'
import { ReownAuthenticationTests } from './ReownAuthentication'
import { SiweData } from './Siwe/SiweData'
import { TonTests } from './Ton/TonTests'
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
  const tonAdapter = config?.adapters?.find(adapter => adapter === 'ton')
  const evmAdapter = config?.adapters?.find(
    adapter => adapter === 'wagmi' || adapter === 'ethers' || adapter === 'ethers5'
  )
  const isSiwxReown = Boolean(config?.siwxReown)
  const isSiweEnabled = Boolean(config?.siweConfig)
  const isMultiChain = config?.adapters?.length && config?.adapters?.length > 1
  const isPayEnabled = Boolean(config?.features?.pay)

  return (
    <>
      <AppKitButtonsMultiChain adapters={config?.adapters} />
      <AppKitInfoMultiChain config={config} />

      {isSiweEnabled ? <SiweData /> : null}
      {isSiwxReown ? <ReownAuthenticationTests /> : null}

      <AppKitConnections namespace="eip155" title="EVM Connections" />
      <AppKitConnections namespace="solana" title="Solana Connections" />
      <AppKitConnections namespace="bip122" title="Bitcoin Connections" />
      <AppKitConnections namespace="ton" title="TON Connections" />

      {evmAdapter === 'wagmi' && <WagmiTests />}
      {evmAdapter === 'ethers5' && <Ethers5Tests />}
      {evmAdapter === 'ethers' && <EthersTests />}
      {solanaAdapter ? <SolanaTests /> : null}
      {bitcoinAdapter ? <BitcoinTests /> : null}
      {tonAdapter ? <TonTests /> : null}
      {hasNoAdapters ? <UpaTests /> : null}

      {isPayEnabled ? <AppKitPay /> : null}

      {evmAdapter ? (
        <AppKitWalletButtons
          title="EVM Wallet Buttons"
          namespace={isMultiChain ? 'eip155' : undefined}
          wallets={[...ConstantsUtil.EvmWalletButtons, ...embeddedWalletOptions]}
        />
      ) : null}
      {solanaAdapter ? (
        <AppKitWalletButtons
          title="Solana Wallet Buttons"
          namespace={isMultiChain ? 'solana' : undefined}
          wallets={[...ConstantsUtil.SolanaWalletButtons, ...embeddedWalletOptions]}
        />
      ) : null}
      {bitcoinAdapter ? (
        <AppKitWalletButtons
          title="Bitcoin Wallet Buttons"
          namespace={isMultiChain ? 'bip122' : undefined}
          wallets={ConstantsUtil.BitcoinWalletButtons}
          showActions={false}
        />
      ) : null}
    </>
  )
}
