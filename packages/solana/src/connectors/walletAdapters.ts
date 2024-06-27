import type { Connector } from '@web3modal/scaffold'
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack'
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
import type { BaseWalletAdapter } from '@solana/wallet-adapter-base'

const adaptersDictionary = {
  alpha: AlphaWalletAdapter,
  avana: AvanaWalletAdapter,
  bitpie: BitpieWalletAdapter,
  clover: CloverWalletAdapter,
  coin98: Coin98WalletAdapter,
  coinbase: CoinbaseWalletAdapter,
  coinhub: CoinhubWalletAdapter,
  fractal: FractalWalletAdapter,
  huobi: HuobiWalletAdapter,
  hyperpay: HyperPayWalletAdapter,
  keystone: KeystoneWalletAdapter,
  krystal: KrystalWalletAdapter,
  ledger: LedgerWalletAdapter,
  mathwallet: MathWalletAdapter,
  neko: NekoWalletAdapter,
  nightly: NightlyWalletAdapter,
  nufi: NufiWalletAdapter,
  onto: OntoWalletAdapter,
  particle: ParticleAdapter,
  phantom: PhantomWalletAdapter,
  safepal: SafePalWalletAdapter,
  saifu: SaifuWalletAdapter,
  salmon: SalmonWalletAdapter,
  sky: SkyWalletAdapter,
  solflare: SolflareWalletAdapter,
  solong: SolongWalletAdapter,
  spot: SpotWalletAdapter,
  tokenary: TokenaryWalletAdapter,
  tokenPocket: TokenPocketWalletAdapter,
  torus: TorusWalletAdapter,
  trezor: TrezorWalletAdapter,
  trust: TrustWalletAdapter,
  unsafeBurner: UnsafeBurnerWalletAdapter,
  xdefi: XDEFIWalletAdapter
}

export type AdapterKey = keyof typeof adaptersDictionary

export function createWalletAdapters(adapterList: AdapterKey[], _chainId?: string) {
  const result = {} as Record<AdapterKey, BaseWalletAdapter>
  for (const adapter of adapterList) {
    result[adapter] = new adaptersDictionary[adapter]() as BaseWalletAdapter
  }

  return result
}

export function syncInjectedWallets(
  w3mConnectors: Connector[],
  adapters: Record<AdapterKey, BaseWalletAdapter>
) {
  for (const adapter of Object.values(adapters)) {
    w3mConnectors.push({
      id: adapter.name,
      type: 'ANNOUNCED',
      imageUrl: adapter.icon,
      name: adapter.name,
      provider: adapter
    })
  }

  if (window.backpack) {
    const adapter = new BackpackWalletAdapter()
    w3mConnectors.push({
      id: adapter.name,
      type: 'ANNOUNCED',
      imageUrl: adapter.icon,
      name: adapter.name,
      provider: adapter
    })
  }
}
