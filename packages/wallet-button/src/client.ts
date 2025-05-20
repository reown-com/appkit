import {
  type Connector,
  ConnectorController,
  ConnectorControllerUtil
} from '@reown/appkit-controllers'

import { ApiController } from './controllers/ApiController.js'
import { WalletButtonController } from './controllers/WalletButtonController.js'
import { ConstantsUtil } from './utils/ConstantsUtil.js'
import type { SocialProvider, Wallet } from './utils/TypeUtil.js'
import { WalletUtil } from './utils/WalletUtil.js'

export class AppKitWalletButton {
  constructor() {
    if (!this.isReady()) {
      ApiController.fetchWalletButtons().then(() => {
        if (ApiController.state.walletButtons.length) {
          WalletButtonController.setReady(true)
        }
      })
    }
  }

  public isReady() {
    return WalletButtonController.state.ready
  }

  public subscribeIsReady(callback: ({ isReady }: { isReady: boolean }) => void) {
    ApiController.subscribeKey('walletButtons', val => {
      if (val.length) {
        WalletButtonController.setReady(true)
        callback({ isReady: true })
      } else {
        callback({ isReady: false })
      }
    })
  }

  async connect(wallet: Wallet) {
    const connectors = ConnectorController.state.connectors

    if (wallet === ConstantsUtil.Email) {
      return ConnectorControllerUtil.connectEmail()
    }

    if (ConstantsUtil.Socials.some(social => social === wallet)) {
      return ConnectorControllerUtil.connectSocial(wallet as SocialProvider)
    }

    const walletButton = WalletUtil.getWalletButton(wallet)

    const connector = walletButton
      ? ConnectorController.getConnector(walletButton.id, walletButton.rdns)
      : undefined

    if (connector) {
      return ConnectorControllerUtil.connectExternal(connector)
    }

    return ConnectorControllerUtil.connectWalletConnect({
      walletConnect: wallet === 'walletConnect',
      connector: connectors.find(c => c.id === 'walletConnect') as Connector | undefined,
      wallet: walletButton
    })
  }

  async updateEmail() {
    return ConnectorControllerUtil.updateEmail()
  }
}
