import { Core } from '@walletconnect/core'

import { WalletKit } from '@reown/walletkit'

const core = new Core({
  projectId: '1b0841d0acfe3e32dcb0d53dbf505bdd'
})

export class WalletConnect {
  private walletKit?: Awaited<ReturnType<typeof WalletKit.init>>

  private async init() {
    this.walletKit = await WalletKit.init({
      core,
      metadata: {
        name: 'Demo app',
        description: 'Demo Client as Wallet/Peer',
        url: 'https://reown.com/walletkit',
        icons: []
      }
    })
  }

  public async connect() {
    if (!this.walletKit) {
      throw new Error('WalletKit not initialized')
    }
  }

  public async disconnect() {
    if (!this.walletKit) {
      throw new Error('WalletKit not initialized')
    }
  }
}
