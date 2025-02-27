import type { ChainNamespace } from '@reown/appkit-common'

export const ConstantsUtil = {
  /* Connector names */
  METMASK_CONNECTOR_NAME: 'MetaMask',
  TRUST_CONNECTOR_NAME: 'Trust Wallet',
  SOLFLARE_CONNECTOR_NAME: 'Solflare',
  PHANTOM_CONNECTOR_NAME: 'Phantom',
  COIN98_CONNECTOR_NAME: 'Coin98',
  MAGIC_EDEN_CONNECTOR_NAME: 'Magic Eden',
  BACKPACK_CONNECTOR_NAME: 'Backpack',
  BITGET_CONNECTOR_NAME: 'Bitget Wallet',
  FRONTIER_CONNECTOR_NAME: 'Frontier',
  XVERSE_CONNECTOR_NAME: 'Xverse Wallet',
  LEATHER_CONNECTOR_NAME: 'Leather',

  EIP155: 'eip155' as ChainNamespace,
  ADD_CHAIN_METHOD: 'wallet_addEthereumChain',
  EIP6963_ANNOUNCE_EVENT: 'eip6963:announceProvider',
  EIP6963_REQUEST_EVENT: 'eip6963:requestProvider',
  CONNECTOR_RDNS_MAP: {
    coinbaseWallet: 'com.coinbase.wallet',
    coinbaseWalletSDK: 'com.coinbase.wallet'
  } as Record<string, string>,
  CONNECTOR_TYPE_EXTERNAL: 'EXTERNAL',
  CONNECTOR_TYPE_WALLET_CONNECT: 'WALLET_CONNECT',
  CONNECTOR_TYPE_INJECTED: 'INJECTED',
  CONNECTOR_TYPE_ANNOUNCED: 'ANNOUNCED',
  CONNECTOR_TYPE_AUTH: 'AUTH',
  CONNECTOR_TYPE_MULTI_CHAIN: 'MULTI_CHAIN',
  CONNECTOR_TYPE_W3M_AUTH: 'ID_AUTH'
}
