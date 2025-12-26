import { proxy } from 'valtio/vanilla'

import type { CaipNetwork, ChainNamespace } from '@reown/appkit-common'
import { ConstantsUtil } from '@reown/appkit-common'

import { ApiController } from '../controllers/ApiController.js'
import { AssetController } from '../controllers/AssetController.js'
import { OptionsController } from '../controllers/OptionsController.js'
import type { Connector, WcWallet } from './TypeUtil.js'

// -- Types --------------------------------------------- //
export interface AssetUtilState {
  networkImagePromises: Record<string, Promise<void>>
  tokenImagePromises: Record<string, Promise<void>>
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
  // Cosmos
  cosmos: '',
  // Sui
  sui: '',
  // Stacks
  stacks: '',
  // TON
  ton: '20f673c0-095e-49b2-07cf-eb5049dcf600'
}

// -- State --------------------------------------------- //
const state = proxy<AssetUtilState>({
  networkImagePromises: {},
  tokenImagePromises: {}
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

  /**
   * Fetches the token image for the given image ID.
   * @param imageId - The image id of the token.
   * @returns The token image.
   */
  async fetchTokenImage(imageId?: string) {
    if (!imageId) {
      return undefined
    }

    if (!state.tokenImagePromises[imageId]) {
      state.tokenImagePromises[imageId] = ApiController._fetchTokenImage(imageId)
    }

    await state.tokenImagePromises[imageId]

    return this.getTokenImage(imageId)
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

    if (connector?.info?.icon) {
      return connector.info.icon
    }

    if (connector?.imageId) {
      return AssetController.state.connectorImages[connector.imageId]
    }

    return undefined
  },

  getChainImage(chain: ChainNamespace) {
    return AssetController.state.networkImages[namespaceImageIds[chain]]
  },

  getTokenImage(symbol?: string) {
    if (!symbol) {
      return undefined
    }

    return AssetController.state.tokenImages[symbol]
  },

  /**
   * Get the explorer wallet's image URL for the given image ID.
   * @param imageId - The image id of the wallet.
   * @returns The image URL for the wallet.
   */
  getWalletImageUrl(imageId: string | undefined) {
    if (!imageId) {
      return ''
    }

    const { projectId, sdkType, sdkVersion } = OptionsController.state

    const url = new URL(`${ConstantsUtil.W3M_API_URL}/getWalletImage/${imageId}`)
    url.searchParams.set('projectId', projectId)
    url.searchParams.set('st', sdkType)
    url.searchParams.set('sv', sdkVersion)

    return url.toString()
  },

  /**
   * Get the public asset's image URL with the given image ID.
   * @param imageId - The image id of the asset.
   * @returns The image URL for the asset.
   */
  getAssetImageUrl(imageId: string | undefined) {
    if (!imageId) {
      return ''
    }

    const { projectId, sdkType, sdkVersion } = OptionsController.state

    const url = new URL(`${ConstantsUtil.W3M_API_URL}/public/getAssetImage/${imageId}`)
    url.searchParams.set('projectId', projectId)
    url.searchParams.set('st', sdkType)
    url.searchParams.set('sv', sdkVersion)

    return url.toString()
  },

  /**
   * Get the image URL for the given chain namespace.
   * @param chainNamespace - The chain namespace to get the image URL for.
   * @returns The image URL for the chain namespace.
   */
  getChainNamespaceImageUrl(chainNamespace: ChainNamespace) {
    return this.getAssetImageUrl(namespaceImageIds[chainNamespace])
  },

  /**
   * Get the image id for the given token and namespace.
   * @param token - The token address or 'native' to get the image id for.
   * @param namespace - The namespace to get the image id for.
   * @returns The image URL for the token.
   */
  async getImageByToken(token: string, namespace: ChainNamespace) {
    if (token === 'native') {
      const imageId =
        ConstantsUtil.NATIVE_IMAGE_IDS_BY_NAMESPACE[
          namespace as keyof typeof ConstantsUtil.NATIVE_IMAGE_IDS_BY_NAMESPACE
        ] ?? null

      if (!imageId) {
        return undefined
      }

      return AssetUtil.fetchNetworkImage(imageId)
    }

    const [, symbol] =
      Object.entries(ConstantsUtil.TOKEN_SYMBOLS_BY_ADDRESS).find(
        ([address]) => address.toLowerCase() === token.toLowerCase()
      ) ?? []

    if (!symbol) {
      return undefined
    }

    return AssetUtil.fetchTokenImage(symbol)
  }
}
