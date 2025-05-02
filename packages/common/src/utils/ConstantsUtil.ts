/* eslint-disable @typescript-eslint/prefer-optional-chain */
import type { ChainNamespace } from './TypeUtil.js'

export const ConstantsUtil = {
  WC_NAME_SUFFIX: '.reown.id',
  WC_NAME_SUFFIX_LEGACY: '.wcn.id',
  BLOCKCHAIN_API_RPC_URL: 'https://rpc.walletconnect.org',
  PULSE_API_URL: 'https://pulse.walletconnect.org',
  W3M_API_URL: 'https://api.web3modal.org',
  /* Connector IDs */
  CONNECTOR_ID: {
    WALLET_CONNECT: 'walletConnect',
    INJECTED: 'injected',
    WALLET_STANDARD: 'announced',
    COINBASE: 'coinbaseWallet',
    COINBASE_SDK: 'coinbaseWalletSDK',
    SAFE: 'safe',
    LEDGER: 'ledger',
    OKX: 'okx',
    EIP6963: 'eip6963',
    AUTH: 'ID_AUTH'
  },
  CONNECTOR_NAMES: {
    AUTH: 'Auth'
  },
  AUTH_CONNECTOR_SUPPORTED_CHAINS: ['eip155', 'solana'] as ChainNamespace[],
  LIMITS: {
    PENDING_TRANSACTIONS: 99
  },
  CHAIN: {
    EVM: 'eip155',
    SOLANA: 'solana',
    POLKADOT: 'polkadot',
    BITCOIN: 'bip122'
  } as const satisfies Record<string, ChainNamespace>,
  CHAIN_NAME_MAP: {
    eip155: 'EVM Networks',
    solana: 'Solana',
    polkadot: 'Polkadot',
    bip122: 'Bitcoin',
    cosmos: 'Cosmos'
  } as const satisfies Record<ChainNamespace, string>,
  ADAPTER_TYPES: {
    BITCOIN: 'bitcoin',
    SOLANA: 'solana',
    WAGMI: 'wagmi',
    ETHERS: 'ethers',
    ETHERS5: 'ethers5'
  } as const satisfies Record<string, string>,
  USDT_CONTRACT_ADDRESSES: [
    // Mainnet
    '0xdac17f958d2ee523a2206206994597c13d831ec7',
    // Polygon
    '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
    // Avalanche
    '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7',
    // Cosmos
    '0x919C1c267BC06a7039e03fcc2eF738525769109c',
    // Celo
    '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e',
    // Binance
    '0x55d398326f99059fF775485246999027B3197955',
    // Arbitrum
    '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9'
  ],
  HTTP_STATUS_CODES: {
    SERVICE_UNAVAILABLE: 503,
    FORBIDDEN: 403
  },
  UNSUPPORTED_NETWORK_NAME: 'Unknown Network',
  SECURE_SITE_SDK_ORIGIN:
    (typeof process !== 'undefined' && typeof process.env !== 'undefined'
      ? process.env['NEXT_PUBLIC_SECURE_SITE_ORIGIN']
      : undefined) || 'https://secure.walletconnect.org'
} as const
