import type { ChainNamespace, CaipNetwork } from '@reown/appkit-common'
import { ApiController } from '../controllers/ApiController.js'
import { AssetController } from '../controllers/AssetController.js'
import type { Connector, WcWallet } from './TypeUtil.js'

const namespaceImageIds: Record<ChainNamespace, string> = {
  // Ethereum
  eip155: 'ba0ba0cd-17c6-4806-ad93-f9d174f17900',
  // Solana
  solana: 'a1b58899-f671-4276-6a5e-56ca5bd59700',
  // Polkadot
  polkadot: '',
  // Bitcoin
  bip122: ''
}

export const AssetUtil = {
  async fetchWalletImage(imageId?: string) {
    if (!imageId) {
      return undefined
    }

    await ApiController._fetchWalletImage(imageId)

    return this.getWalletImageById(imageId)
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
