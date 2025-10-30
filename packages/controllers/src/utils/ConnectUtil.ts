import type { ChainNamespace } from '@reown/appkit-common'

import { ConnectorController } from '../controllers/ConnectorController.js'
import type { WcWallet } from './TypeUtil.js'

// --- Utils --------------------------------------------- //
function getImageCDN(imageId: string) {
  return `https://imagedelivery.net/_aTEfDRm7z3tKgu9JhfeKA/${imageId}/md`
}

// --- Types --------------------------------------------- //
export type WalletItem = {
  id: string
  name: string
  imageUrl: string
  connectors: {
    id: string
    rdns?: string
    chain: ChainNamespace
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
   * Transforms connectors and wallets into a unified list of wallet items
   */
  getUnifiedWalletList(params: { wcWallets: WcWallet[]; search: WcWallet[] }): WalletItem[] {
    const connectors = ConnectorController.state.connectors
    const items: WalletItem[] = []
    const wallets = params.search?.length > 0 ? params.search : params.wcWallets

    const wcConnector = connectors.find(c => c.id === 'walletConnect')
    const filteredConnectors = connectors.filter(
      c => c.type !== 'AUTH' && c.name !== 'Browser Wallet' && c.id !== wcConnector?.id
    )

    filteredConnectors.forEach(connector => {
      const hasMultipleConnectors = connector.connectors?.length
      const connectors = hasMultipleConnectors
        ? connector.connectors?.map(c => ({ id: c.id, chain: c.chain })) || []
        : [connector]

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

    if (wcConnector) {
      items.push({
        id: wcConnector.id,
        connectors: [],
        name: wcConnector.name,
        imageUrl: wcConnector.imageId ? getImageCDN(wcConnector.imageId) : '',
        isInjected: false,
        isRecent: false,
        walletInfo: {}
      })
    }

    wallets.forEach(w => {
      items.push({
        id: w.id,
        connectors: [],
        name: w.name,
        imageUrl: w.image_id ? getImageCDN(w.image_id) : '',
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
      })
    })

    return items
  }
}
