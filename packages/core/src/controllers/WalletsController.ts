import z from 'zod'

import { StorageUtil } from '../utils/StorageUtil.js'

const walletSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  icon: z.string(),
  type: z.string(),
  namespace: z.string()
})
export const walletsSchema = z.array(walletSchema)

export type Wallet = z.infer<typeof walletSchema>
export type Wallets = z.infer<typeof walletsSchema>

export const WalletsController = {
  addWallet(wallet: Wallet) {
    try {
      const wallets = this.getWallets()

      wallets.push(walletSchema.parse(wallet))

      this.setWallets(wallets)
    } catch {
      // eslint-disable-next-line no-console
      console.error('Unable to add wallet')
    }
  },

  removeWallet(id: string) {
    const wallets = this.getWallets()
    const filteredWallets = wallets ? wallets.filter(wallet => wallet.id !== id) : []

    StorageUtil.setWallets(filteredWallets)
  },

  setWallets(wallets: Wallets) {
    try {
      StorageUtil.setWallets(walletsSchema.parse(wallets))
    } catch {
      // eslint-disable-next-line no-console
      console.error('Unable to set wallets')
    }
  },

  getWallets() {
    try {
      const wallets = StorageUtil.getWallets()

      return walletsSchema.parse(wallets)
    } catch {
      // eslint-disable-next-line no-console
      console.error('Unable to get wallets')

      StorageUtil.clearWallets()

      return []
    }
  },

  clearWallets() {
    StorageUtil.clearWallets()
  }
}
