import { type ChainNamespace } from '@reown/appkit-common'

import { bellota, breeSerif, domine, ebGaramond, inter, notoSans } from '@/lib/fonts'
import { NETWORK_OPTIONS } from '@/lib/networks'

export const ACCENT_COLORS = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981']
export const BG_COLORS = ['#202020', '#363636', '#FFFFFF']

export const RADIUS_NAME_VALUE_MAP = {
  '-': '0px',
  S: '1px',
  M: '2px',
  L: '4px',
  XL: '8px'
}

export const FONT_OPTIONS = [
  { label: 'Inter', value: inter.style.fontFamily },
  { label: 'Noto Sans', value: notoSans.style.fontFamily },
  { label: 'Domine', value: domine.style.fontFamily },
  { label: 'EB Garamond', value: ebGaramond.style.fontFamily },
  { label: 'Bree Serif', value: breeSerif.style.fontFamily },
  { label: 'Bellota', value: bellota.style.fontFamily }
]

export function getNamespaceNetworks(namespace: ChainNamespace) {
  return NETWORK_OPTIONS.filter(n => n.namespace === namespace).map(n => n.network)
}

export const NETWORK_ID_NAMESPACE_MAP = {
  1: 'eip155',
  42161: 'eip155',
  43114: 'eip155',
  56: 'eip155',
  10: 'eip155',
  137: 'eip155',
  324: 'eip155',
  8453: 'eip155',
  '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp': 'solana',
  EtWTRABZaYq6iMfeYKouRu166VU2xqa1: 'solana',
  '000000000019d6689c085ae165831e93': 'bip122',
  '000000000933ea01ad0ee984209779ba': 'bip122'
}

export const NAMESPACE_NETWORK_IDS_MAP: Record<ChainNamespace, (string | number)[]> = {
  eip155: [1, 42161, 43114, 56, 10, 137, 324, 8453],
  solana: ['5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp', 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1'],
  bip122: ['000000000019d6689c085ae165831e93', '000000000933ea01ad0ee984209779ba'],
  polkadot: [],
  cosmos: []
}
