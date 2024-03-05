import { PublicKey } from '@solana/web3.js'

/**
 * Request methods to the solana RPC.
 * @see {@link https://solana.com/docs}
 */
export const SolConstantsUtil = {
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
  TOKEN_PROGRAM_ID: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
  /**
   * Mainnet program ID
   */
  NAME_TOKENIZER_ID: new PublicKey('nftD3vbNkNqfj2Sd3HZwbpw4BxxKWr4AjGb9X38JeZk'),
  MINT_PREFIX: Buffer.from('tokenized_name'),
  WALLET_ID: '@w3m/solana_wallet',
  CAIP_CHAIN_ID: '@w3m/solana_caip_chain',
  ERROR_CODE_UNRECOGNIZED_CHAIN_ID: 4902,
  ERROR_CODE_DEFAULT: 5000,
  DEFAULT_CHAIN: {
    chainId: '4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZ',
    name: 'Solana',
    currency: 'SOL',
    explorerUrl: 'https://solscan.io',
    rpcUrl:
      'https://rpc.walletconnect.com/v1?chainId=solana:4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZ&projectId=bbcbaddb9e8a1ae8f5f7c60f3e5a666e'
  }
}
