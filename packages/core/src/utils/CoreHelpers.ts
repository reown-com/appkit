export const CoreHelpers = {
  isCoinbaseExtension() {
    return window.coinbaseWalletExtension
  },

  isMobile() {
    return (
      (window.matchMedia('(pointer:coarse)').matches || navigator.userAgent.match(/Android/u)) ??
      navigator.userAgent.match(/iPhone/u) ??
      false
    )
  },

  async wait(miliseconds: number) {
    return new Promise(resolve => {
      setTimeout(resolve, miliseconds)
    })
  }
}
