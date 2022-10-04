import { WALLETCONNECT_DEEPLINK_CHOICE } from './CoreConstants'

export const CoreHelpers = {
  isCoinbaseExtension() {
    return window.coinbaseWalletExtension
  },

  isMobile() {
    return Boolean(
      window.matchMedia('(pointer:coarse)').matches ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|Opera Mini/u.test(navigator.userAgent)
    )
  },

  isEmptyObject(value: unknown) {
    return (
      Object.getPrototypeOf(value) === Object.prototype &&
      Object.getOwnPropertyNames(value).length === 0 &&
      Object.getOwnPropertySymbols(value).length === 0
    )
  },

  formatNativeUrl(appUrl: string, encodedWcUrl: string, name: string) {
    const plainAppUrl = appUrl.replaceAll('/', '').replaceAll(':', '')
    this.setWalletConnectDeepLink(plainAppUrl, name)

    return `${plainAppUrl}://wc?uri=${encodedWcUrl}`
  },

  formatUniversalUrl(appUrl: string, encodedWcUrl: string, name: string) {
    let plainAppUrl = appUrl
    if (appUrl.endsWith('/')) plainAppUrl = appUrl.slice(0, -1)
    this.setWalletConnectDeepLink(plainAppUrl, name)

    return `${plainAppUrl}/wc?uri=${encodedWcUrl}`
  },

  async wait(miliseconds: number) {
    return new Promise(resolve => {
      setTimeout(resolve, miliseconds)
    })
  },

  openHref(href: string, target = '_self') {
    window.open(href, target, 'noreferrer noopener')
  },

  setWalletConnectDeepLink(href: string, name: string) {
    localStorage.setItem(WALLETCONNECT_DEEPLINK_CHOICE, JSON.stringify({ href, name }))
  },

  removeWalletConnectDeepLink() {
    localStorage.removeItem(WALLETCONNECT_DEEPLINK_CHOICE)
  }
}
