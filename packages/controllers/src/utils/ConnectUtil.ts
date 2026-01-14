import type { ChainNamespace } from '@reown/appkit-common'

import { AssetUtil } from './AssetUtil.js'
import { ConnectorUtil } from './ConnectorUtil.js'
import type { ConnectorItemWithKind, ConnectorWithProviders, WcWallet } from './TypeUtil.js'
import { WalletUtil } from './WalletUtil.js'

// --- Types --------------------------------------------- //
export type WalletItem = {
  id: string
  name: string
  imageUrl: string
  imageId?: string
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
    linkMode?: WcWallet['link_mode']
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
    return ConnectorUtil.connectorList()
      .map(connector => {
        if (connector.kind === 'connector') {
          return this.mapConnectorToWalletItem(connector.connector, connector.subtype)
        } else if (connector.kind === 'wallet') {
          return this.mapWalletToWalletItem(connector.wallet)
        }

        return null
      })
      .filter(Boolean) as WalletItem[]
  },

  /**
   * Maps the WalletGuide explorer wallets to WalletItems including search results.
   * @returns The WalletItems for the WalletGuide explorer wallets.
   */
  getWalletConnectWallets(wcAllWallets: WcWallet[], wcSearchWallets: WcWallet[]) {
    if (wcSearchWallets.length > 0) {
      return wcSearchWallets.map(ConnectUtil.mapWalletToWalletItem)
    }

    return WalletUtil.getWalletConnectWallets(wcAllWallets).map(ConnectUtil.mapWalletToWalletItem)
  },

  /**
   * Maps the connector to a WalletItem.
   * @param connector - The connector to map to a WalletItem.
   * @param subType - The subtype of the connector.
   * @returns The WalletItem for the connector.
   */
  mapConnectorToWalletItem(
    connector: ConnectorWithProviders,
    subType: ConnectorItemWithKind['subtype']
  ): WalletItem {
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

    return {
      id: connector.id,
      connectors: subType === 'walletConnect' ? [] : connectors,
      name: connector.name,
      imageUrl: connector.imageUrl || AssetUtil.getAssetImageUrl(connector.imageId),
      imageId: connector.imageId,
      isInjected: subType !== 'walletConnect',
      isRecent: false,
      walletInfo: {}
    }
  },

  /**
   * Maps the WalletGuide explorer wallet to a WalletItem.
   * @param w - The WalletGuide explorer wallet.
   * @returns The WalletItem for the WalletGuide explorer wallet.
   */
  mapWalletToWalletItem(w: WcWallet): WalletItem {
    return {
      id: w.id,
      connectors: [],
      name: w.name,
      imageUrl: AssetUtil.getWalletImageUrl(w.image_id),
      imageId: w.image_id,
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
        linkMode: w.link_mode,
        isCertified: w.badge_type === 'certified'
      }
    }
  },

  /**
   * Maps the WalletItem to a Wallet Guide Wallet.
   * @param wallet - The WalletItem to map to a Wallet Guide Wallet.
   * @returns The Wallet Guide Wallet for the WalletItem.
   */
  mapWalletItemToWcWallet(wallet: WalletItem): WcWallet {
    return {
      id: wallet.id,
      name: wallet.name,
      image_id: wallet.imageId,
      image_url: wallet.imageUrl,
      description: wallet.walletInfo.description,
      mobile_link: wallet.walletInfo.deepLink,
      link_mode: wallet.walletInfo.linkMode ?? null
    }
  }
}
