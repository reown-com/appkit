export type SafeLocalStorageItems = {
  '@appkit/wallet_id': string
  '@appkit/wallet_name': string
  '@appkit/solana_wallet': string
  '@appkit/solana_caip_chain': string
  '@appkit/active_caip_network_id': string
  '@appkit/connected_connector': string
  '@appkit/connected_social': string
  '@appkit/connected_social_username': string
  '@appkit/recent_wallets': string
  WALLETCONNECT_DEEPLINK_CHOICE: { href: string; name: string }
}

export const SafeLocalStorageKeys = {
  WALLET_ID: '@appkit/wallet_id',
  WALLET_NAME: '@appkit/wallet_name',
  SOLANA_WALLET: '@appkit/solana_wallet',
  SOLANA_CAIP_CHAIN: '@appkit/solana_caip_chain',
  ACTIVE_CAIP_NETWORK_ID: '@appkit/active_caip_network_id',
  CONNECTED_CONNECTOR: '@appkit/connected_connector',
  CONNECTED_SOCIAL: '@appkit/connected_social',
  CONNECTED_SOCIAL_USERNAME: '@appkit/connected_social_username',
  RECENT_WALLETS: '@appkit/recent_wallets',
  DEEPLINK_CHOICE: 'WALLETCONNECT_DEEPLINK_CHOICE'
} as const

export const SafeLocalStorage = {
  setItem<Key extends keyof SafeLocalStorageItems>(
    key: Key,
    value: SafeLocalStorageItems[Key]
  ): void {
    if (isSafe()) {
      localStorage.setItem(
        key,
        key === SafeLocalStorageKeys.DEEPLINK_CHOICE ? JSON.stringify(value) : (value as string)
      )
    }
  },
  getItem<Key extends keyof SafeLocalStorageItems>(
    key: Key
  ): SafeLocalStorageItems[Key] | undefined {
    if (isSafe()) {
      const value = localStorage.getItem(key)

      if (value) {
        if (key === SafeLocalStorageKeys.DEEPLINK_CHOICE) {
          try {
            return JSON.parse(value)
          } catch {
            return undefined
          }
        }

        return value as SafeLocalStorageItems[Key]
      }
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
