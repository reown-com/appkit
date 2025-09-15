import { ErrorUtil } from '@reown/appkit-common'
import type { BaseError } from '@reown/appkit-controllers'
import {
  AppKitError,
  ConnectionController,
  ConnectorController,
  EventsController,
  ModalController,
  RouterController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'

import { W3mConnectingWidget } from '../../utils/w3m-connecting-widget/index.js'

@customElement('w3m-connecting-wc-browser')
export class W3mConnectingWcBrowser extends W3mConnectingWidget {
  public constructor() {
    super()
    if (!this.wallet) {
      throw new Error('w3m-connecting-wc-browser: No wallet provided')
    }
    this.onConnect = this.onConnectProxy.bind(this)
    this.onAutoConnect = this.onConnectProxy.bind(this)
    EventsController.sendEvent({
      type: 'track',
      event: 'SELECT_WALLET',
      properties: {
        name: this.wallet.name,
        platform: 'browser',
        displayIndex: this.wallet?.display_index,
        walletRank: this.wallet.order,
        view: RouterController.state.view
      }
    })
  }

  // -- Private ------------------------------------------- //
  private async onConnectProxy() {
    try {
      this.error = false
      const { connectors } = ConnectorController.state

      const connector = connectors.find(
        c =>
          (c.type === 'ANNOUNCED' && c.info?.rdns === this.wallet?.rdns) ||
          c.type === 'INJECTED' ||
          c.name === this.wallet?.name
      )

      if (connector) {
        await ConnectionController.connectExternal(connector, connector.chain)
      } else {
        throw new Error('w3m-connecting-wc-browser: No connector found')
      }

      ModalController.close()

      EventsController.sendEvent({
        type: 'track',
        event: 'CONNECT_SUCCESS',
        properties: {
          method: 'browser',
          name: this.wallet?.name || 'Unknown',
          view: RouterController.state.view,
          walletRank: this.wallet?.order
        }
      })
    } catch (error) {
      const isUserRejectedRequestError =
        error instanceof AppKitError &&
        error.originalName === ErrorUtil.PROVIDER_RPC_ERROR_NAME.USER_REJECTED_REQUEST

      if (isUserRejectedRequestError) {
        EventsController.sendEvent({
          type: 'track',
          event: 'USER_REJECTED',
          properties: { message: error.message }
        })
      } else {
        EventsController.sendEvent({
          type: 'track',
          event: 'CONNECT_ERROR',
          properties: { message: (error as BaseError)?.message ?? 'Unknown' }
        })
      }

      this.error = true
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-wc-browser': W3mConnectingWcBrowser
  }
}
