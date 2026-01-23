import { ConstantsUtil } from '@reown/appkit-common'

import { ChainController, type ChainControllerState } from '../controllers/ChainController.js'
import { CoreHelperUtil } from './CoreHelperUtil.js'

/*
 * Exclude wallets that do not support relay connections but have custom deeplink mechanisms
 * Excludes:
 * - Phantom
 * - Coinbase
 */
export const CUSTOM_DEEPLINK_WALLETS = {
  PHANTOM: {
    id: 'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393',
    url: 'https://phantom.app',
    androidPackage: 'app.phantom'
  },
  SOLFLARE: {
    id: '1ca0bdd4747578705b1939af023d120677c64fe6ca76add81fda36e350605e79',
    url: 'https://solflare.com'
  },
  COINBASE: {
    id: 'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa',
    url: 'https://go.cb-w.com',
    evmDeeplink: 'cbwallet://miniapp'
  },
  /*
   * Got details from their npm package:
   * https://www.npmjs.com/package/@binance/w3w-utils?activeTab=code
   * https://developers.binance.com/docs/binance-w3w/evm-compatible-provider#getdeeplink
   */
  BINANCE: {
    id: '2fafea35bb471d22889ccb49c08d99dd0a18a37982602c33f696a5723934ba25',
    appId: 'yFK5FCqYprrXDiVFbhyRx7',
    deeplink: 'bnc://app.binance.com/mp/app',
    url: 'https://app.binance.com/en/download'
  }
}

export const MobileWalletUtil = {
  /**
   * Checks if a wallet is a custom deeplink wallet that uses Universal Links
   * instead of WalletConnect deeplinks for the given chain namespace.
   *
   * Only returns true for supported wallet-chain combinations:
   * - Phantom: Solana, EVM, and Bitcoin (doesn't support WalletConnect)
   * - Solflare: Solana only
   * - Coinbase: Solana and EVM
   * - Binance: Bitcoin only
   *
   * @param {string} id - The id of the wallet.
   * @param {ChainControllerState['activeChain']} namespace - The chain namespace.
   * @returns {boolean} Whether the wallet is a custom deeplink wallet for the given namespace.
   */
  isCustomDeeplinkWallet(id: string, namespace: ChainControllerState['activeChain']): boolean {
    // Phantom doesn't support WalletConnect, uses Universal Links for all supported chains
    if (id === CUSTOM_DEEPLINK_WALLETS.PHANTOM.id) {
      return (
        namespace === ConstantsUtil.CHAIN.SOLANA ||
        namespace === ConstantsUtil.CHAIN.EVM ||
        namespace === ConstantsUtil.CHAIN.BITCOIN
      )
    }

    if (id === CUSTOM_DEEPLINK_WALLETS.SOLFLARE.id) {
      return namespace === ConstantsUtil.CHAIN.SOLANA
    }

    if (id === CUSTOM_DEEPLINK_WALLETS.COINBASE.id) {
      return namespace === ConstantsUtil.CHAIN.SOLANA || namespace === ConstantsUtil.CHAIN.EVM
    }

    if (id === CUSTOM_DEEPLINK_WALLETS.BINANCE.id) {
      return namespace === ConstantsUtil.CHAIN.BITCOIN
    }

    return false
  },

  /**
   * Handles mobile wallet redirection for wallets that have Universal Links and doesn't support WalletConnect Deep Links.
   *
   * @param {string} id - The id of the wallet.
   * @param {ChainNamespace} namespace - The namespace of the chain.
   * @param {object} options - Optional configuration.
   * @param {boolean} options.isCoinbaseDisabled - Whether Coinbase wallet is disabled. When true, always trigger deeplink.
   */
  handleMobileDeeplinkRedirect(
    id: string,
    namespace: ChainControllerState['activeChain'],
    options?: { isCoinbaseDisabled?: boolean }
  ): void {
    /**
     * Universal Links requires explicit user interaction to open the wallet app.
     * Previously we've been calling this with the life-cycle methods in the Solana clients by listening the SELECT_WALLET event of EventController.
     * But this breaks the UL functionality for some wallets like Phantom.
     */
    const href = window.location.href
    const encodedHref = encodeURIComponent(href)
    const isCoinbaseDisabled = options?.isCoinbaseDisabled ?? false

    if (id === CUSTOM_DEEPLINK_WALLETS.PHANTOM.id && !('phantom' in window)) {
      const protocol = href.startsWith('https') ? 'https' : 'http'
      const host = href.split('/')[2]
      const encodedRef = encodeURIComponent(`${protocol}://${host}`)
      const browseUrl = `${CUSTOM_DEEPLINK_WALLETS.PHANTOM.url}/ul/browse/${encodedHref}?ref=${encodedRef}`

      if (CoreHelperUtil.isAndroid()) {
        /*
         * Use Android intent URL for Phantom on Android devices.
         * Universal Links don't work reliably on many Android browsers (Opera, UC Browser, Samsung Internet, in-app browsers).
         * Intent URLs bypass browser app link verification and work on all Android browsers.
         * See: https://developer.chrome.com/docs/android/intents
         */
        const intentUrl = `intent://browse/${encodedHref}?ref=${encodedRef}#Intent;scheme=phantom;package=${CUSTOM_DEEPLINK_WALLETS.PHANTOM.androidPackage};end`

        window.location.href = intentUrl
      } else {
        // Use Universal Link on iOS - well supported by Safari
        window.location.href = browseUrl
      }
    }

    // Solflare only supports Solana
    if (
      id === CUSTOM_DEEPLINK_WALLETS.SOLFLARE.id &&
      namespace === ConstantsUtil.CHAIN.SOLANA &&
      !('solflare' in window)
    ) {
      window.location.href = `${CUSTOM_DEEPLINK_WALLETS.SOLFLARE.url}/ul/v1/browse/${encodedHref}?ref=${encodedHref}`
    }

    if (namespace === ConstantsUtil.CHAIN.SOLANA) {
      if (
        id === CUSTOM_DEEPLINK_WALLETS.COINBASE.id &&
        (isCoinbaseDisabled || !('coinbaseSolana' in window))
      ) {
        window.location.href = `${CUSTOM_DEEPLINK_WALLETS.COINBASE.url}/dapp?cb_url=${encodedHref}`
      }
    }

    /*
     * Coinbase/Base wallet deeplink for EVM chains.
     * Uses cbwallet://miniapp?url={REDIRECT_URL} to open in-app browser.
     */
    if (namespace === ConstantsUtil.CHAIN.EVM) {
      if (
        id === CUSTOM_DEEPLINK_WALLETS.COINBASE.id &&
        (isCoinbaseDisabled || !('coinbaseWalletExtension' in window))
      ) {
        window.location.href = `${CUSTOM_DEEPLINK_WALLETS.COINBASE.evmDeeplink}?url=${encodedHref}`
      }
    }

    /*
     * Binance Web3 Wallet doesn't support WalletConnect for Bitcoin.
     * For now we use their deeplink to open the in-app browser instead.
     */
    if (namespace === ConstantsUtil.CHAIN.BITCOIN) {
      if (id === CUSTOM_DEEPLINK_WALLETS.BINANCE.id && !('binancew3w' in window)) {
        const activeCaipNetwork = ChainController.state.activeCaipNetwork

        const startPagePath = window.btoa('/pages/browser/index')
        const startPageQuery = window.btoa(
          `url=${encodedHref}&defaultChainId=${activeCaipNetwork?.id ?? 1}`
        )

        const deeplink = new URL(CUSTOM_DEEPLINK_WALLETS.BINANCE.deeplink)

        deeplink.searchParams.set('appId', CUSTOM_DEEPLINK_WALLETS.BINANCE.appId)
        deeplink.searchParams.set('startPagePath', startPagePath)
        deeplink.searchParams.set('startPageQuery', startPageQuery)

        const universalLink = new URL(CUSTOM_DEEPLINK_WALLETS.BINANCE.url)

        universalLink.searchParams.set('_dp', window.btoa(deeplink.toString()))

        window.location.href = universalLink.toString()
      }
    }
  }
}
