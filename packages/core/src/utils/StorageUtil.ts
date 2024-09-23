/* eslint-disable no-console */
import { SafeLocalStorage, SafeLocalStorageKeys } from '@reown/appkit-common'
import type { WcWallet, ConnectorType, SocialProvider } from './TypeUtil.js'
import { ChainController } from '../controllers/ChainController.js'

// -- Utility -----------------------------------------------------------------
export const StorageUtil = {
  setWalletConnectDeepLink({ name, href }: { href: string; name: string }) {
    try {
      const value = JSON.stringify({ href, name })
      SafeLocalStorage.setItem(SafeLocalStorageKeys.DEEPLINK, value)
      // Required by @walletconnect/universal-provider to handle deep links
      localStorage.setItem('WALLETCONNECT_DEEPLINK_CHOICE', value)
    } catch {
      console.info('Unable to set WalletConnect deep link')
    }
  },

  getWalletConnectDeepLink() {
    try {
      const deepLink = SafeLocalStorage.getItem(SafeLocalStorageKeys.DEEPLINK)
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
      SafeLocalStorage.removeItem(SafeLocalStorageKeys.DEEPLINK)
      localStorage.removeItem('WALLETCONNECT_DEEPLINK_CHOICE')
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
    const storedCaipNetwork = allRequestedCaipNetworks?.find(c => c.id === storedCaipNetworkId)

    return storedCaipNetwork
  }
}
