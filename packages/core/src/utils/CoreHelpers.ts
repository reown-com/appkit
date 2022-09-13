export const CoreHelpers = {
  isCoinbaseExtension() {
    return window.coinbaseWalletExtension
  },

  isMobile() {
    return Boolean(
      (window.matchMedia('(pointer:coarse)').matches || navigator.userAgent.match(/Android/u)) ??
        navigator.userAgent.match(/iPhone/u) ??
        false
    )
  },

  formatDeepLinkUrl(appUrl: string, encodedWcUrl: string) {
    appUrl.replace('/', '').replace(':', '')

    return `${appUrl}://wc?uri=${encodedWcUrl}`
  },

  async wait(miliseconds: number) {
    return new Promise(resolve => {
      setTimeout(resolve, miliseconds)
    })
  }
}
