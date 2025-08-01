import { ConstantsUtil } from '@reown/appkit-common'

import { ChainController, type ChainControllerState } from '../controllers/ChainController.js'

/*
 * Exclude wallets that do not support relay connections but have custom deeplink mechanisms
 * Excludes:
 * - Phantom
 * - Coinbase
 */
export const CUSTOM_DEEPLINK_WALLETS = {
  PHANTOM: {
    id: 'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393',
    url: 'https://phantom.app'
  },
  SOLFLARE: {
    id: '1ca0bdd4747578705b1939af023d120677c64fe6ca76add81fda36e350605e79',
    url: 'https://solflare.com'
  },
  COINBASE: {
    id: 'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa',
    url: 'https://go.cb-w.com'
  },
  /*
   * Got details from their npm package:
   * https://www.npmjs.com/package/@binance/w3w-utils?activeTab=code
   * https://developers.binance.com/docs/binance-w3w/evm-compatible-provider#getdeeplink
   */
  BINANCE: {
    id: '8a0ee50d1f22f6651afcae7eb4253e52a3310b90af5daef78a8c4929a9bb99d4',
    appId: 'yFK5FCqYprrXDiVFbhyRx7',
    deeplink: 'bnc://app.binance.com/mp/app',
    url: 'https://app.binance.com/en/download'
  }
}

export const MobileWalletUtil = {
  /**
   * Handles mobile wallet redirection for wallets that have Universal Links and doesn't support WalletConnect Deep Links.
   *
   * @param {string} id - The id of the wallet.
   * @param {ChainNamespace} namespace - The namespace of the chain.
   */
  handleMobileDeeplinkRedirect(id: string, namespace: ChainControllerState['activeChain']): void {
    /**
     * Universal Links requires explicit user interaction to open the wallet app.
     * Previously we've been calling this with the life-cycle methods in the Solana clients by listening the SELECT_WALLET event of EventController.
     * But this breaks the UL functionality for some wallets like Phantom.
     */
    const href = window.location.href
    const encodedHref = encodeURIComponent(href)

    if (id === CUSTOM_DEEPLINK_WALLETS.PHANTOM.id && !('phantom' in window)) {
      const protocol = href.startsWith('https') ? 'https' : 'http'
      const host = href.split('/')[2]
      const encodedRef = encodeURIComponent(`${protocol}://${host}`)

      window.location.href = `${CUSTOM_DEEPLINK_WALLETS.PHANTOM.url}/ul/browse/${encodedHref}?ref=${encodedRef}`
    }

    if (id === CUSTOM_DEEPLINK_WALLETS.SOLFLARE.id && !('solflare' in window)) {
      window.location.href = `${CUSTOM_DEEPLINK_WALLETS.SOLFLARE.url}/ul/v1/browse/${encodedHref}?ref=${encodedHref}`
    }

    if (namespace === ConstantsUtil.CHAIN.SOLANA) {
      if (id === CUSTOM_DEEPLINK_WALLETS.COINBASE.id && !('coinbaseSolana' in window)) {
        window.location.href = `${CUSTOM_DEEPLINK_WALLETS.COINBASE.url}/dapp?cb_url=${encodedHref}`
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
