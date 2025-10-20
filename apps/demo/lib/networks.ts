import { type ChainNamespace } from '@laughingwhales/appkit-common'
import {
  type AppKitNetwork,
  arbitrum,
  assetHub,
  avalanche,
  base,
  bitcoin,
  bitcoinTestnet,
  bsc,
  kusama,
  mainnet,
  optimism,
  polkadot,
  polygon,
  solana,
  solanaDevnet,
  westend,
  zksync
} from '@laughingwhales/appkit/networks'

export type NetworkOption = {
  namespace: ChainNamespace
  network: AppKitNetwork
}

export const NETWORK_OPTIONS = [
  { namespace: 'eip155', network: mainnet },
  { namespace: 'eip155', network: optimism },
  { namespace: 'eip155', network: bsc },
  { namespace: 'eip155', network: polygon },
  { namespace: 'eip155', network: avalanche },
  { namespace: 'eip155', network: arbitrum },
  { namespace: 'eip155', network: zksync },
  { namespace: 'eip155', network: base },
  { namespace: 'solana', network: solana },
  { namespace: 'solana', network: solanaDevnet },
  { namespace: 'bip122', network: bitcoin },
  { namespace: 'bip122', network: bitcoinTestnet },
  { namespace: 'polkadot', network: polkadot },
  { namespace: 'polkadot', network: kusama },
  { namespace: 'polkadot', network: westend },
  { namespace: 'polkadot', network: assetHub }
] as NetworkOption[]
