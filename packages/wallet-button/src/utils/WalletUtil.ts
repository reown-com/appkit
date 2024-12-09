import { ApiController } from '../controllers/ApiController.js'
import { ConstantsUtil } from './ConstantsUtil.js'

export const WalletUtil = {
  getWalletButton(wallet: string) {
    const walletButtonIds = ConstantsUtil.WalletButtonsIds

    if (wallet in walletButtonIds) {
      return ApiController.state.walletButtons.find(
        walletButton => walletButton.id === walletButtonIds[wallet as keyof typeof walletButtonIds]
      )
    }

    return undefined
  },
  isWalletButtonReady(wallet: string) {
    if (wallet in ConstantsUtil.WalletButtonsIds) {
      return Boolean(WalletUtil.getWalletButton(wallet))
    }

    return true
  }
}
