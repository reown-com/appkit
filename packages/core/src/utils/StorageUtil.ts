/* eslint-disable no-console */
import { SafeLocalStorage, SafeLocalStorageKeys } from '@reown/appkit-common'
import type { WcWallet, ConnectorType, SocialProvider } from './TypeUtil.js'

// -- Utility -----------------------------------------------------------------
export const StorageUtil = {
  setWalletConnectDeepLink({ href, name }: { href: string; name: string }) {
    try {
      SafeLocalStorage.setItem(SafeLocalStorageKeys.DEEPLINK_CHOICE, JSON.stringify({ href, name }))
    } catch {
      console.info('Unable to set WalletConnect deep link')
    }
  },

  getWalletConnectDeepLink() {
    const deepLink = SafeLocalStorage.getItem(SafeLocalStorageKeys.DEEPLINK_CHOICE)
    if (deepLink) {
      return JSON.parse(deepLink)
    }

    return undefined
  },

  deleteWalletConnectDeepLink() {
    SafeLocalStorage.removeItem(SafeLocalStorageKeys.DEEPLINK_CHOICE)
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
    const recentWallets = SafeLocalStorage.getItem(SafeLocalStorageKeys.RECENT_WALLETS)
    return (recentWallets as unknown as WcWallet[]) || []
  },

  setConnectedConnector(connectorType: ConnectorType) {
    SafeLocalStorage.setItem(SafeLocalStorageKeys.CONNECTED_CONNECTOR, connectorType)
  },

  getConnectedConnector() {
    return SafeLocalStorage.getItem(SafeLocalStorageKeys.CONNECTED_CONNECTOR) as ConnectorType
  },

  setConnectedSocialProvider(socialProvider: SocialProvider) {
    SafeLocalStorage.setItem(SafeLocalStorageKeys.CONNECTED_SOCIAL, socialProvider)
  },

  getConnectedSocialProvider() {
    return SafeLocalStorage.getItem(SafeLocalStorageKeys.CONNECTED_SOCIAL) as SocialProvider
  },

  setConnectedSocialUsername(username: string) {
    SafeLocalStorage.setItem(SafeLocalStorageKeys.CONNECTED_SOCIAL_USERNAME, username)
  },

  getConnectedSocialUsername() {
    return SafeLocalStorage.getItem(SafeLocalStorageKeys.CONNECTED_SOCIAL_USERNAME) as string
  }
}
