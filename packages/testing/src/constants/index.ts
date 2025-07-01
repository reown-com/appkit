import type { SessionParams } from '../types/index.js'

// Allow localhost
export const BASE_URL = process.env['BASE_URL'] || 'http://localhost:3000/'
export const WALLET_URL = process.env['WALLET_URL'] || 'https://react-wallet.walletconnect.com'
export const DEFAULT_SESSION_PARAMS: SessionParams = {
  reqAccounts: ['1', '2'],
  optAccounts: ['1', '2'],
  accept: true
}
export const SECURE_WEBSITE_URL = 'https://secure.reown.com'
export const DEFAULT_CHAIN_NAME = process.env['DEFAULT_CHAIN_NAME'] || 'Ethereum'

export const EXTENSION_RDNS = 'reown.com'
export const EXTENSION_NAME = 'Reown'
export const ALL_SOCIALS = ['google', 'farcaster', 'github', 'discord', 'apple', 'facebook']

export const PROJECT_ID = '7d59d2594a9d2527f22f89d8014b887b'

export const DEFAULT_WC_EIP155_NAMESPACE_CONFIG = {
  methods: ['eth_requestAccounts'],
  events: ['accountsChanged', 'chainChanged'],
  chains: ['eip155:1']
}
export const DEFAULT_WC_SOLANA_NAMESPACE_CONFIG = {
  methods: ['solana_requestAccounts'],
  events: ['accountsChanged', 'chainChanged'],
  chains: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp']
}
export const DEFAULT_WC_BITCOIN_NAMESPACE_CONFIG = {
  methods: ['bip122_requestAccounts'],
  events: ['accountsChanged', 'chainChanged'],
  chains: ['bip122:000000000019d6689c085ae165831e93']
}
