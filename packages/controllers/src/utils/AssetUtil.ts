import { proxy } from 'valtio/vanilla'

import type { CaipNetwork, ChainNamespace } from '@reown/appkit-common'

import { ApiController } from '../controllers/ApiController.js'
import { AssetController } from '../controllers/AssetController.js'
import type { Connector, WcWallet } from './TypeUtil.js'

// -- Types --------------------------------------------- //
export interface AssetUtilState {
  networkImagePromises: Record<string, Promise<void>>
}

// -- Constants ----------------------------------------- //
const WALLET_EXPLORER_IDS = {
  METAMASK: 'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96',
  TRUST_WALLET: '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',
  OKX: '971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709'
}

const WALLET_NAMES = {
  METAMASK: 'MetaMask',
  TRUST_WALLET: 'Trust Wallet',
  OKX_WALLET: 'OKX Wallet',
  OKX: 'OKX'
}

const namespaceImageIds: Record<ChainNamespace, string> = {
  // Ethereum
  eip155: 'ba0ba0cd-17c6-4806-ad93-f9d174f17900',
  // Solana
  solana: 'a1b58899-f671-4276-6a5e-56ca5bd59700',
  // Polkadot
  polkadot: '',
  // Bitcoin
  bip122: '0b4838db-0161-4ffe-022d-532bf03dba00',
  cosmos: ''
}

// -- State --------------------------------------------- //
const state = proxy<AssetUtilState>({
  networkImagePromises: {}
})

// -- Util ---------------------------------------- //
export const AssetUtil = {
  async fetchWalletImage(imageId?: string) {
    if (!imageId) {
      return undefined
    }

    await ApiController._fetchWalletImage(imageId)

    return this.getWalletImageById(imageId)
  },
  
  async prefetchSpecificWalletImages() {
    const explorerIds = [
      WALLET_EXPLORER_IDS.METAMASK,
      WALLET_EXPLORER_IDS.TRUST_WALLET,
      WALLET_EXPLORER_IDS.OKX
    ]
    
    await Promise.allSettled(
      explorerIds.filter(Boolean).map(id => this.fetchWalletImage(id))
    )
  },

  async fetchNetworkImage(imageId?: string) {
    if (!imageId) {
      return undefined
    }

    const existingImage = this.getNetworkImageById(imageId)

    // Check if the image already exists
    if (existingImage) {
      return existingImage
    }

    // Check if the promise is already created
    if (!state.networkImagePromises[imageId]) {
      state.networkImagePromises[imageId] = ApiController._fetchNetworkImage(imageId)
    }

    await state.networkImagePromises[imageId]

    return this.getNetworkImageById(imageId)
  },

  getWalletImageById(imageId?: string) {
    if (!imageId) {
      return undefined
    }

    return AssetController.state.walletImages[imageId]
  },

  getWalletImage(wallet?: WcWallet) {
    if (wallet?.image_url) {
      return wallet?.image_url
    }

    if (wallet?.image_id) {
      return AssetController.state.walletImages[wallet.image_id]
    }

    return undefined
  },

  getNetworkImage(network?: CaipNetwork) {
    if (network?.assets?.imageUrl) {
      return network?.assets?.imageUrl
    }

    if (network?.assets?.imageId) {
      return AssetController.state.networkImages[network.assets.imageId]
    }

    return undefined
  },

  getNetworkImageById(imageId?: string) {
    if (!imageId) {
      return undefined
    }

    return AssetController.state.networkImages[imageId]
  },

  getConnectorImage(connector?: Connector) {
    if (connector?.name) {
      if (connector.name === WALLET_NAMES.METAMASK) {
        return AssetController.state.walletImages[WALLET_EXPLORER_IDS.METAMASK] || connector.imageUrl
      }
      
      if (connector.name === WALLET_NAMES.TRUST_WALLET) {
        return AssetController.state.walletImages[WALLET_EXPLORER_IDS.TRUST_WALLET] || connector.imageUrl
      }
      
      if (connector.name === WALLET_NAMES.OKX_WALLET || connector.name === WALLET_NAMES.OKX) {
        return AssetController.state.walletImages[WALLET_EXPLORER_IDS.OKX] || connector.imageUrl
      }
    }
    
    if (connector?.imageUrl) {
      return connector.imageUrl
    }

    if (connector?.imageId) {
      return AssetController.state.connectorImages[connector.imageId]
    }

    return undefined
  },

  getChainImage(chain: ChainNamespace) {
    return AssetController.state.networkImages[namespaceImageIds[chain]]
  }
}
