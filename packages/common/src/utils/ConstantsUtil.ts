import type { ChainNamespace } from './TypeUtil.js'

export const ConstantsUtil = {
  WC_NAME_SUFFIX: '.reown.id',
  WC_NAME_SUFFIX_LEGACY: '.wcn.id',
  BLOCKCHAIN_API_RPC_URL: 'https://rpc.walletconnect.org',
  PULSE_API_URL: 'https://pulse.walletconnect.org',
  W3M_API_URL: 'https://api.appkit.org',
  CHAIN: {
    EVM: 'eip155',
    SOLANA: 'solana',
    POLKADOT: 'polkadot'
  } as const satisfies Record<string, ChainNamespace>,
  CHAIN_NAME_MAP: {
    eip155: 'Ethereum',
    solana: 'Solana',
    polkadot: 'Polkadot'
  } as const satisfies Record<ChainNamespace, string>
} as const
