import { ClientCtrl } from '../statefull/ClientCtrl'

export const SnsCtrl = {
  async fetchFavoriteDomain(address: string) {
    return ClientCtrl.solana().fetchName(address)
  }
}
