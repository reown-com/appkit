import { ApiController } from '../controllers/ApiController.js'
import type { WcWallet } from './TypeUtil.js'

// -- Utils ------------------------------------------ //
export const ApiControllerUtil = {
  /**
   * Finds a wallet by ID across all wallet arrays (wallets, recommended, featured, search, etc.)
   * This is useful when a wallet might be in different arrays depending on the context
   */
  getWalletById(walletId: string | undefined): WcWallet | undefined {
    if (!walletId) {
      return undefined
    }

    const { state } = ApiController

    // Search in order of most likely locations first
    const searchArrays = [
      state.search,
      state.recommended,
      state.allRecommended,
      state.featured,
      state.allFeatured,
      state.wallets,
      state.filteredWallets,
      state.explorerWallets,
      state.explorerFilteredWallets
    ]

    for (const walletArray of searchArrays) {
      const wallet = walletArray.find(w => w.id === walletId)

      if (wallet) {
        return wallet
      }
    }

    return undefined
  }
}
