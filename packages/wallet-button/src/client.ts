import type { ChainNamespace } from '@reown/appkit-common'
import {
  ChainController,
  type Connector,
  ConnectorController,
  ConnectorControllerUtil,
  ModalController,
  RouterController
} from '@reown/appkit-controllers'

import { ApiController } from './controllers/ApiController.js'
import { WalletButtonController } from './controllers/WalletButtonController.js'
import { ConstantsUtil } from './utils/ConstantsUtil.js'
import type { SocialProvider, Wallet } from './utils/TypeUtil.js'
import { WalletUtil } from './utils/WalletUtil.js'

export class AppKitWalletButton {
  private namespace?: ChainNamespace

  constructor({ namespace }: { namespace?: ChainNamespace } = {}) {
    this.namespace = namespace

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
    const namespace = this.namespace || ChainController.state.activeChain
    const connectors = ConnectorController.state.connectors

    if (!namespace) {
      throw new Error('Namespace not found')
    }

    if (wallet === ConstantsUtil.Email) {
      return ConnectorControllerUtil.connectEmail({
        namespace,
        onOpen() {
          ModalController.open().then(() => RouterController.push('EmailLogin'))
        },
        onConnect() {
          RouterController.push('Connect')
        }
      })
    }

    if (ConstantsUtil.Socials.some(social => social === wallet)) {
      return ConnectorControllerUtil.connectSocial({
        social: wallet as SocialProvider,
        namespace,
        onOpenFarcaster() {
          ModalController.open({ view: 'ConnectingFarcaster' })
        },
        onConnect() {
          RouterController.push('Connect')
        }
      })
    }

    const walletButton = WalletUtil.getWalletButton(wallet)

    const connector = walletButton
      ? ConnectorController.getConnector({ id: walletButton.id, namespace })
      : undefined

    if (connector && connector.type !== 'AUTH') {
      return ConnectorControllerUtil.connectExternal(connector)
    }

    return ConnectorControllerUtil.connectWalletConnect({
      walletConnect: wallet === 'walletConnect',
      connector: connectors.find(c => c.id === 'walletConnect') as Connector | undefined,
      onOpen(isMobile) {
        ModalController.open().then(() => {
          if (isMobile) {
            RouterController.push('AllWallets')
          } else {
            RouterController.push('ConnectingWalletConnect', {
              wallet: walletButton
            })
          }
        })
      },
      onConnect() {
        RouterController.replace('Connect')
      }
    })
  }

  async updateEmail() {
    return ConnectorControllerUtil.updateEmail()
  }
}
