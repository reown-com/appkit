import { createWeb3Modal, defaultSolanaConfig } from '@web3modal/solana/react'

import { ThemeStore } from '../../utils/StoreUtil'
import { solana, solanaDevnet, solanaTestnet } from '../../utils/ChainsUtil'
import { Web3ModalButtons } from '../../components/Web3ModalButtons'
import { ConstantsUtil } from '../../utils/ConstantsUtil'
import { SolanaTests } from '../../components/Solana/SolanaTests'
import {
  AlphaWalletAdapter,
  AvanaWalletAdapter,
  BitpieWalletAdapter,
  CloverWalletAdapter,
  Coin98WalletAdapter,
  CoinbaseWalletAdapter,
  CoinhubWalletAdapter,
  FractalWalletAdapter,
  HuobiWalletAdapter,
  HyperPayWalletAdapter,
  KeystoneWalletAdapter,
  KrystalWalletAdapter,
  LedgerWalletAdapter,
  MathWalletAdapter,
  NekoWalletAdapter,
  NightlyWalletAdapter,
  NufiWalletAdapter,
  OntoWalletAdapter,
  ParticleAdapter,
  PhantomWalletAdapter,
  SafePalWalletAdapter,
  SaifuWalletAdapter,
  SalmonWalletAdapter,
  SkyWalletAdapter,
  SolflareWalletAdapter,
  SolongWalletAdapter,
  SpotWalletAdapter,
  TokenaryWalletAdapter,
  TokenPocketWalletAdapter,
  TorusWalletAdapter,
  TrezorWalletAdapter,
  TrustWalletAdapter,
  UnsafeBurnerWalletAdapter,
  XDEFIWalletAdapter
} from '@solana/wallet-adapter-wallets'

const chains = [solana, solanaTestnet, solanaDevnet]

export const solanaConfig = defaultSolanaConfig({
  chains,
  projectId: ConstantsUtil.ProjectId,
  metadata: ConstantsUtil.Metadata
})

const modal = createWeb3Modal({
  solanaConfig,
  projectId: ConstantsUtil.ProjectId,
  metadata: ConstantsUtil.Metadata,
  chains,
  enableAnalytics: false,
  termsConditionsUrl: 'https://walletconnect.com/terms',
  privacyPolicyUrl: 'https://walletconnect.com/privacy',
  adapters: [
    AlphaWalletAdapter,
    AvanaWalletAdapter,
    BitpieWalletAdapter,
    CloverWalletAdapter,
    Coin98WalletAdapter,
    CoinbaseWalletAdapter,
    CoinhubWalletAdapter,
    FractalWalletAdapter,
    HuobiWalletAdapter,
    HyperPayWalletAdapter,
    KeystoneWalletAdapter,
    KrystalWalletAdapter,
    LedgerWalletAdapter,
    MathWalletAdapter,
    NekoWalletAdapter,
    NightlyWalletAdapter,
    NufiWalletAdapter,
    OntoWalletAdapter,
    ParticleAdapter,
    PhantomWalletAdapter,
    SafePalWalletAdapter,
    SaifuWalletAdapter,
    SalmonWalletAdapter,
    SkyWalletAdapter,
    SolflareWalletAdapter,
    SolongWalletAdapter,
    SpotWalletAdapter,
    TokenaryWalletAdapter,
    TokenPocketWalletAdapter,
    TorusWalletAdapter,
    TrezorWalletAdapter,
    TrustWalletAdapter,
    UnsafeBurnerWalletAdapter,
    XDEFIWalletAdapter
  ]
})

ThemeStore.setModal(modal)

export default function Solana() {
  return (
    <>
      <Web3ModalButtons />
      <SolanaTests />
    </>
  )
}
