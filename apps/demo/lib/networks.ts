import { type ChainNamespace } from '@reown/appkit-common'
import {
  type AppKitNetwork,
  arbitrum,
  avalanche,
  base,
  bitcoin,
  bitcoinTestnet,
  bsc,
  mainnet,
  optimism,
  polygon,
  solana,
  solanaDevnet,
  zksync
} from '@reown/appkit/networks'

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
  { namespace: 'bip122', network: bitcoinTestnet }
] as NetworkOption[]
