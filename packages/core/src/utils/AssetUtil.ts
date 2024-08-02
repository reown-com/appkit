import type { Chain } from '@web3modal/common'
import { AssetController } from '../controllers/AssetController.js'
import type { CaipNetwork, Connector, WcWallet } from './TypeUtil.js'

const chainImageIds: Record<Chain, string> = {
  // Ethereum
  evm: 'ba0ba0cd-17c6-4806-ad93-f9d174f17900',
  // Solana
  solana: 'a1b58899-f671-4276-6a5e-56ca5bd59700'
}

export const AssetUtil = {
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
    if (network?.imageUrl) {
      return network?.imageUrl
    }

    if (network?.imageId) {
      return AssetController.state.networkImages[network.imageId]
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

  getChainImage(chain: Chain) {
    return AssetController.state.networkImages[chainImageIds[chain]]
  }
}
