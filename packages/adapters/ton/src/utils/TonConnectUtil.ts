import {
  ApiController,
  BlockchainApiController,
  CoreHelperUtil,
  FetchUtil,
  OptionsController,
  StorageUtil
} from '@reown/appkit-controllers'
import type {
  TonWalletInfo,
  TonWalletInfoDTO,
  TonWalletInfoInjectable
} from '@reown/appkit-utils/ton'

import type { InjectedWalletApi, TonConnectEvent, TonWalletFeature } from './TonConnectTypeUtils.js'

const TONCONNECT_MANIFEST_URL = 'https://api.reown.com/ton/v1/manifest'

/*
 * Map to store unsubscribe functions for each wallet's event listeners
 * Key: jsBridgeKey, Value: unsubscribe function returned by wallet.listen()
 */
const listenerUnsubscribes = new Map<string, () => void>()

export const TonConnectUtil = {
  getTonConnectManifestUrl(): string {
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
  },

  async connectInjected(jsBridgeKey: string, tonProof?: string): Promise<string> {
    if (!CoreHelperUtil.isClient()) {
      return Promise.resolve('')
    }

    const wallet = this.getTonConnect(jsBridgeKey)

    if (!wallet) {
      throw new Error(
        `TonConnectConnector.connectInjected: Injected wallet "${jsBridgeKey}" not available`
      )
    }

    const manifestUrl = this.getTonConnectManifestUrl()
    const request = this.createConnectRequest(manifestUrl, tonProof)
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

    // Follow SDK pattern: always await the connect promise as primary source of truth
    try {
      if (typeof wallet.connect !== 'function') {
        throw new Error('Wallet does not support connect method')
      }

      const connectEvent = await wallet.connect(PROTOCOL_VERSION, request)

      if (connectEvent?.event === 'connect') {
        const addr = connectEvent?.payload?.items?.find?.(
          (i: { name?: string; address?: string }) => i?.name === 'ton_addr'
        )?.address

        if (addr) {
          /*
           * Set up listener AFTER successful connection for future events (like disconnect)
           * This matches the SDK's makeSubscriptions() pattern
           */
          if (typeof wallet.listen === 'function') {
            this.setupWalletListener(jsBridgeKey, wallet)
          }

          return addr
        }

        throw new Error('TON address not found in connect response')
      } else if (connectEvent?.event === 'connect_error') {
        const msg = connectEvent?.payload?.message || 'TON connect error'
        throw new Error(msg)
      } else {
        throw new Error('Unexpected connect event type')
      }
    } catch (err) {
      // Re-throw with more context if it's not already an Error
      if (err instanceof Error) {
        throw err
      }
      throw new Error(`TON connect failed: ${String(err)}`)
    }
  },

  /**
   * Disconnect from an injected wallet.
   * Follows SDK pattern: tries deprecated disconnect() method first, then falls back to RPC send.
   */
  async disconnectInjected(jsBridgeKey: string): Promise<void> {
    if (!CoreHelperUtil.isClient()) {
      return Promise.resolve()
    }

    // Clean up event listener for this wallet
    const unsubscribe = listenerUnsubscribes.get(jsBridgeKey)
    if (unsubscribe) {
      try {
        unsubscribe()
      } catch {
        // Ignore cleanup errors
      }
      listenerUnsubscribes.delete(jsBridgeKey)
    }

    const wallet = this.getTonConnect(jsBridgeKey)

    if (!wallet) {
      throw new Error(
        `TonConnectConnector.disconnectInjected: Injected wallet "${jsBridgeKey}" not available`
      )
    }

    return new Promise<void>(resolve => {
      function onRequestSent(): void {
        resolve()
      }

      try {
        // Try deprecated disconnect() method first
        if (typeof wallet.disconnect === 'function') {
          wallet.disconnect()
          onRequestSent()
        } else {
          // Fall back to RPC send method
          throw new Error('disconnect method not available')
        }
      } catch (e) {
        /*
         * If direct disconnect fails, use RPC send method
         * This matches the SDK's InjectedProvider.disconnect() pattern
         */
        if (typeof wallet.send === 'function') {
          wallet
            .send({
              method: 'disconnect',
              params: [],
              id: String(CoreHelperUtil.getUUID())
            })
            .then(() => {
              onRequestSent()
            })
            .catch(() => {
              /*
               * Even if send fails, resolve to avoid hanging
               * Some wallets may not support disconnect RPC
               */
              onRequestSent()
            })
        } else {
          // No disconnect method available, just resolve
          onRequestSent()
        }
      }
    })
  },

  createConnectRequest(manifestUrl: string, tonProof?: string) {
    const items: Array<{ name: 'ton_addr' } | { name: 'ton_proof'; payload: string }> = [
      { name: 'ton_addr' }
    ]

    if (tonProof) {
      items.push({ name: 'ton_proof', payload: tonProof })
    }

    return { manifestUrl, items }
  },

  normalizeBase64(data: string | undefined): string | undefined {
    if (typeof data !== 'string') {
      return undefined
    }

    const paddedLength = data.length + ((4 - (data.length % 4)) % 4)

    return data.replace(/-/gu, '+').replace(/_/gu, '/').padEnd(paddedLength, '=')
  },

  /**
   * Fetch list of TON wallets (remote + injected) and merge them.
   * This does not depend on any external SDKs.
   */
  async getInjectedWallets(): Promise<TonWalletInfo[]> {
    const dtoList = await this.fetchWalletsListDTO()

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
  },

  /**
   * Returns true if a wallet with the given bridge key appears to be injected.
   */
  isWalletInjected(jsBridgeKey: string): boolean {
    const w = CoreHelperUtil.getWindow()
    if (!w) {
      return false
    }
    try {
      const obj = w[jsBridgeKey as keyof Window]

      return Boolean(this.isJSBridgeWithMetadata(obj))
    } catch {
      return false
    }
  },

  /**
   * Returns true if currently running inside the given wallet's browser.
   */
  isInsideWalletBrowser(jsBridgeKey: string): boolean {
    const w = CoreHelperUtil.getWindow()
    if (!w) {
      return false
    }
    try {
      const obj = w[jsBridgeKey as keyof Window]

      return this.isJSBridgeWithMetadata(obj) ? Boolean(obj.tonconnect.isWalletBrowser) : false
    } catch {
      return false
    }
  },

  /**
   * Enumerates currently injected wallets by scanning the window object.
   */
  getCurrentlyInjectedWallets(): TonWalletInfoInjectable[] {
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
          !this.isJSBridgeWithMetadata(value)
        ) {
          // eslint-disable-next-line no-continue
          continue
        }

        if (!this.isJSBridgeWithMetadata(value)) {
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

    return wallets
  },

  // -- Implementation ------------------------------------------------------------ //
  async fetchWalletsListDTO(): Promise<TonWalletInfoDTO[]> {
    const api = new FetchUtil({
      baseUrl: CoreHelperUtil.getApiUrl(),
      clientId: null
    })

    const tonWalletsCache = StorageUtil.getTonWalletsCache()

    if (tonWalletsCache) {
      return tonWalletsCache.wallets.filter(this.isCorrectWalletInfoDTO)
    }

    try {
      const response = await api.get<TonWalletInfoDTO[]>({
        path: '/ton/v1/wallets',
        params: ApiController._getSdkProperties()
      })

      StorageUtil.updateTonWalletsCache(response)

      return response.filter(this.isCorrectWalletInfoDTO)
    } catch {
      return []
    }
  },

  isCorrectWalletInfoDTO(value: unknown): value is TonWalletInfoDTO {
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
  },

  isJSBridgeWithMetadata(value: unknown): value is {
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
  },

  getWalletFeatures(wallet: TonWalletInfoInjectable): TonWalletFeature[] | undefined {
    const features = wallet?.features

    return Array.isArray(features) ? features : undefined
  },

  assertSendTransactionSupported(
    wallet: TonWalletInfoInjectable,
    requiredMessagesNumber: number,
    requireExtraCurrencies: boolean
  ): void {
    const features = this.getWalletFeatures(wallet)

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
  },

  assertSignDataSupported(
    wallet: TonWalletInfoInjectable,
    requiredTypes: Array<'text' | 'binary' | 'cell'>
  ): void {
    const features = this.getWalletFeatures(wallet)

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
  },

  getJSBridgeKey(wallet: TonWalletInfoInjectable): string | undefined {
    return wallet?.jsBridgeKey
  },

  getTonConnect(jsBridgeKey: string | undefined): InjectedWalletApi | undefined {
    if (!jsBridgeKey) {
      return undefined
    }

    return window[jsBridgeKey as keyof Window]?.tonconnect as InjectedWalletApi | undefined
  },

  /**
   * Sets up event listener for a wallet and stores the unsubscribe function.
   * Cleans up any existing listener before setting up a new one.
   */
  setupWalletListener(jsBridgeKey: string, wallet: InjectedWalletApi): void {
    // Clean up any existing listener for this wallet before setting up a new one
    const existingUnsubscribe = listenerUnsubscribes.get(jsBridgeKey)
    if (existingUnsubscribe) {
      try {
        existingUnsubscribe()
      } catch {
        // Ignore cleanup errors
      }
      listenerUnsubscribes.delete(jsBridgeKey)
    }

    // Set up new listener and store the unsubscribe function
    const unsubscribe = wallet.listen((evt: TonConnectEvent) => {
      /*
       * Handle future events like disconnect if needed
       * Connection was closed by wallet - clean up the listener when disconnected
       */
      if (evt?.event === 'disconnect') {
        listenerUnsubscribes.delete(jsBridgeKey)
      }
    })

    if (typeof unsubscribe === 'function') {
      listenerUnsubscribes.set(jsBridgeKey, unsubscribe)
    }
  }
}
