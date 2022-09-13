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

  formatNativeUrl(appUrl: string, encodedWcUrl: string) {
    appUrl.replace('/', '').replace(':', '')

    return `${appUrl}://wc?uri=${encodedWcUrl}`
  },

  formatUniversalUrl(appUrl: string, encodedWcUrl: string) {
    return `${appUrl}/wc?uri=${encodedWcUrl}`
  },

  async wait(miliseconds: number) {
    return new Promise(resolve => {
      setTimeout(resolve, miliseconds)
    })
  }
}
