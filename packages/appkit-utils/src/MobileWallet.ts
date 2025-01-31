export const MobileWalletUtil = {
  /**
   * Handles mobile wallet redirection for wallets that have Universal Links.
   *
   * @param {Object} properties - The properties object.
   * @param {string} properties.name - The name of the wallet.
   */
  handleMobileWalletRedirection(properties: { name: string }): void {
    const href = window.location.href
    const encodedHref = encodeURIComponent(href)

    if (properties?.name === 'Phantom' && !('phantom' in window)) {
      const protocol = href.startsWith('https') ? 'https' : 'http'
      const host = href.split('/')[2]
      const encodedRef = encodeURIComponent(`${protocol}://${host}`)

      window.location.href = `https://phantom.app/ul/browse/${encodedHref}?ref=${encodedRef}`
    }

    if (properties?.name === 'Coinbase Wallet' && !('coinbaseSolana' in window)) {
      window.location.href = `https://go.cb-w.com/dapp?cb_url=${encodedHref}`
    }
  }
}
