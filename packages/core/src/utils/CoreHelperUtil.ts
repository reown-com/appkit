import { ConstantsUtil } from './ConstantsUtil.js'
import type { CaipAddress, LinkingRecord } from './TypeUtils.js'

export const CoreHelperUtil = {
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
    const ua = navigator.userAgent.toLowerCase()

    return CoreHelperUtil.isMobile() && ua.includes('android')
  },

  isIos() {
    const ua = navigator.userAgent.toLowerCase()

    return CoreHelperUtil.isMobile() && (ua.includes('iphone') || ua.includes('ipad'))
  },

  isClient() {
    return typeof window !== 'undefined'
  },

  isPairingExpired(expiry?: number) {
    return expiry ? expiry - Date.now() <= ConstantsUtil.TEN_SEC_MS : true
  },

  isAllowedRetry(lastRetry: number) {
    return Date.now() - lastRetry >= ConstantsUtil.ONE_SEC_MS
  },

  copyToClopboard(text: string) {
    navigator.clipboard.writeText(text)
  },

  getPairingExpiry() {
    return Date.now() + ConstantsUtil.FOUR_MINUTES_MS
  },

  getPlainAddress(caipAddress: CaipAddress) {
    return caipAddress.split(':')[2]
  },

  async wait(milliseconds: number) {
    return new Promise(resolve => {
      setTimeout(resolve, milliseconds)
    })
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debounce(func: (...args: any[]) => unknown, timeout = 500) {
    let timer: ReturnType<typeof setTimeout> | undefined = undefined

    return (...args: unknown[]) => {
      function next() {
        func(...args)
      }
      if (timer) {
        clearTimeout(timer)
      }
      timer = setTimeout(next, timeout)
    }
  },

  isHttpUrl(url: string) {
    return url.startsWith('http://') || url.startsWith('https://')
  },

  formatNativeUrl(appUrl: string, wcUri: string): LinkingRecord {
    if (CoreHelperUtil.isHttpUrl(appUrl)) {
      return this.formatUniversalUrl(appUrl, wcUri)
    }
    let safeAppUrl = appUrl
    if (!safeAppUrl.includes('://')) {
      safeAppUrl = appUrl.replaceAll('/', '').replaceAll(':', '')
      safeAppUrl = `${safeAppUrl}://`
    }
    if (!safeAppUrl.endsWith('/')) {
      safeAppUrl = `${safeAppUrl}/`
    }
    const encodedWcUrl = encodeURIComponent(wcUri)

    return {
      redirect: `${safeAppUrl}wc?uri=${encodedWcUrl}`,
      href: safeAppUrl
    }
  },

  formatUniversalUrl(appUrl: string, wcUri: string): LinkingRecord {
    if (!CoreHelperUtil.isHttpUrl(appUrl)) {
      return this.formatNativeUrl(appUrl, wcUri)
    }
    let safeAppUrl = appUrl
    if (!safeAppUrl.endsWith('/')) {
      safeAppUrl = `${safeAppUrl}/`
    }
    const encodedWcUrl = encodeURIComponent(wcUri)

    return {
      redirect: `${safeAppUrl}wc?uri=${encodedWcUrl}`,
      href: safeAppUrl
    }
  },

  openHref(href: string, target: '_blank' | '_self') {
    window.open(href, target, 'noreferrer noopener')
  },

  async preloadImage(src: string) {
    const imagePromise = new Promise((resolve, reject) => {
      const image = new Image()
      image.onload = resolve
      image.onerror = reject
      image.crossOrigin = 'anonymous'
      image.src = src
    })

    return Promise.race([imagePromise, CoreHelperUtil.wait(2000)])
  },

  formatBalance(balance: string | undefined, symbol: string | undefined) {
    let formattedBalance = undefined

    if (balance === '0.0') {
      formattedBalance = '0'
    } else if (typeof balance === 'string' && balance.length > 6) {
      formattedBalance = balance.substring(0, 6)
    } else if (typeof balance === 'string') {
      formattedBalance = balance
    }

    return formattedBalance ? `${formattedBalance} ${symbol}` : '0.0000'
  }
}
