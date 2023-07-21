/* eslint-disable no-console */

// -- Helpers -----------------------------------------------------------------
const WC_DEEPLINK = 'WALLETCONNECT_DEEPLINK_CHOICE'

// -- Utility -----------------------------------------------------------------
export const StorageUtil = {
  setWalletConnectDeepLink({ href, name }: { href: string; name: string }) {
    try {
      localStorage.setItem(WC_DEEPLINK, JSON.stringify({ href, name }))
    } catch {
      console.info('Unable to set WalletConnect deep link')
    }
  },

  getWalletConnectDeepLink() {
    try {
      const deepLink = localStorage.getItem(WC_DEEPLINK)
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
      localStorage.removeItem(WC_DEEPLINK)
    } catch {
      console.info('Unable to delete WalletConnect deep link')
    }
  }
}
