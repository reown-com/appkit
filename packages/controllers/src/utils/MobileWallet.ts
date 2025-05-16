import { ConstantsUtil } from '@reown/appkit-common'

import { ChainController } from '../controllers/ChainController.js'

export const MobileWalletUtil = {
  /**
   * Handles mobile wallet redirection for wallets that have Universal Links and doesn't support WalletConnect Deep Links.
   *
   * @param {Object} properties - The properties object.
   * @param {string} properties.name - The name of the wallet.
   */
  handleMobileDeeplinkRedirect(name: string): void {
    /**
     * Universal Links requires explicit user interaction to open the wallet app.
     * Previously we've been calling this with the life-cycle methods in the Solana clients by listening the SELECT_WALLET event of EventController.
     * But this breaks the UL functionality for some wallets like Phantom.
     */
    const href = window.location.href
    const encodedHref = encodeURIComponent(href)

    if (name === 'Phantom' && !('phantom' in window)) {
      const protocol = href.startsWith('https') ? 'https' : 'http'
      const host = href.split('/')[2]
      const encodedRef = encodeURIComponent(`${protocol}://${host}`)

      window.location.href = `https://phantom.app/ul/browse/${encodedHref}?ref=${encodedRef}`
    }

    if (ChainController.state.activeChain === ConstantsUtil.CHAIN.SOLANA) {
      if (name === 'Coinbase Wallet' && !('coinbaseSolana' in window)) {
        window.location.href = `https://go.cb-w.com/dapp?cb_url=${encodedHref}`
      }
    }
  }
}
