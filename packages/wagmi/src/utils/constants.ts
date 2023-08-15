import type { ConnectorType } from '@web3modal/scaffold'

export const WALLET_CONNECT_ID = 'walletConnect'

export const INJECTED_ID = 'injected'

export const NAMESPACE = 'eip155'

export const NAME_MAP = {
  [INJECTED_ID]: 'Extension Wallet'
} as Record<string, string>

export const TYPE_MAP = {
  [WALLET_CONNECT_ID]: 'WALLET_CONNECT',
  [INJECTED_ID]: 'INJECTED'
} as Record<string, ConnectorType>

export const ADD_CHAIN_METHOD = 'wallet_addEthereumChain'

export const WALLET_CHOICE_KEY = 'wagmi.wallet'

export const BLOCKCHAIN_HTTP_API = 'https://rpc.walletconnect.com'

export const BLOCKCHAIN_WSS_API = 'wss://rpc.walletconnect.com'

/**
 * DO NOT REMOVE
 * Checked against packages/core version in dangerfile
 */
export const VERSION = '3.0.0-alpha.1'
