import {
  BlockchainApiController,
  CoreHelperUtil,
  OptionsController
} from '@reown/appkit-controllers'
import type {
  TonWalletInfo,
  TonWalletInfoDTO,
  TonWalletInfoInjectable
} from '@reown/appkit-utils/ton'

import type {
  InjectedWalletApi,
  TonConnectEvent,
  TonConnectResponse,
  TonWalletFeature
} from './TonConnectTypeUtils.js'

const TONCONNECT_WALLETS_LIST_URL = 'https://api.reown.com/ton/v1/wallets'
const TONCONNECT_MANIFEST_URL = 'https://api.reown.com/ton/v1/manifest'

export function getTonConnectManifestUrl(): string {
  const { metadata, projectId } = OptionsController.state
  const { st, sv } = BlockchainApiController.getSdkProperties()

  const appUrl = metadata?.url || (typeof window === 'undefined' ? '' : window.location.origin)
  const name = metadata?.name || ''
  const iconUrl = metadata?.icons?.[0] || ''

  const u = new URL(TONCONNECT_MANIFEST_URL)
  u.searchParams.set('projectId', projectId)
  u.searchParams.set('st', st)
  u.searchParams.set('sv', sv)
  u.searchParams.set('url', appUrl)
  u.searchParams.set('name', name)
  u.searchParams.set('iconUrl', iconUrl)

  return u.toString()
}

// -- Internal cache ------------------------------------------------------------ //
let cachePromise: Promise<TonWalletInfoDTO[]> | null = null
let cacheCreatedAt: number | null = null

// -- TonConnect SDK Utils -------------------------------- //
/**
 * Connect method implementation for injected wallets derived from TonConnect SDK.
 * @param jsBridgeKey
 * @param tonProof
 * @returns
 */
export async function connectInjected(jsBridgeKey: string, tonProof?: string): Promise<string> {
  if (!CoreHelperUtil.isClient()) {
    return Promise.resolve('')
  }

  const wallet = getTonConnect(jsBridgeKey)

  if (!wallet) {
    throw new Error(
      `TonConnectConnector.connectInjected: Injected wallet "${jsBridgeKey}" not available`
    )
  }

  const manifestUrl = getTonConnectManifestUrl()
  const request = createConnectRequest(manifestUrl, tonProof)
  const PROTOCOL_VERSION = 2

  try {
    if (typeof wallet.restoreConnection === 'function') {
      const restored = await wallet.restoreConnection()

      if (restored?.event === 'connect') {
        const addr = restored?.payload?.items?.find?.(
          (i: { name?: string; address?: string }) => i?.name === 'ton_addr'
        )?.address

        if (addr) {
          return addr
        }
      }
    }
  } catch {
    // Silently fail restoration and continue with normal connection flow
  }

  return await new Promise<string>((resolve, reject) => {
    let isSettled = false
    let unsubscribe: (() => void) | undefined = undefined
    const timeoutMs = 12000
    const t = setTimeout(() => {
      if (isSettled) {
        return
      }
      isSettled = true
      try {
        unsubscribe?.()
      } catch {
        // Ignore unsubscribe errors
      }
      reject(new Error('TON connect timeout'))
    }, timeoutMs)

    function finish(fn: () => void): void {
      if (isSettled) {
        return
      }
      isSettled = true
      clearTimeout(t)
      try {
        unsubscribe?.()
      } catch {
        // Ignore unsubscribe errors
      }
      fn()
    }

    function onEvent(evt: TonConnectEvent): void {
      if (evt?.event === 'connect') {
        const addr = evt?.payload?.items?.find?.(i => i?.name === 'ton_addr')?.address
        if (addr) {
          finish(() => resolve(addr))
        }
      } else if (evt?.event === 'connect_error') {
        const msg = evt?.payload?.message || 'TON connect error'
        finish(() => reject(new Error(msg)))
      }
    }

    if (typeof wallet.listen === 'function') {
      unsubscribe = wallet.listen(onEvent)
    }

    try {
      /*
       * Call connect once; rely on either promise resolve or event
       */
      const promise =
        typeof wallet.connect === 'function' ? wallet.connect(PROTOCOL_VERSION, request) : undefined

      if (promise && typeof promise.then === 'function') {
        promise
          .then((res: TonConnectResponse) => {
            if (isSettled) {
              return
            }
            if (res?.event === 'connect') {
              const addr = res?.payload?.items?.find?.(
                (i: { name?: string; address?: string }) => i?.name === 'ton_addr'
              )?.address
              if (addr) {
                finish(() => resolve(addr))
              }
            } else if (res?.event === 'connect_error') {
              const msg = res?.payload?.message || 'TON connect error'
              finish(() => reject(new Error(msg)))
            }
          })
          .catch(() => {
            /*
             * Some wallets throw but still emit an event; let the listener handle it unless timeout
             * Do not finish here to allow event-based completion
             */
          })
      }
    } catch (err) {
      finish(() => reject(err))
    }
  })
}

export function createConnectRequest(manifestUrl: string, tonProof?: string) {
  const items: Array<{ name: 'ton_addr' } | { name: 'ton_proof'; payload: string }> = [
    { name: 'ton_addr' }
  ]

  if (tonProof) {
    items.push({ name: 'ton_proof', payload: tonProof })
  }

  return { manifestUrl, items }
}

export function normalizeBase64(s?: string): string | undefined {
  if (typeof s !== 'string') {
    return undefined
  }
  const pad = s.length + ((4 - (s.length % 4)) % 4)

  return s.replace(/-/gu, '+').replace(/_/gu, '/').padEnd(pad, '=')
}

/**
 * Fetch list of TON wallets (remote + injected) and merge them.
 * This function does not depend on any external SDKs.
 */
export async function getInjectedWallets(params?: {
  sourceUrl?: string
  /** Optional in-memory cache TTL in milliseconds */
  cacheTTLMs?: number
}): Promise<TonWalletInfo[]> {
  const dtoList = await fetchWalletsListDTO(params)

  // Build map: jsBridgeKey -> remote DTO
  const remoteByKey = new Map<string, TonWalletInfoDTO>()
  for (const dto of dtoList) {
    for (const br of dto.bridge ?? []) {
      if (br.type === 'js') {
        remoteByKey.set(br.key, dto)
      }
    }
  }

  // Scan window for ANY tonconnect object (walletInfo may be missing)
  const w = CoreHelperUtil.getWindow()
  const injected: TonWalletInfoInjectable[] = []
  if (w) {
    let entries: [string, unknown][] = []
    try {
      entries = Object.entries(w)
    } catch {
      entries = []
    }

    for (const [key, value] of entries) {
      try {
        const obj = value as {
          tonconnect?: { walletInfo?: unknown; isWalletBrowser?: boolean }
        } | null
        const hasTonconnect = Boolean(obj && typeof obj === 'object' && obj.tonconnect)
        if (!hasTonconnect) {
          // eslint-disable-next-line no-continue
          continue
        }

        const tc = obj?.tonconnect
        const wi = tc?.walletInfo as TonWalletInfoDTO | undefined
        const dto = remoteByKey.get(key)

        const name = wi?.name || dto?.name || key
        const appName = wi?.app_name || dto?.app_name || name
        const imageUrl = wi?.image || dto?.image || ''
        const aboutUrl = wi?.about_url || dto?.about_url || ''
        const tondns = wi?.tondns || dto?.tondns
        const platforms = wi?.platforms || dto?.platforms || []
        const features = wi?.features || dto?.features

        injected.push({
          name,
          appName,
          imageUrl,
          aboutUrl,
          tondns,
          platforms,
          features,
          jsBridgeKey: key,
          injected: true,
          embedded: Boolean(tc?.isWalletBrowser)
        })
      } catch {
        // Skip cross-origin or inaccessible properties
      }
    }
  }

  // No console logs in production utils per lint rules

  return injected
}

/**
 * Returns true if a wallet with the given bridge key appears to be injected.
 */
export function isWalletInjected(jsBridgeKey: string): boolean {
  const w = CoreHelperUtil.getWindow()
  if (!w) {
    return false
  }
  try {
    const obj = w[jsBridgeKey as keyof Window]

    return Boolean(isJSBridgeWithMetadata(obj))
  } catch {
    return false
  }
}

/**
 * Returns true if currently running inside the given wallet's browser.
 */
export function isInsideWalletBrowser(jsBridgeKey: string): boolean {
  const w = CoreHelperUtil.getWindow()
  if (!w) {
    return false
  }
  try {
    const obj = w[jsBridgeKey as keyof Window]

    return isJSBridgeWithMetadata(obj) ? Boolean(obj.tonconnect.isWalletBrowser) : false
  } catch {
    return false
  }
}

/**
 * Enumerates currently injected wallets by scanning the window object.
 */
export function getCurrentlyInjectedWallets(): TonWalletInfoInjectable[] {
  const w = CoreHelperUtil.getWindow()
  if (!w) {
    return []
  }

  let entries: [string, unknown][] = []
  try {
    entries = Object.entries(w)
  } catch {
    return []
  }

  const wallets: TonWalletInfoInjectable[] = []
  for (const [key, value] of entries) {
    try {
      if (
        value &&
        typeof value === 'object' &&
        (value as unknown as Record<string, unknown>)['tonconnect'] &&
        !isJSBridgeWithMetadata(value)
      ) {
        // eslint-disable-next-line no-console
        console.log('[TonWalletsUtil] Found tonconnect without walletInfo for key:', key)
      }

      if (!isJSBridgeWithMetadata(value)) {
        // eslint-disable-next-line no-continue
        continue
      }

      const info = value.tonconnect.walletInfo
      wallets.push({
        name: info.name,
        appName: info.app_name,
        imageUrl: info.image,
        aboutUrl: info.about_url,
        tondns: info.tondns,
        jsBridgeKey: key,
        injected: true,
        embedded: Boolean(value.tonconnect.isWalletBrowser),
        platforms: info.platforms,
        features: info.features
      })
    } catch {
      // Skip cross-origin or inaccessible properties
    }
  }
  try {
    // eslint-disable-next-line no-console
    console.log(
      '[TonWalletsUtil] Injected wallets detected:',
      wallets.map(wallet => ({
        name: wallet.name,
        key: wallet.jsBridgeKey,
        embedded: wallet.embedded
      }))
    )
  } catch {
    // Ignore errors when logging
  }

  return wallets
}

// -- Implementation ------------------------------------------------------------ //
async function fetchWalletsListDTO(params?: { cacheTTLMs?: number }): Promise<TonWalletInfoDTO[]> {
  if (
    params?.cacheTTLMs &&
    cachePromise &&
    cacheCreatedAt &&
    Date.now() < cacheCreatedAt + params.cacheTTLMs
  ) {
    return cachePromise
  }

  if (!cachePromise) {
    cachePromise = (async () => {
      try {
        const res = await fetch(TONCONNECT_WALLETS_LIST_URL, { credentials: 'omit' })
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }
        const data = await res.json()
        if (!Array.isArray(data)) {
          throw new Error('wallets list is not an array')
        }

        const valid = data.filter(isCorrectWalletInfoDTO)

        return valid
      } catch (err) {
        console.warn('TonConnectConnector: failed to fetch wallets list', err)

        return [] as TonWalletInfoDTO[]
      }
    })()

    cachePromise
      .then(() => (cacheCreatedAt = Date.now()))
      .catch(() => {
        cachePromise = null
        cacheCreatedAt = null
      })
  }

  return cachePromise
}

function isCorrectWalletInfoDTO(value: unknown): value is TonWalletInfoDTO {
  if (!value || typeof value !== 'object') {
    return false
  }
  const v = value as Record<string, unknown>
  if (
    !v['name'] ||
    !v['app_name'] ||
    !v['image'] ||
    !v['about_url'] ||
    !Array.isArray(v['platforms']) ||
    !Array.isArray(v['bridge']) ||
    v['bridge'].length === 0
  ) {
    return false
  }

  for (const bridge of v['bridge']) {
    if (!bridge || typeof bridge !== 'object' || !('type' in bridge)) {
      return false
    }
    if (bridge.type === 'sse') {
      if (!('url' in bridge) || !v['universal_url']) {
        return false
      }
    }
    if (bridge.type === 'js') {
      if (!('key' in bridge) || !bridge.key) {
        return false
      }
    }
  }

  return true
}

function isJSBridgeWithMetadata(value: unknown): value is {
  tonconnect: {
    walletInfo: TonWalletInfoDTO
    isWalletBrowser?: boolean
  }
} {
  try {
    return Boolean(
      value &&
        typeof value === 'object' &&
        'tonconnect' in value &&
        value.tonconnect &&
        typeof value.tonconnect === 'object' &&
        'walletInfo' in value.tonconnect &&
        value.tonconnect.walletInfo &&
        typeof value.tonconnect.walletInfo === 'object' &&
        'name' in value.tonconnect.walletInfo &&
        typeof value.tonconnect.walletInfo.name === 'string' &&
        'app_name' in value.tonconnect.walletInfo &&
        typeof value.tonconnect.walletInfo.app_name === 'string' &&
        'image' in value.tonconnect.walletInfo &&
        typeof value.tonconnect.walletInfo.image === 'string' &&
        'about_url' in value.tonconnect.walletInfo &&
        typeof value.tonconnect.walletInfo.about_url === 'string' &&
        'platforms' in value.tonconnect.walletInfo &&
        Array.isArray(value.tonconnect.walletInfo.platforms)
    )
  } catch {
    return false
  }
}

function getWalletFeatures(wallet: TonWalletInfoInjectable): TonWalletFeature[] | undefined {
  const features = wallet?.features

  return Array.isArray(features) ? features : undefined
}

export function assertSendTransactionSupported(
  wallet: TonWalletInfoInjectable,
  requiredMessagesNumber: number,
  requireExtraCurrencies: boolean
): void {
  const features = getWalletFeatures(wallet)

  if (!features) {
    return
  }

  const hasDeprecatedSupport = features.includes?.('SendTransaction')
  const st = features.find?.(
    (f: TonWalletFeature) => f && typeof f === 'object' && f.name === 'SendTransaction'
  )

  if (!hasDeprecatedSupport && !st) {
    throw new Error("Wallet doesn't support SendTransaction feature.")
  }

  if (requireExtraCurrencies) {
    if (
      !st ||
      typeof st === 'string' ||
      st.name !== 'SendTransaction' ||
      !st.extraCurrencySupported
    ) {
      throw new Error(
        'Wallet is not able to handle such SendTransaction request. Extra currencies support is required.'
      )
    }
  }

  if (
    st &&
    typeof st !== 'string' &&
    st.name === 'SendTransaction' &&
    typeof st.maxMessages === 'number'
  ) {
    if (st.maxMessages < requiredMessagesNumber) {
      throw new Error(
        `Wallet is not able to handle such SendTransaction request. Max support messages number is ${st.maxMessages}, but ${requiredMessagesNumber} is required.`
      )
    }
  }
}

export function assertSignDataSupported(
  wallet: TonWalletInfoInjectable,
  requiredTypes: Array<'text' | 'binary' | 'cell'>
): void {
  const features = getWalletFeatures(wallet)

  if (!features) {
    return
  }

  const sd = features.find?.(
    (f: TonWalletFeature) => f && typeof f === 'object' && f.name === 'SignData'
  )
  if (!sd || typeof sd === 'string' || sd.name !== 'SignData') {
    throw new Error("Wallet doesn't support SignData feature.")
  }

  const walletTypes: string[] = Array.isArray(sd.types) ? sd.types : []
  const unsupported = requiredTypes.filter(t => !walletTypes.includes(t))

  if (unsupported.length) {
    throw new Error(`Wallet doesn't support required SignData types: ${unsupported.join(', ')}.`)
  }
}

export function getJSBridgeKey(wallet: TonWalletInfoInjectable): string | undefined {
  return wallet?.jsBridgeKey
}

export function getTonConnect(jsBridgeKey: string | undefined): InjectedWalletApi | undefined {
  if (!jsBridgeKey) {
    return undefined
  }

  return window[jsBridgeKey as keyof Window]?.tonconnect as InjectedWalletApi | undefined
}
