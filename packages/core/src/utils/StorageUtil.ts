/* eslint-disable no-console */
import { SafeLocalStorage, SafeLocalStorageKeys, type ChainNamespace } from '@reown/appkit-common'
import type { WcWallet, ConnectorType, SocialProvider, ConnectionStatus } from './TypeUtil.js'
import { ChainController } from '../controllers/ChainController.js'

// -- Utility -----------------------------------------------------------------
export const StorageUtil = {
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

  setConnectedConnector(connectorType: ConnectorType) {
    try {
      SafeLocalStorage.setItem(SafeLocalStorageKeys.CONNECTED_CONNECTOR, connectorType)
    } catch {
      console.info('Unable to set Connected Connector')
    }
  },

  setConnectedNamespace(namespace: ChainNamespace) {
    try {
      SafeLocalStorage.setItem(SafeLocalStorageKeys.CONNECTED_NAMESPACE, namespace)
    } catch {
      console.info('Unable to set Connected Namespace')
    }
  },

  getConnectedConnector() {
    try {
      return SafeLocalStorage.getItem(SafeLocalStorageKeys.CONNECTED_CONNECTOR) as ConnectorType
    } catch {
      console.info('Unable to get Connected Connector')
    }

    return undefined
  },

  setConnectedSocialProvider(socialProvider: SocialProvider) {
    try {
      SafeLocalStorage.setItem(SafeLocalStorageKeys.CONNECTED_SOCIAL, socialProvider)
    } catch {
      console.info('Unable to set Connected Social Provider')
    }
  },

  getConnectedSocialProvider() {
    try {
      return SafeLocalStorage.getItem(SafeLocalStorageKeys.CONNECTED_SOCIAL)
    } catch {
      console.info('Unable to get Connected Social Provider')
    }

    return undefined
  },

  getConnectedSocialUsername() {
    try {
      return SafeLocalStorage.getItem(SafeLocalStorageKeys.CONNECTED_SOCIAL_USERNAME)
    } catch {
      console.info('Unable to get Connected Social Username')
    }

    return undefined
  },

  getStoredActiveCaipNetwork() {
    const storedCaipNetworkId = SafeLocalStorage.getItem(
      SafeLocalStorageKeys.ACTIVE_CAIP_NETWORK_ID
    )
    const allRequestedCaipNetworks = ChainController.getAllRequestedCaipNetworks()
    const storedCaipNetwork = allRequestedCaipNetworks?.find(
      c => c.caipNetworkId === storedCaipNetworkId
    )

    return storedCaipNetwork
  },

  setConnectionStatus(status: ConnectionStatus) {
    try {
      SafeLocalStorage.setItem(SafeLocalStorageKeys.CONNECTION_STATUS, status)
    } catch {
      console.info('Unable to set Connection Status')
    }
  },

  getConnectionStatus() {
    try {
      return SafeLocalStorage.getItem(SafeLocalStorageKeys.CONNECTION_STATUS) as ConnectionStatus
    } catch {
      return undefined
    }
  }
}
