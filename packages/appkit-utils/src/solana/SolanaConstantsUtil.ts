import { PublicKey } from '@solana/web3.js'

import { type CaipNetwork, ConstantsUtil } from '@reown/appkit-common'

export const SolConstantsUtil = {
  UNIVERSAL_PROVIDER_RELAY_URL: 'wss://relay.walletconnect.org',
  HASH_PREFIX: 'SPL Name Service',
  /**
   * The `.sol` TLD
   */
  ROOT_DOMAIN_ACCOUNT: new PublicKey('58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx'),
  /**
   * The Solana Name Service program ID
   */
  NAME_PROGRAM_ID: new PublicKey('namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX'),
  /**
   * The reverse look up class
   */
  REVERSE_LOOKUP_CLASS: new PublicKey('33m47vH6Eav6jr5Ry86XjhRft2jRBLDnDgPSHoquXi2Z'),
  /**
   * Mainnet program ID
   */
  DEFAULT_CHAIN: {
    id: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
    caipNetworkId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
    name: 'Solana',
    chainNamespace: ConstantsUtil.CHAIN.SOLANA,
    nativeCurrency: {
      name: 'Solana',
      decimals: 9,
      symbol: 'SOL'
    },
    blockExplorers: {
      default: {
        name: 'Solscan',
        url: 'https://solscan.io'
      }
    },
    rpcUrls: {
      default: {
        http: [`${ConstantsUtil.BLOCKCHAIN_API_RPC_URL}/v1`]
      }
    }
  } as CaipNetwork,
  CHAIN_IDS: {
    Mainnet: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
    Devnet: 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
    Testnet: 'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z',
    Deprecated_Mainnet: 'solana:4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZ',
    Deprecated_Devnet: 'solana:8E9rvCKLFQia2Y35HXjjpWzj8weVo44K'
  },
  LAMPORTS_PER_SOL: 1_000_000_000
} as const

export const SPL_COMPUTE_BUDGET_CONSTANTS = {
  UNIT_PRICE_MICRO_LAMPORTS: 20000000,
  UNIT_LIMIT_TRANSFER_ONLY: 300000,
  UNIT_LIMIT_WITH_ATA_CREATION: 400000
} as const
