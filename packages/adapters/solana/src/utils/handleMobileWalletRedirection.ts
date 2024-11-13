export function handleMobileWalletRedirection(properties: {
  name: string
  platform: string
}): void {
  if (properties?.name === 'Phantom' && !('phantom' in window)) {
    const href = window.location.href
    const protocol = href.startsWith('https') ? 'https' : 'http'
    const host = href.split('/')[2]
    const ref = `${protocol}://${host}`
    window.location.href = `https://phantom.app/ul/browse/${href}?ref=${ref}`
  }

  if (properties?.name === 'Coinbase Wallet' && !('coinbaseSolana' in window)) {
    const href = window.location.href
    window.location.href = `https://go.cb-w.com/dapp?cb_url=${href}`
  }
}
