import { ConstantsUtil } from '@reown/appkit-common'
import {
  ChainController,
  ConnectorController,
  RouterController,
  type WcWallet
} from '@reown/appkit-core'

export const MobileWalletUtil = {
  /**
   * Handles mobile wallet redirection for wallets that have Universal Links.
   *
   * @param {Object} properties - The properties object.
   * @param {string} properties.name - The name of the wallet.
   */
  handleMobileWalletRedirection(wallet: WcWallet): void {
    const connector = ConnectorController.getConnector(wallet.id, wallet.rdns)

    if (ChainController.state.activeChain === ConstantsUtil.CHAIN.SOLANA) {
      /**
       * Universal Links requires explicit user interaction to open the wallet app.
       * Previously we've been calling this with the life-cycle methods in the Solana clients by listening the SELECT_WALLET event of EventController.
       * But this breaks the UL functionality for some wallets like Phantom.
       */
      const href = window.location.href
      const encodedHref = encodeURIComponent(href)
      const name = connector?.name || wallet?.name || ''
      if (name === 'Phantom' && !('phantom' in window)) {
        const protocol = href.startsWith('https') ? 'https' : 'http'
        const host = href.split('/')[2]
        const encodedRef = encodeURIComponent(`${protocol}://${host}`)

        window.location.href = `https://phantom.app/ul/browse/${encodedHref}?ref=${encodedRef}`
      }

      if (name === 'Coinbase Wallet' && !('coinbaseSolana' in window)) {
        window.location.href = `https://go.cb-w.com/dapp?cb_url=${encodedHref}`
      }
    }

    if (connector) {
      RouterController.push('ConnectingExternal', { connector })
    } else {
      RouterController.push('ConnectingWalletConnect', { wallet })
    }
  }
}
