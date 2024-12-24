import { StorageManager } from './StorageManager'

export type SafeLocalStorageItems = {
  '@appkit/wallet_id': string
  '@appkit/wallet_name': string
  '@appkit/solana_wallet': string
  '@appkit/solana_caip_chain': string
  '@appkit/active_caip_network_id': string
  '@appkit/connected_connector_id': string
  '@appkit/connected_social': string
  '@appkit/connected_social_username': string
  '@appkit/recent_wallets': string
  '@appkit/active_namespace': string
  '@appkit/connection_status': string
  '@appkit/siwx-auth-token': string
  '@appkit/siwx-nonce-token': string
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
  CONNECTED_CONNECTOR_ID: '@appkit/connected_connector_id',
  CONNECTED_SOCIAL: '@appkit/connected_social',
  CONNECTED_SOCIAL_USERNAME: '@appkit/connected_social_username',
  RECENT_WALLETS: '@appkit/recent_wallets',
  DEEPLINK_CHOICE: 'WALLETCONNECT_DEEPLINK_CHOICE',
  ACTIVE_NAMESPACE: '@appkit/active_namespace',
  CONNECTION_STATUS: '@appkit/connection_status',
  SIWX_AUTH_TOKEN: '@appkit/siwx-auth-token',
  SIWX_NONCE_TOKEN: '@appkit/siwx-nonce-token'
} as const satisfies Record<string, keyof SafeLocalStorageItems>

export class SafeLocalStorage {
  public static setItem<Key extends keyof SafeLocalStorageItems>(
    key: Key,
    value?: SafeLocalStorageItems[Key]
  ): void | Promise<void> {
    if (value !== undefined) {
      const storage = StorageManager.getInstance().getStorage()
      const result = storage.setItem(key, value)
      if (result instanceof Promise) {
        return result.catch(() => {
          console.info(`Unable to set item with key: ${key}`)
        })
      }
    }
  }

  public static getItem<Key extends keyof SafeLocalStorageItems>(
    key: Key
  ): SafeLocalStorageItems[Key] | undefined | Promise<SafeLocalStorageItems[Key] | undefined> {
    const storage = StorageManager.getInstance().getStorage()
    const result = storage.getItem(key)
    if (result instanceof Promise) {
      return result.then(value => {
        if (value !== null && value !== undefined) {
          return value as SafeLocalStorageItems[Key]
        }
        return undefined
      })
    }
    return result === null ? undefined : (result as SafeLocalStorageItems[Key])
  }

  public static removeItem<Key extends keyof SafeLocalStorageItems>(
    key: Key
  ): void | Promise<void> {
    const storage = StorageManager.getInstance().getStorage()
    const result = storage.removeItem(key)
    if (result instanceof Promise) {
      return result.catch(() => {
        console.info(`Unable to remove item with key: ${key}`)
      })
    }
  }

  public static async clear(): Promise<void> {
    const storage = StorageManager.getInstance().getStorage()
    const promises: Array<void | Promise<void>> = []
    for (const key of Object.values(SafeLocalStorageKeys)) {
      promises.push(storage.removeItem(key))
    }
    await Promise.all(promises)
  }
}
