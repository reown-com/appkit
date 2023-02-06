export const CoreUtil = {
  WALLETCONNECT_DEEPLINK_CHOICE: 'WALLETCONNECT_DEEPLINK_CHOICE',

  isMobile() {
    if (typeof window !== 'undefined') {
      return Boolean(
        window.matchMedia('(pointer:coarse)').matches ||
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|Opera Mini/u.test(navigator.userAgent)
      )
    }

    return false
  },

  isAndroid() {
    return CoreUtil.isMobile() && navigator.userAgent.toLowerCase().includes('android')
  },

  isEmptyObject(value: unknown) {
    return (
      Object.getPrototypeOf(value) === Object.prototype &&
      Object.getOwnPropertyNames(value).length === 0 &&
      Object.getOwnPropertySymbols(value).length === 0
    )
  },

  isHttpUrl(url: string) {
    return url.startsWith('http://') || url.startsWith('https://')
  },

  formatNativeUrl(appUrl: string, wcUri: string, name: string): string {
    if (CoreUtil.isHttpUrl(appUrl)) {
      return this.formatUniversalUrl(appUrl, wcUri, name)
    }
    let safeAppUrl = appUrl
    if (!safeAppUrl.includes('://')) {
      safeAppUrl = appUrl.replaceAll('/', '').replaceAll(':', '')
      safeAppUrl = `${safeAppUrl}://`
    }
    this.setWalletConnectDeepLink(safeAppUrl, name)
    const encodedWcUrl = encodeURIComponent(wcUri)

    return `${safeAppUrl}wc?uri=${encodedWcUrl}`
  },

  formatUniversalUrl(appUrl: string, wcUri: string, name: string): string {
    if (!CoreUtil.isHttpUrl(appUrl)) {
      return this.formatNativeUrl(appUrl, wcUri, name)
    }
    let plainAppUrl = appUrl
    if (appUrl.endsWith('/')) {
      plainAppUrl = appUrl.slice(0, -1)
    }
    this.setWalletConnectDeepLink(plainAppUrl, name)
    const encodedWcUrl = encodeURIComponent(wcUri)

    return `${plainAppUrl}/wc?uri=${encodedWcUrl}`
  },

  async wait(miliseconds: number) {
    return new Promise(resolve => {
      setTimeout(resolve, miliseconds)
    })
  },

  openHref(href: string, target?: '_blank') {
    if (target) {
      window.open(href, target, 'noreferrer noopener')
    } else {
      window.open(href)
    }
  },

  setWalletConnectDeepLink(href: string, name: string) {
    localStorage.setItem(CoreUtil.WALLETCONNECT_DEEPLINK_CHOICE, JSON.stringify({ href, name }))
  },

  setWalletConnectAndroidDeepLink(wcUri: string) {
    const [href] = wcUri.split('?')

    localStorage.setItem(
      CoreUtil.WALLETCONNECT_DEEPLINK_CHOICE,
      JSON.stringify({ href, name: 'Android' })
    )
  },

  removeWalletConnectDeepLink() {
    localStorage.removeItem(CoreUtil.WALLETCONNECT_DEEPLINK_CHOICE)
  },

  isNull<T>(value: T | null): value is null {
    return value === null
  }
}
