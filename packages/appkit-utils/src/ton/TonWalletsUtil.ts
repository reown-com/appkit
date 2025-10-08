// -- TON Wallets Utils --------------------------------------------------------- //

/**
 * Minimal types describing TON wallets. These are intentionally lightweight
 * and independent from external SDKs to keep the bundle surface small.
 */

type WalletPlatform = string
type WalletFeature = string

export type TonWalletInfoBase = {
  name: string
  appName: string
  imageUrl: string
  aboutUrl: string
  tondns?: string
  platforms: WalletPlatform[]
  features?: WalletFeature[]
}

export type TonWalletInfoRemote = TonWalletInfoBase & {
  universalLink?: string
  deepLink?: string
  bridgeUrl?: string
}

export type TonWalletInfoInjectable = TonWalletInfoBase & {
  jsBridgeKey: string
  injected: boolean
  embedded: boolean
}

export type TonWalletInfo = TonWalletInfoRemote | TonWalletInfoInjectable

type TonWalletInfoDTO = {
  name: string
  app_name: string
  image: string
  about_url: string
  tondns?: string
  universal_url?: string
  deepLink?: string
  platforms: WalletPlatform[]
  features?: WalletFeature[]
  bridge: Array<{ type: 'sse'; url: string } | { type: 'js'; key: string }>
}

// -- Internal cache ------------------------------------------------------------ //

let cachePromise: Promise<TonWalletInfoDTO[]> | null = null
let cacheCreatedAt: number | null = null

// -- Public API ---------------------------------------------------------------- //

/**
 * Fetch list of TON wallets (remote + injected) and merge them.
 * This function does not depend on any external SDKs.
 */
export async function getWallets(params?: {
  /** Custom source for wallets list JSON. Default: https://config.ton.org/wallets-v2.json */
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
  const w = getWindow()
  const injected: TonWalletInfoInjectable[] = []
  if (w) {
    let entries: [string, unknown][] = []
    try {
      entries = Object.entries(w as Record<string, unknown>)
    } catch {
      entries = []
    }

    for (const [key, value] of entries) {
      const obj = value as {
        tonconnect?: { walletInfo?: unknown; isWalletBrowser?: boolean }
      } | null
      const hasTonconnect = Boolean(obj && typeof obj === 'object' && obj.tonconnect)
      if (!hasTonconnect) {
        // eslint-disable-next-line no-continue
        continue
      }

      const tc = obj?.tonconnect
      const wi = tc?.walletInfo as
        | {
            name?: string
            app_name?: string
            image?: string
            about_url?: string
            tondns?: string
            platforms?: string[]
            features?: string[]
          }
        | undefined
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
    }
  }

  // No console logs in production utils per lint rules

  return injected
}

/**
 * Returns true if a wallet with the given bridge key appears to be injected.
 */
export function isWalletInjected(jsBridgeKey: string): boolean {
  const w = getWindow()
  if (!w) {
    return false
  }
  const obj = (w as Record<string, unknown>)[jsBridgeKey]

  return Boolean(isJSBridgeWithMetadata(obj))
}

/**
 * Returns true if currently running inside the given wallet's browser.
 */
export function isInsideWalletBrowser(jsBridgeKey: string): boolean {
  const w = getWindow()
  if (!w) {
    return false
  }
  const obj = (w as Record<string, unknown>)[jsBridgeKey]

  return isJSBridgeWithMetadata(obj) ? Boolean(obj.tonconnect.isWalletBrowser) : false
}

/**
 * Enumerates currently injected wallets by scanning the window object.
 */
export function getCurrentlyInjectedWallets(): TonWalletInfoInjectable[] {
  const w = getWindow()
  if (!w) {
    return []
  }

  let entries: [string, unknown][] = []
  try {
    entries = Object.entries(w as Record<string, unknown>)
  } catch {
    return []
  }

  const wallets: TonWalletInfoInjectable[] = []
  for (const [key, value] of entries) {
    try {
      if (
        value &&
        typeof value === 'object' &&
        (value as Record<string, unknown>).tonconnect &&
        !isJSBridgeWithMetadata(value)
      ) {
        // eslint-disable-next-line no-console
        console.log('[TonWalletsUtil] Found tonconnect without walletInfo for key:', key)
      }
    } catch {
      // Ignore errors when checking wallet info
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

async function fetchWalletsListDTO(params?: {
  sourceUrl?: string
  cacheTTLMs?: number
}): Promise<TonWalletInfoDTO[]> {
  const source = params?.sourceUrl ?? 'https://config.ton.org/wallets-v2.json'

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
        const res = await fetch(source, { credentials: 'omit' })
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
        // eslint-disable-next-line no-console
        console.warn('[TonWalletsUtil] failed to fetch wallets list:', err)

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
    !v.name ||
    !v.app_name ||
    !v.image ||
    !v.about_url ||
    !Array.isArray(v.platforms) ||
    !Array.isArray(v.bridge) ||
    v.bridge.length === 0
  ) {
    return false
  }

  for (const br of v.bridge) {
    if (!br || typeof br !== 'object' || !('type' in br)) {
      return false
    }
    if (br.type === 'sse') {
      if (!('url' in br) || !v.universal_url) {
        return false
      }
    }
    if (br.type === 'js') {
      if (!('key' in br) || !br.key) {
        return false
      }
    }
  }

  return true
}

function isJSBridgeWithMetadata(value: unknown): value is {
  tonconnect: {
    walletInfo: {
      name: string
      app_name: string
      image: string
      about_url: string
      tondns?: string
      platforms: string[]
      features?: string[]
    }
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

function getWindow(): Window | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }

  return window
}
