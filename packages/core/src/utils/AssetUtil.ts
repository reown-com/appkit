import { AssetController } from '../controllers/AssetController.js'

export const AssetUtil = {
  getWalletImage(imageId?: string) {
    return imageId ? AssetController.state.walletImages[imageId] : undefined
  },

  getNetworkImage(imageId?: string) {
    return imageId ? AssetController.state.networkImages[imageId] : undefined
  }
}
