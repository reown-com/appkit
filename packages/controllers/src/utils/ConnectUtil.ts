import type { ChainNamespace } from '@reown/appkit-common'

import { ApiController } from '../controllers/ApiController.js'
import { ConnectorController } from '../controllers/ConnectorController.js'
import { AssetUtil } from './AssetUtil.js'
import type { WcWallet } from './TypeUtil.js'

// --- Types --------------------------------------------- //
export type WalletItem = {
  id: string
  name: string
  imageUrl: string
  connectors: {
    id: string
    rdns?: string
    chain: ChainNamespace
    chainImageUrl?: string
  }[]
  walletInfo: {
    description?: WcWallet['description']
    supportedChains?: WcWallet['chains']
    supportedNamespaces?: ChainNamespace[]
    website?: WcWallet['homepage']
    installationLinks?: {
      appStore?: WcWallet['app_store']
      playStore?: WcWallet['play_store']
      chromeStore?: WcWallet['chrome_store']
      desktopLink?: WcWallet['desktop_link']
    }
    deepLink?: WcWallet['mobile_link']
    isCertified?: boolean
  }
  isInjected: boolean
  isRecent: boolean
}

export const ConnectUtil = {
  /**
   * Maps the initial connect view wallets into WalletItems. Includes WalletConnect wallet and injected wallets. If user doesn't have any injected wallets, it'll fill the list with most ranked WalletConnect wallets.
   * @returns The WalletItems for the initial connect view.
   */
  getInitialWallets() {
    const walletConnectWallet = ConnectUtil.getWalletConnectWallet()
    const injectedWallets = ConnectUtil.getInjectedWallets()
    const recommendedWallets = ApiController.state.wallets
      .slice(0, 5)
      .map(ConnectUtil.mapExplorerWalletToWalletItem)

    return [
      ...(walletConnectWallet ? [walletConnectWallet] : []),
      ...injectedWallets,
      ...(injectedWallets.length === 0 ? recommendedWallets : [])
    ]
  },

  /**
   * Maps the WalletGuide explorer wallets to WalletItems including search results.
   * @returns The WalletItems for the WalletGuide explorer wallets.
   */
  getWalletConnectWallets(wcAllWallets: WcWallet[], wcSearchWallets: WcWallet[]) {
    if (wcSearchWallets.length > 0) {
      return wcSearchWallets.map(ConnectUtil.mapExplorerWalletToWalletItem)
    }

    return wcAllWallets.map(ConnectUtil.mapExplorerWalletToWalletItem)
  },

  /**
   * Maps the WalletConnect connector to a WalletItem.
   * @returns The WalletItem for the WalletConnect connector.
   */
  getWalletConnectWallet() {
    const connectors = ConnectorController.state.connectors
    const wcConnector = connectors.find(c => c.id === 'walletConnect')

    if (!wcConnector) {
      return null
    }

    return {
      id: wcConnector.id,
      connectors: [],
      name: wcConnector.name,
      imageUrl: AssetUtil.getAssetImageUrl(wcConnector.imageId),
      isInjected: false,
      isRecent: false,
      walletInfo: {}
    }
  },

  /**
   * Maps the injected connectors to WalletItems.
   * @returns The WalletItems for the injected connectors.
   */
  getInjectedWallets() {
    const items: WalletItem[] = []
    const connectors = ConnectorController.state.connectors
    const filteredConnectors = connectors.filter(
      c =>
        (c.type === 'INJECTED' || c.type === 'ANNOUNCED' || c.type === 'MULTI_CHAIN') &&
        c.name !== 'Browser Wallet' &&
        c.name !== 'WalletConnect'
    )

    filteredConnectors.forEach(connector => {
      const hasMultipleConnectors = connector.connectors?.length
      const connectors = hasMultipleConnectors
        ? connector.connectors?.map(c => ({
            id: c.id,
            chain: c.chain,
            chainImageUrl: AssetUtil.getChainNamespaceImageUrl(c.chain)
          })) || []
        : [
            {
              id: connector.id,
              chain: connector.chain,
              chainImageUrl: AssetUtil.getChainNamespaceImageUrl(connector.chain)
            }
          ]

      items.push({
        id: connector.id,
        connectors,
        name: connector.name,
        imageUrl: connector.imageUrl || '',
        isInjected: true,
        isRecent: false,
        walletInfo: {
          supportedNamespaces: connectors?.map(c => c.chain) || []
        }
      })
    })

    return items
  },

  /**
   * Maps the WalletGuide explorer wallet to a WalletItem.
   * @param w - The WalletGuide explorer wallet.
   * @returns The WalletItem for the WalletGuide explorer wallet.
   */
  mapExplorerWalletToWalletItem(w: WcWallet): WalletItem {
    return {
      id: w.id,
      connectors: [],
      name: w.name,
      imageUrl: AssetUtil.getWalletImageUrl(w.image_id),
      isInjected: false,
      isRecent: false,
      walletInfo: {
        description: w.description,
        supportedChains: w.chains,
        website: w.homepage,
        installationLinks: {
          appStore: w.app_store,
          playStore: w.play_store,
          chromeStore: w.chrome_store,
          desktopLink: w.desktop_link
        },
        deepLink: w.mobile_link,
        isCertified: w.badge_type === 'certified'
      }
    }
  }
}
