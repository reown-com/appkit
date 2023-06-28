import { RouterCtrl } from '../controllers/RouterCtrl'

export const CoreUtil = {
  WALLETCONNECT_DEEPLINK_CHOICE: 'WALLETCONNECT_DEEPLINK_CHOICE',

  W3M_VERSION: 'W3M_VERSION',

  W3M_PREFER_INJECTED_URL_FLAG: 'w3mPreferInjected',

  RECOMMENDED_WALLET_AMOUNT: 9,

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

  isIos() {
    const ua = navigator.userAgent.toLowerCase()

    return CoreUtil.isMobile() && (ua.includes('iphone') || ua.includes('ipad'))
  },

  isHttpUrl(url: string) {
    return url.startsWith('http://') || url.startsWith('https://')
  },

  isArray<T>(data?: T | T[]): data is T[] {
    return Array.isArray(data) && data.length > 0
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
    if (!safeAppUrl.endsWith('/')) {
      safeAppUrl = `${safeAppUrl}/`
    }
    this.setWalletConnectDeepLink(safeAppUrl, name)
    const encodedWcUrl = encodeURIComponent(wcUri)

    return `${safeAppUrl}wc?uri=${encodedWcUrl}`
  },

  formatUniversalUrl(appUrl: string, wcUri: string, name: string): string {
    if (!CoreUtil.isHttpUrl(appUrl)) {
      return this.formatNativeUrl(appUrl, wcUri, name)
    }
    let safeAppUrl = appUrl
    if (!safeAppUrl.endsWith('/')) {
      safeAppUrl = `${safeAppUrl}/`
    }
    this.setWalletConnectDeepLink(safeAppUrl, name)
    const encodedWcUrl = encodeURIComponent(wcUri)

    return `${safeAppUrl}wc?uri=${encodedWcUrl}`
  },

  async wait(miliseconds: number) {
    return new Promise(resolve => {
      setTimeout(resolve, miliseconds)
    })
  },

  openHref(href: string, target: '_blank' | '_self') {
    window.open(href, target, 'noreferrer noopener')
  },

  setWalletConnectDeepLink(href: string, name: string) {
    try {
      localStorage.setItem(CoreUtil.WALLETCONNECT_DEEPLINK_CHOICE, JSON.stringify({ href, name }))
    } catch {
      console.info('Unable to set WalletConnect deep link')
    }
  },

  setWalletConnectAndroidDeepLink(wcUri: string) {
    try {
      const [href] = wcUri.split('?')
      localStorage.setItem(
        CoreUtil.WALLETCONNECT_DEEPLINK_CHOICE,
        JSON.stringify({ href, name: 'Android' })
      )
    } catch {
      console.info('Unable to set WalletConnect android deep link')
    }
  },

  removeWalletConnectDeepLink() {
    try {
      localStorage.removeItem(CoreUtil.WALLETCONNECT_DEEPLINK_CHOICE)
    } catch {
      console.info('Unable to remove WalletConnect deep link')
    }
  },

  setWeb3ModalVersionInStorage() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(CoreUtil.W3M_VERSION, process.env.ROLLUP_W3M_VERSION ?? 'UNKNOWN')
      }
    } catch {
      console.info('Unable to set Web3Modal version in storage')
    }
  },

  getWalletRouterData() {
    const routerData = RouterCtrl.state.data?.Wallet
    if (!routerData) {
      throw new Error('Missing "Wallet" view data')
    }

    return routerData
  },

  getSwitchNetworkRouterData() {
    const routerData = RouterCtrl.state.data?.SwitchNetwork
    if (!routerData) {
      throw new Error('Missing "SwitchNetwork" view data')
    }

    return routerData
  },

  isPreferInjectedFlag() {
    if (typeof location !== 'undefined') {
      const queryParams = new URLSearchParams(location.search)

      return queryParams.has(CoreUtil.W3M_PREFER_INJECTED_URL_FLAG)
    }

    return false
  }
}
