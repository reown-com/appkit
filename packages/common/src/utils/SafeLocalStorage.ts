import type { ChainNamespace } from './TypeUtil.js'

export type NamespacedConnectorKey = `@appkit/${ChainNamespace}:connected_connector_id`
export type SafeLocalStorageItems = {
  '@appkit/wallet_id': string
  '@appkit/wallet_name': string
  '@appkit/solana_wallet': string
  '@appkit/solana_caip_chain': string
  '@appkit/active_caip_network_id': string
  '@appkit/connected_social': string
  '@appkit-wallet/SOCIAL_USERNAME': string
  '@appkit/recent_wallets': string
  '@appkit/active_namespace': string
  '@appkit/connected_namespaces': string
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
  CONNECTED_SOCIAL: '@appkit/connected_social',
  CONNECTED_SOCIAL_USERNAME: '@appkit-wallet/SOCIAL_USERNAME',
  RECENT_WALLETS: '@appkit/recent_wallets',
  DEEPLINK_CHOICE: 'WALLETCONNECT_DEEPLINK_CHOICE',
  ACTIVE_NAMESPACE: '@appkit/active_namespace',
  CONNECTED_NAMESPACES: '@appkit/connected_namespaces',
  CONNECTION_STATUS: '@appkit/connection_status',
  SIWX_AUTH_TOKEN: '@appkit/siwx-auth-token',
  SIWX_NONCE_TOKEN: '@appkit/siwx-nonce-token'
} as const satisfies Record<string, keyof SafeLocalStorageItems>

export type SafeLocalStorageKey = keyof SafeLocalStorageItems | NamespacedConnectorKey

export function getSafeConnectorIdKey(namespace?: ChainNamespace): NamespacedConnectorKey {
  if (!namespace) {
    throw new Error('Namespace is required for CONNECTED_CONNECTOR_ID')
  }

  return `@appkit/${namespace}:connected_connector_id`
}

export const SafeLocalStorage = {
  setItem(key: SafeLocalStorageKey, value?: string): void {
    if (isSafe() && value !== undefined) {
      localStorage.setItem(key, value)
    }
  },
  getItem(key: SafeLocalStorageKey): string | undefined {
    if (isSafe()) {
      return localStorage.getItem(key) || undefined
    }

    return undefined
  },
  removeItem(key: SafeLocalStorageKey): void {
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
