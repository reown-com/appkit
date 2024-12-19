/* eslint-disable no-console */
import {
  SafeLocalStorage,
  SafeLocalStorageKeys,
  type CaipNetworkId,
  type ChainNamespace,
  getSafeConnectorIdKey
} from '@reown/appkit-common'
import type { WcWallet, SocialProvider, ConnectionStatus } from './TypeUtil.js'

// -- Utility -----------------------------------------------------------------
export const StorageUtil = {
  getActiveNetworkProps() {
    const activeNamespace = StorageUtil.getActiveNamespace()
    const activeCaipNetworkId = StorageUtil.getActiveCaipNetworkId()
    const caipNetworkIdFromStorage = activeCaipNetworkId
      ? activeCaipNetworkId.split(':')[1]
      : undefined

    return {
      namespace: activeNamespace,
      caipNetworkId: activeCaipNetworkId,
      chainId: caipNetworkIdFromStorage
    }
  },

  setWalletConnectDeepLink({ name, href }: { href: string; name: string }) {
    try {
      SafeLocalStorage.setItem(SafeLocalStorageKeys.DEEPLINK_CHOICE, JSON.stringify({ href, name }))
    } catch {
      console.info('Unable to set WalletConnect deep link')
    }
  },

  getWalletConnectDeepLink() {
    try {
      const deepLink = SafeLocalStorage.getItem(SafeLocalStorageKeys.DEEPLINK_CHOICE)
      if (deepLink) {
        return JSON.parse(deepLink)
      }
    } catch {
      console.info('Unable to get WalletConnect deep link')
    }

    return undefined
  },

  deleteWalletConnectDeepLink() {
    try {
      SafeLocalStorage.removeItem(SafeLocalStorageKeys.DEEPLINK_CHOICE)
    } catch {
      console.info('Unable to delete WalletConnect deep link')
    }
  },

  setActiveNamespace(namespace: ChainNamespace) {
    try {
      SafeLocalStorage.setItem(SafeLocalStorageKeys.ACTIVE_NAMESPACE, namespace)
    } catch {
      console.info('Unable to set active namespace')
    }
  },

  setActiveCaipNetworkId(caipNetworkId: CaipNetworkId) {
    try {
      SafeLocalStorage.setItem(SafeLocalStorageKeys.ACTIVE_CAIP_NETWORK_ID, caipNetworkId)
      StorageUtil.setActiveNamespace(caipNetworkId.split(':')[0] as ChainNamespace)
    } catch {
      console.info('Unable to set active caip network id')
    }
  },

  getActiveCaipNetworkId() {
    try {
      return SafeLocalStorage.getItem(SafeLocalStorageKeys.ACTIVE_CAIP_NETWORK_ID)
    } catch {
      console.info('Unable to get active caip network id')

      return undefined
    }
  },

  deleteActiveCaipNetworkId() {
    try {
      SafeLocalStorage.removeItem(SafeLocalStorageKeys.ACTIVE_CAIP_NETWORK_ID)
    } catch {
      console.info('Unable to delete active caip network id')
    }
  },

  deleteConnectedConnectorId(namespace: ChainNamespace) {
    try {
      const key = getSafeConnectorIdKey(namespace)
      SafeLocalStorage.removeItem(key)
    } catch {
      console.info('Unable to delete connected connector id')
    }
  },

  setAppKitRecent(wallet: WcWallet) {
    try {
      const recentWallets = StorageUtil.getRecentWallets()
      const exists = recentWallets.find(w => w.id === wallet.id)
      if (!exists) {
        recentWallets.unshift(wallet)
        if (recentWallets.length > 2) {
          recentWallets.pop()
        }
        SafeLocalStorage.setItem(SafeLocalStorageKeys.RECENT_WALLETS, JSON.stringify(recentWallets))
      }
    } catch {
      console.info('Unable to set AppKit recent')
    }
  },

  getRecentWallets(): WcWallet[] {
    try {
      const recent = SafeLocalStorage.getItem(SafeLocalStorageKeys.RECENT_WALLETS)

      return recent ? JSON.parse(recent) : []
    } catch {
      console.info('Unable to get AppKit recent')
    }

    return []
  },

  setConnectedConnectorId(namespace: ChainNamespace, connectorId: string) {
    try {
      const key = getSafeConnectorIdKey(namespace)
      SafeLocalStorage.setItem(key, connectorId)
    } catch {
      console.info('Unable to set Connected Connector Id')
    }
  },

  getActiveNamespace() {
    try {
      const activeNamespace = SafeLocalStorage.getItem(SafeLocalStorageKeys.ACTIVE_NAMESPACE)

      return activeNamespace as ChainNamespace | undefined
    } catch {
      console.info('Unable to get active namespace')
    }

    return undefined
  },

  getConnectedConnectorId(namespace: ChainNamespace) {
    try {
      const key = getSafeConnectorIdKey(namespace)
      console.log('>> key', key)

      return SafeLocalStorage.getItem(key)
    } catch (e) {
      console.trace('Unable to get connected connector id in namespace ', namespace)
    }

    return undefined
  },

  setConnectedSocialProvider(socialProvider: SocialProvider) {
    try {
      SafeLocalStorage.setItem(SafeLocalStorageKeys.CONNECTED_SOCIAL, socialProvider)
    } catch {
      console.info('Unable to set connected social provider')
    }
  },

  getConnectedSocialProvider() {
    try {
      return SafeLocalStorage.getItem(SafeLocalStorageKeys.CONNECTED_SOCIAL)
    } catch {
      console.info('Unable to get connected social provider')
    }

    return undefined
  },

  getConnectedSocialUsername() {
    try {
      return SafeLocalStorage.getItem(SafeLocalStorageKeys.CONNECTED_SOCIAL_USERNAME)
    } catch {
      console.info('Unable to get connected social username')
    }

    return undefined
  },

  getStoredActiveCaipNetworkId() {
    const storedCaipNetworkId = SafeLocalStorage.getItem(
      SafeLocalStorageKeys.ACTIVE_CAIP_NETWORK_ID
    )
    const networkId = storedCaipNetworkId?.split(':')?.[1]

    return networkId
  },

  setConnectionStatus(status: ConnectionStatus) {
    try {
      SafeLocalStorage.setItem(SafeLocalStorageKeys.CONNECTION_STATUS, status)
    } catch {
      console.info('Unable to set connection status')
    }
  },

  getConnectionStatus() {
    try {
      return SafeLocalStorage.getItem(SafeLocalStorageKeys.CONNECTION_STATUS) as ConnectionStatus
    } catch {
      return undefined
    }
  },

  getConnectedNamespaces() {
    try {
      const namespaces = SafeLocalStorage.getItem(SafeLocalStorageKeys.CONNECTED_NAMESPACES)

      if (!namespaces?.length) {
        return []
      }

      return namespaces.split(',') as ChainNamespace[]
    } catch {
      return []
    }
  },

  setConnectedNamespaces(namespaces: ChainNamespace[]) {
    try {
      SafeLocalStorage.setItem(SafeLocalStorageKeys.CONNECTED_NAMESPACES, namespaces.join(','))
    } catch {
      console.info('Unable to set namespaces in storage')
    }
  }
}
