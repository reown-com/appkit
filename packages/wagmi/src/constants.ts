import type { ConnectorType } from '@web3modal/scaffold-html'

export const WALLET_CONNECT_ID = 'walletConnect'

export const INJECTED_ID = 'injected'

export const NAMESPACE = 'eip155'

export const NAME_MAP = {
  [INJECTED_ID]: 'Browser Wallet'
} as Record<string, string>

export const TYPE_MAP = {
  [WALLET_CONNECT_ID]: 'WALLET_CONNECT',
  [INJECTED_ID]: 'INJECTED'
} as Record<string, ConnectorType>

export const ADD_CHAIN_METHOD = 'wallet_addEthereumChain'

export const WALLET_CHOICE_KEY = 'wagmi.wallet'
