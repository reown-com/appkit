/* eslint-disable no-console */
import type { WcWallet } from './TypeUtils.js'

// -- Helpers -----------------------------------------------------------------
const WC_DEEPLINK = 'WALLETCONNECT_DEEPLINK_CHOICE'
const W3M_RECENT = '@w3m/recent'

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
  },

  setWeb3ModalRecent(wallet: WcWallet) {
    try {
      const recentWallets = StorageUtil.getRecentWallets()
      const exists = recentWallets.find(w => w.id === wallet.id)
      if (!exists) {
        recentWallets.unshift(wallet)
        if (recentWallets.length > 2) {
          recentWallets.pop()
        }
        localStorage.setItem(W3M_RECENT, JSON.stringify(recentWallets))
      }
    } catch {
      console.info('Unable to set Web3Modal recent')
    }
  },

  getRecentWallets(): WcWallet[] {
    try {
      const recent = localStorage.getItem(W3M_RECENT)

      return recent ? JSON.parse(recent) : []
    } catch {
      console.info('Unable to get Web3Modal recent')
    }

    return []
  }
}
