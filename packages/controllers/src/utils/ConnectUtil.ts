import type { Chain } from 'viem'

import type { ChainNamespace } from '@reown/appkit-common'

import { ApiController } from '../controllers/ApiController.js'
import { ConnectorController } from '../controllers/ConnectorController.js'
import type { ConnectorWithProviders, WcWallet } from './TypeUtil.js'

// -- Types --------------------------------------------- //

function getImageCDN(imageId: string) {
  return `https://imagedelivery.net/_aTEfDRm7z3tKgu9JhfeKA/${imageId}/md`
}

/**
 * Unified wallet item type that can be either a connector or a WalletConnect wallet
 */
export type WalletItem2 = {
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

export type WalletItem =
  | {
      type: 'connector'
      connector: ConnectorWithProviders
    }
  | {
      wallet: WcWallet
      type: 'wallet'
    }

// -- Main Export --------------------------------------- //

export const ConnectUtil = {
  /**
   * Transforms connectors and wallets into a unified list of wallet items
   */
  getUnifiedWalletList(): WalletItem2[] {
    const connectors = ConnectorController.state.connectors
    const wallets = ApiController.state.wallets
    const items: WalletItem2[] = []

    const filteredConnectors = connectors.filter(c => c.type !== 'AUTH')

    // Add WalletConnect connector (desktop only)
    filteredConnectors.map(connector => {
      items.push({
        id: connector.id,
        connectors:
          connector.connectors?.map(c => ({
            id: c.id,
            rdns: c.info?.rdns,
            chain: c.chain
          })) || [],
        name: connector.name,
        imageUrl: connector.imageUrl || '',
        isInjected: true,
        isRecent: false,
        walletInfo: {
          supportedNamespaces: connector.connectors?.map(c => c.chain) || []
        }
      })
    })

    wallets.map(w => {
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
