import { type ChainNamespace, ConstantsUtil } from '@reown/appkit-common'

/*
 * Exclude wallets that do not support relay connections but have custom deeplink mechanisms
 * Excludes:
 * - Phantom
 * - Coinbase
 */
export const CUSTOM_DEEPLINK_WALLETS = {
  PHANTOM: 'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393',
  SOLFLARE: '1ca0bdd4747578705b1939af023d120677c64fe6ca76add81fda36e350605e79',
  COINBASE: 'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa'
}

export const MobileWalletUtil = {
  /**
   * Handles mobile wallet redirection for wallets that have Universal Links and doesn't support WalletConnect Deep Links.
   *
   * @param {Object} properties - The properties object.
   * @param {string} properties.name - The name of the wallet.
   */
  handleMobileDeeplinkRedirect(name: string, namespace: ChainNamespace): void {
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

    if (name === 'Solflare' && !('solflare' in window)) {
      window.location.href = `https://solflare.com/ul/v1/browse/${encodedHref}?ref=${encodedHref}`
    }

    if (namespace === ConstantsUtil.CHAIN.SOLANA) {
      if (name === 'Coinbase Wallet' && !('coinbaseSolana' in window)) {
        window.location.href = `https://go.cb-w.com/dapp?cb_url=${encodedHref}`
      }
    }
  }
}
