import { subscribeKey as subKey } from 'valtio/vanilla/utils'

import type { ChainNamespace } from '@reown/appkit-common'

import { ApiController } from '../controllers/ApiController.js'
import { ChainController } from '../controllers/ChainController.js'
import { ConnectionController } from '../controllers/ConnectionController.js'
import { ConnectorController } from '../controllers/ConnectorController.js'
import { OptionsController } from '../controllers/OptionsController.js'
import { PublicStateController } from '../controllers/PublicStateController.js'
import { ConnectUtil, type WalletItem } from './ConnectUtil.js'
import { ConnectionControllerUtil } from './ConnectionControllerUtil.js'
import { ConnectorControllerUtil } from './ConnectorControllerUtil.js'
import { CoreHelperUtil } from './CoreHelperUtil.js'
import { MobileWalletUtil } from './MobileWallet.js'

// -- Types ------------------------------------------------------------------ //

/** Options for {@link HeadlessWalletUtil.fetchWallets}. */
export interface FetchWalletsOptions {
  /** Page number to fetch (default: 1) */
  page?: number
  /** @deprecated Use `search` instead */
  query?: string
  /** Search query to filter wallets. When provided, switches to search mode. */
  search?: string
  /** Number of entries per page. Defaults to 40 for list mode, 100 for search mode. */
  entries?: number
  /** Filter wallets by badge type ('none' | 'certified') */
  badge?: 'none' | 'certified'
  /** Wallet IDs to include. Overrides the global includeWalletIds config when provided. */
  include?: string[]
  /** Wallet IDs to exclude. Overrides the default exclude list when provided. */
  exclude?: string[]
  /**
   * Include wallets that support WalletConnect Pay but are not v2-compatible.
   * By default these are filtered out. Enable for WalletConnect Pay surfaces.
   */
  includePayOnly?: boolean
  /** Sort mode. 'wcpay' bubbles WalletConnect Pay-supporting wallets to the top. */
  sort?: 'default' | 'wcpay'
}

/** Options for {@link HeadlessWalletUtil.connect} / {@link HeadlessWalletUtil.getWalletConnectUri}. */
export interface ConnectOptions {
  /**
   * A WalletConnect Pay deeplink appended to the WC URI, so a WCPay-capable wallet
   * returns to — and processes — this payment after pairing.
   */
  wcPayUrl?: string
}

/** The headless wallet list, read imperatively. */
export interface WalletListSnapshot {
  /** Initial connect-view wallets: installed extensions + top-ranked WalletConnect wallets. */
  wallets: WalletItem[]
  /** The full WalletGuide WalletConnect list (with the current search results applied). */
  wcWallets: WalletItem[]
  /** Current page of the WalletConnect list. */
  page: number
  /** Total number of available WalletConnect wallets for the current parameters. */
  count: number
}

/**
 * Framework-agnostic headless wallet-list logic — the imperative core behind the
 * `useAppKitWallets` React hook and the `AppKit` client's wallet methods.
 *
 * AppKit runs headless (no modal): the host renders its own picker and connects a
 * chosen wallet programmatically. That orchestration (list / search / paginate the
 * WalletGuide wallets, fetch the WalletConnect URI, and connect injected / API / mobile
 * wallets) lived only inside the React hook; lifting it here lets a non-React host
 * (e.g. `@walletconnect/pay-appkit`) drive the same flow through `appKit.*` methods,
 * with the hook and the client sharing one tested code path.
 *
 * Reads/writes the global controllers directly (valtio singletons), so it takes no
 * AppKit instance — exactly like {@link ConnectionControllerUtil}.
 */
export const HeadlessWalletUtil = {
  /**
   * Fetch / search / paginate the WalletConnect wallet list from the explorer API.
   * With a `search` (or the deprecated `query`), switches to search mode; otherwise
   * lists/paginates. Reads results from `ApiController.state` (see {@link getWalletList}).
   */
  async fetchWallets(fetchOptions?: FetchWalletsOptions): Promise<void> {
    const { query, ...options } = fetchOptions ?? {}
    const search = options.search ?? query

    if (search) {
      await ApiController.searchWallet({ ...options, search })
    } else {
      ApiController.state.search = []
      await ApiController.fetchWalletsByPage({ page: 1, ...options })
    }
  },

  /** Read the current wallet list (initial view + WalletConnect list + pagination). */
  getWalletList(): WalletListSnapshot {
    return {
      wallets: ConnectUtil.getInitialWallets(),
      wcWallets: ConnectUtil.getWalletConnectWallets(
        ApiController.state.wallets,
        ApiController.state.search
      ),
      page: ApiController.state.page,
      count: ApiController.state.count
    }
  },

  /** Subscribe to wallet-list changes (the WalletGuide list + search results). */
  subscribeWalletList(callback: () => void): () => void {
    const unsubscribers = [
      subKey(ApiController.state, 'wallets', callback),
      subKey(ApiController.state, 'search', callback),
      subKey(ApiController.state, 'page', callback),
      subKey(ApiController.state, 'count', callback)
    ]

    return () => unsubscribers.forEach(unsubscribe => unsubscribe())
  },

  /**
   * Pre-fetch the WalletConnect URI (read from `ConnectionController.state.wcUri`).
   * Call when a wallet is selected so a later connect can deeplink synchronously
   * (required for iOS Safari). Uses 'auto' cache to reuse a valid URI or fetch a new one.
   */
  async getWalletConnectUri(_options?: ConnectOptions): Promise<void> {
    this.resetWcUri()
    await ConnectionController.connectWalletConnect({ cache: 'auto' })
  },

  /**
   * Connect a chosen wallet programmatically (headless — no modal).
   *
   * Handles injected wallets, API wallets (from the "all wallets" list), and mobile
   * deeplinks. For API wallets without pre-populated connectors, falls back to a lookup
   * by the wallet's ID via `explorerId` matching (e.g. Coinbase/Base from "all wallets").
   */
  async connect(
    wallet: WalletItem,
    namespace?: ChainNamespace,
    options?: ConnectOptions
  ): Promise<void> {
    PublicStateController.set({ connectingWallet: wallet })
    const isMobileDevice = CoreHelperUtil.isMobile()

    // Fall back to the active chain if no namespace is given (matches headful behavior).
    const activeNamespace = namespace || ChainController.state.activeChain

    try {
      const walletConnector = wallet?.connectors.find(c => c.chain === activeNamespace)

      const connector =
        walletConnector && activeNamespace
          ? ConnectorController.getConnector({
              id: walletConnector?.id,
              namespace: activeNamespace
            })
          : undefined

      /*
       * Fallback connector lookup for API wallets (empty `connectors`): find a connector
       * by the wallet's API id (getConnector matches both `c.id` and `c.explorerId`), so
       * e.g. the Base Account connector opens Coinbase's web wallet instead of falling
       * through to WalletConnect. Matches headful `ConnectorController.selectWalletConnector`.
       */
      const fallbackConnector =
        !connector && activeNamespace
          ? ConnectorController.getConnector({ id: wallet?.id, namespace: activeNamespace })
          : undefined

      if (wallet?.isInjected && connector) {
        await ConnectorControllerUtil.connectExternal(connector)
      } else if (fallbackConnector) {
        await ConnectorControllerUtil.connectExternal(fallbackConnector)
      } else if (isMobileDevice) {
        const wcWallet = ConnectUtil.mapWalletItemToWcWallet(wallet)

        if (wcWallet.mobile_link) {
          ConnectionControllerUtil.onConnectMobile(wcWallet, options?.wcPayUrl)
        } else {
          MobileWalletUtil.handleMobileDeeplinkRedirect(wallet.id, activeNamespace, {
            isCoinbaseDisabled: OptionsController.state.enableCoinbase === false
          })
        }
      } else {
        await ConnectionController.connectWalletConnect({ cache: 'never' })
      }
    } catch (error) {
      PublicStateController.set({ connectingWallet: undefined })
      throw error
    }
  },

  /** Reset the WalletConnect URI + linking state (e.g. when a QR is closed). */
  resetWcUri(): void {
    ConnectionController.resetUri()
    ConnectionController.setWcLinking(undefined)
  },

  /** Clear the `connectingWallet` state. */
  resetConnectingWallet(): void {
    PublicStateController.set({ connectingWallet: undefined })
  }
}
