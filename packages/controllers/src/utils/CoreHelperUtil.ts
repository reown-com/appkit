import type {
  AdapterType,
  Address,
  Balance,
  ChainNamespace,
  ParsedCaipAddress,
  SdkVersion
} from '@reown/appkit-common'
import { ConstantsUtil as CommonConstants } from '@reown/appkit-common'
import type { CaipAddress, CaipNetwork } from '@reown/appkit-common'

import { ConstantsUtil } from './ConstantsUtil.js'
import { StorageUtil } from './StorageUtil.js'
import type { AccountTypeMap, ChainAdapter, LinkingRecord, NamespaceTypeMap } from './TypeUtil.js'

type SDKFramework = 'html' | 'react' | 'vue' | 'cdn' | 'unity'
export type OpenTarget = '_blank' | '_self' | 'popupWindow' | '_top'

export const CoreHelperUtil = {
  getWindow(): Window | undefined {
    if (typeof window === 'undefined') {
      return undefined
    }

    return window
  },

  isMobile() {
    if (this.isClient()) {
      return Boolean(
        (window?.matchMedia &&
          typeof window.matchMedia === 'function' &&
          window.matchMedia('(pointer:coarse)')?.matches) ||
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|Opera Mini/u.test(navigator.userAgent)
      )
    }

    return false
  },

  checkCaipNetwork(network: CaipNetwork | undefined, networkName = '') {
    return network?.caipNetworkId.toLocaleLowerCase().includes(networkName.toLowerCase())
  },

  isAndroid() {
    if (!this.isMobile()) {
      return false
    }

    const ua = window?.navigator.userAgent.toLowerCase()

    return CoreHelperUtil.isMobile() && ua.includes('android')
  },

  isIos() {
    if (!this.isMobile()) {
      return false
    }

    const ua = window?.navigator.userAgent.toLowerCase()

    return ua.includes('iphone') || ua.includes('ipad')
  },

  isSafari() {
    if (!this.isClient()) {
      return false
    }

    const ua = window?.navigator.userAgent.toLowerCase()

    return ua.includes('safari')
  },

  isClient() {
    return typeof window !== 'undefined'
  },

  isPairingExpired(expiry?: number) {
    return expiry ? expiry - Date.now() <= ConstantsUtil.TEN_SEC_MS : true
  },

  isAllowedRetry(lastRetry: number, differenceMs = ConstantsUtil.ONE_SEC_MS) {
    return Date.now() - lastRetry >= differenceMs
  },

  copyToClopboard(text: string) {
    navigator.clipboard.writeText(text)
  },

  isIframe() {
    try {
      return window?.self !== window?.top
    } catch (e) {
      return false
    }
  },

  isSafeApp() {
    if (CoreHelperUtil.isClient() && window.self !== window.top) {
      try {
        const ancestor = window?.location?.ancestorOrigins?.[0]

        const safeAppUrl = 'https://app.safe.global'
        if (ancestor) {
          const ancestorUrl = new URL(ancestor)
          const safeUrl = new URL(safeAppUrl)

          return ancestorUrl.hostname === safeUrl.hostname
        }
      } catch {
        return false
      }
    }

    return false
  },

  getPairingExpiry() {
    return Date.now() + ConstantsUtil.FOUR_MINUTES_MS
  },

  getNetworkId(caipAddress: CaipAddress | undefined) {
    return caipAddress?.split(':')[1]
  },

  getPlainAddress(caipAddress: CaipAddress | undefined) {
    return caipAddress?.split(':')[2] as Address | undefined
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

  formatNativeUrl(
    appUrl: string,
    wcUri: string,
    universalLink: string | null = null
  ): LinkingRecord {
    if (CoreHelperUtil.isHttpUrl(appUrl)) {
      return this.formatUniversalUrl(appUrl, wcUri)
    }

    let safeAppUrl = appUrl
    let safeUniversalLink = universalLink

    if (!safeAppUrl.includes('://')) {
      safeAppUrl = appUrl.replaceAll('/', '').replaceAll(':', '')
      safeAppUrl = `${safeAppUrl}://`
    }

    if (!safeAppUrl.endsWith('/')) {
      safeAppUrl = `${safeAppUrl}/`
    }

    if (safeUniversalLink && !safeUniversalLink?.endsWith('/')) {
      safeUniversalLink = `${safeUniversalLink}/`
    }

    // Android deeplinks in tg context require the uri to be encoded twice
    if (this.isTelegram() && this.isAndroid()) {
      // eslint-disable-next-line no-param-reassign
      wcUri = encodeURIComponent(wcUri)
    }
    const encodedWcUrl = encodeURIComponent(wcUri)

    return {
      redirect: `${safeAppUrl}wc?uri=${encodedWcUrl}`,
      redirectUniversalLink: safeUniversalLink
        ? `${safeUniversalLink}wc?uri=${encodedWcUrl}`
        : undefined,
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
  getOpenTargetForPlatform(target: OpenTarget) {
    if (target === 'popupWindow') {
      return target
    }
    // Only '_blank' deeplinks work in Telegram context
    if (this.isTelegram()) {
      // But for social login, we need to load the page in the same context
      if (StorageUtil.getTelegramSocialProvider()) {
        return '_top'
      }

      return '_blank'
    }

    return target
  },
  openHref(href: string, target: OpenTarget, features?: string) {
    window?.open(href, this.getOpenTargetForPlatform(target), features || 'noreferrer noopener')
  },

  returnOpenHref(href: string, target: OpenTarget, features?: string) {
    return window?.open(
      href,
      this.getOpenTargetForPlatform(target),
      features || 'noreferrer noopener'
    )
  },

  isTelegram() {
    return (
      typeof window !== 'undefined' &&
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Boolean((window as any).TelegramWebviewProxy) ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Boolean((window as any).Telegram) ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Boolean((window as any).TelegramWebviewProxyProto))
    )
  },

  isPWA() {
    if (typeof window === 'undefined') {
      return false
    }

    const isStandaloneDisplayMode =
      window?.matchMedia && typeof window.matchMedia === 'function'
        ? window.matchMedia('(display-mode: standalone)')?.matches
        : false
    const isIOSStandalone = (window?.navigator as unknown as { standalone: boolean })?.standalone

    return Boolean(isStandaloneDisplayMode || isIOSStandalone)
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

  parseBalance(balance: string | undefined, symbol: string | undefined) {
    let formattedBalance = '0.000'

    if (typeof balance === 'string') {
      const number = Number(balance)
      if (!isNaN(number)) {
        const formattedValue = (Math.floor(number * 1000) / 1000).toFixed(3)
        if (formattedValue) {
          formattedBalance = formattedValue
        }
      }
    }
    const [valueString, decimalsString] = formattedBalance.split('.')

    const value = valueString || '0'
    const decimals = decimalsString || '000'

    const formattedText = `${value}.${decimals}${symbol ? ` ${symbol}` : ''}`

    return {
      formattedText,
      value,
      decimals,
      symbol
    }
  },

  getApiUrl() {
    return CommonConstants.W3M_API_URL
  },

  getBlockchainApiUrl() {
    return CommonConstants.BLOCKCHAIN_API_RPC_URL
  },

  getAnalyticsUrl() {
    return CommonConstants.PULSE_API_URL
  },

  getUUID() {
    if (crypto?.randomUUID) {
      return crypto.randomUUID()
    }

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/gu, c => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8

      return v.toString(16)
    })
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parseError(error: any): string {
    if (typeof error === 'string') {
      return error
    } else if (typeof error?.issues?.[0]?.message === 'string') {
      return error.issues[0].message
    } else if (error instanceof Error) {
      return error.message
    }

    return 'Unknown error'
  },

  sortRequestedNetworks(
    approvedIds: `${string}:${string}`[] | undefined,
    requestedNetworks: CaipNetwork[] = []
  ): CaipNetwork[] {
    const approvedIndexMap: Record<string, number> = {}

    if (requestedNetworks && approvedIds) {
      approvedIds.forEach((id, index) => {
        approvedIndexMap[id] = index
      })

      requestedNetworks.sort((a, b) => {
        const indexA = approvedIndexMap[a.id]
        const indexB = approvedIndexMap[b.id]

        if (indexA !== undefined && indexB !== undefined) {
          return indexA - indexB
        } else if (indexA !== undefined) {
          return -1
        } else if (indexB !== undefined) {
          return 1
        }

        return 0
      })
    }

    return requestedNetworks
  },

  calculateBalance(array: Balance[]) {
    let sum = 0
    for (const item of array) {
      sum += item.value ?? 0
    }

    return sum
  },

  formatTokenBalance(number: number) {
    const roundedNumber = number.toFixed(2)
    const [dollars, pennies] = roundedNumber.split('.')

    return { dollars, pennies }
  },

  isAddress(address: string, chain: ChainNamespace = 'eip155'): boolean {
    switch (chain) {
      case 'eip155':
        if (!/^(?:0x)?[0-9a-f]{40}$/iu.test(address)) {
          return false
        } else if (
          /^(?:0x)?[0-9a-f]{40}$/iu.test(address) ||
          /^(?:0x)?[0-9A-F]{40}$/iu.test(address)
        ) {
          return true
        }

        return false
      case 'solana':
        return /[1-9A-HJ-NP-Za-km-z]{32,44}$/iu.test(address)

      case 'bip122': {
        const isP2PKH = /^[1][a-km-zA-HJ-NP-Z1-9]{25,34}$/u.test(address)
        const isP2SH = /^[3][a-km-zA-HJ-NP-Z1-9]{25,34}$/u.test(address)
        const isBech32 = /^bc1[a-z0-9]{39,87}$/u.test(address)
        const isBech32m = /^bc1p[a-z0-9]{58}$/u.test(address)

        return isP2PKH || isP2SH || isBech32 || isBech32m
      }
      default:
        return false
    }
  },

  uniqueBy<T>(arr: T[], key: keyof T) {
    const set = new Set()

    return arr.filter(item => {
      const keyValue = item[key]
      if (set.has(keyValue)) {
        return false
      }
      set.add(keyValue)

      return true
    })
  },

  generateSdkVersion(
    adapters: ChainAdapter[],
    platform: SDKFramework,
    version: string
  ): SdkVersion {
    const hasNoAdapters = adapters.length === 0
    const adapterNames = (
      hasNoAdapters
        ? ConstantsUtil.ADAPTER_TYPES.UNIVERSAL
        : adapters.map(adapter => adapter.adapterType).join(',')
    ) as AdapterType

    return `${platform}-${adapterNames}-${version}`
  },

  // eslint-disable-next-line max-params
  createAccount<N extends ChainNamespace>(
    namespace: N,
    address: string,
    type: NamespaceTypeMap[N],
    publicKey?: string,
    path?: string
  ): AccountTypeMap[N] {
    return {
      namespace,
      address,
      type,
      publicKey,
      path
    } as AccountTypeMap[N]
  },

  isCaipAddress(address?: unknown): address is CaipAddress {
    if (typeof address !== 'string') {
      return false
    }

    const sections = address.split(':')
    const namespace = sections[0]

    return (
      sections.filter(Boolean).length === 3 &&
      (namespace as string) in CommonConstants.CHAIN_NAME_MAP
    )
  },
  getAccount(account?: ParsedCaipAddress | string) {
    if (!account) {
      return {
        address: undefined,
        chainId: undefined
      }
    }

    if (typeof account === 'string') {
      return {
        address: account,
        chainId: undefined
      }
    }

    return {
      address: account.address,
      chainId: account.chainId
    }
  },
  isMac() {
    const ua = window?.navigator.userAgent.toLowerCase()

    return ua.includes('macintosh') && !ua.includes('safari')
  },

  formatTelegramSocialLoginUrl(url: string) {
    const valueToInject = `--${encodeURIComponent(window?.location.href)}`
    const paramToInject = 'state='
    const parsedUrl = new URL(url)
    if (parsedUrl.host === 'auth.magic.link') {
      const providerParam = 'provider_authorization_url='
      const providerUrl = url.substring(url.indexOf(providerParam) + providerParam.length)
      const resultUrl = this.injectIntoUrl(
        decodeURIComponent(providerUrl),
        paramToInject,
        valueToInject
      )

      return url.replace(providerUrl, encodeURIComponent(resultUrl))
    }

    return this.injectIntoUrl(url, paramToInject, valueToInject)
  },
  injectIntoUrl(url: string, key: string, appendString: string) {
    // Find the position of "key" e.g. "state=" in the URL
    const keyIndex = url.indexOf(key)

    if (keyIndex === -1) {
      throw new Error(`${key} parameter not found in the URL: ${url}`)
    }

    // Find the position of the next "&" after "key"
    const keyEndIndex = url.indexOf('&', keyIndex)
    const keyLength = key.length
    // If there is no "&" after key, it means "key" is the last parameter
    // eslint-disable-next-line no-negated-condition
    const keyParamEnd = keyEndIndex !== -1 ? keyEndIndex : url.length
    // Extract the part of the URL before the key value
    const beforeKeyValue = url.substring(0, keyIndex + keyLength)
    // Extract the current key value
    const currentKeyValue = url.substring(keyIndex + keyLength, keyParamEnd)
    // Extract the part of the URL after the key value
    const afterKeyValue = url.substring(keyEndIndex)
    // Append the new string to the key value
    const newKeyValue = currentKeyValue + appendString
    // Reconstruct the URL with the appended key value
    const newUrl = beforeKeyValue + newKeyValue + afterKeyValue

    return newUrl
  },
  isNumber(value: unknown): boolean {
    if (typeof value !== 'number' && typeof value !== 'string') {
      return false
    }

    return !isNaN(Number(value))
  }
}
