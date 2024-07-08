import type { Chain } from './TypeUtil.js'

export const ConstantsUtil = {
  WC_NAME_SUFFIX: '.wcn.id',
  BLOCKCHAIN_API_RPC_URL: 'https://rpc.walletconnect.org',
  PULSE_API_URL: 'https://pulse.walletconnect.org',
  W3M_API_URL: 'https://api.web3modal.org',
  APPKIT_AUTH_API_URL: 'https://api-web3modal-auth-staging.walletconnect-v1-bridge.workers.dev',
  // APPKIT_AUTH_API_URL: 'http://localhost:8787',
  CHAIN: {
    EVM: 'evm' as Chain,
    SOLANA: 'solana' as Chain
  },
  CHAIN_NAME: {
    EVM: 'Ethereum',
    SOLANA: 'Solana'
  }
}
