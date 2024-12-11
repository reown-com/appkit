export type SafeLocalStorageItems = {
  '@appkit/wallet_id': string
  '@appkit/wallet_name': string
  '@appkit/solana_wallet': string
  '@appkit/solana_caip_chain': string
  '@appkit/active_caip_network_id': string
  '@appkit/connected_connector_eip155': string
  '@appkit/connected_connector_solana': string
  '@appkit/connected_connector_bip122': string
  '@appkit/connected_connector_polkadot': string
  '@appkit/connected_social': string
  '@appkit/connected_social_username': string
  '@appkit/recent_wallets': string
  '@appkit/active_namespace': string
  '@appkit/connection_status': string
  /*
   * DO NOT CHANGE: @walletconnect/universal-provider requires us to set this specific key
   *  This value is a stringified version of { href: stiring; name: string }
   */
  WALLETCONNECT_DEEPLINK_CHOICE: string
}

export const SafeLocalStorageKeys = {
  WALLET_ID: '@appkit/wallet_id',
  WALLET_NAME: '@appkit/wallet_name',
  SOLANA_WALLET: '@appkit/solana_wallet',
  SOLANA_CAIP_CHAIN: '@appkit/solana_caip_chain',
  ACTIVE_CAIP_NETWORK_ID: '@appkit/active_caip_network_id',
  CONNECTED_CONNECTOR_eip155: '@appkit/connected_connector_eip155',
  CONNECTED_CONNECTOR_solana: '@appkit/connected_connector_solana',
  CONNECTED_CONNECTOR_bip122: '@appkit/connected_connector_bip122',
  CONNECTED_CONNECTOR_polkadot: '@appkit/connected_connector_polkadot',
  CONNECTED_SOCIAL: '@appkit/connected_social',
  CONNECTED_SOCIAL_USERNAME: '@appkit/connected_social_username',
  RECENT_WALLETS: '@appkit/recent_wallets',
  DEEPLINK_CHOICE: 'WALLETCONNECT_DEEPLINK_CHOICE',
  ACTIVE_NAMESPACE: '@appkit/active_namespace',
  CONNECTION_STATUS: '@appkit/connection_status'
} as const

export const SafeLocalStorage = {
  setItem<Key extends keyof SafeLocalStorageItems>(
    key: Key,
    value: SafeLocalStorageItems[Key]
  ): void {
    if (isSafe()) {
      localStorage.setItem(key, value)
    }
  },
  getItem<Key extends keyof SafeLocalStorageItems>(
    key: Key
  ): SafeLocalStorageItems[Key] | undefined {
    if (isSafe()) {
      return localStorage.getItem(key) || undefined
    }

    return undefined
  },
  removeItem<Key extends keyof SafeLocalStorageItems>(key: Key): void {
    if (isSafe()) {
      localStorage.removeItem(key)
    }
  },
  clear(): void {
    if (isSafe()) {
      localStorage.clear()
    }
  }
}

function isSafe(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}
