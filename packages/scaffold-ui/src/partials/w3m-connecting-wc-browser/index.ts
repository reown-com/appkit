import type { BaseError } from '@web3modal/core'
import {
  ConnectionController,
  ConnectorController,
  EventsController,
  ModalController
} from '@web3modal/core'
import { customElement } from '@web3modal/ui'
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
      properties: { name: this.wallet.name, platform: 'browser' }
    })
  }

  // -- Private ------------------------------------------- //
  private async onConnectProxy() {
    try {
      this.error = false
      const { connectors } = ConnectorController.state
      const announcedConnector = connectors.find(
        c => c.type === 'ANNOUNCED' && c.info?.rdns === this.wallet?.rdns
      )
      const injectedConnector = connectors.find(c => c.type === 'INJECTED')
      if (announcedConnector) {
        await ConnectionController.connectExternal(announcedConnector)
      } else if (injectedConnector) {
        await ConnectionController.connectExternal(injectedConnector)
      }
      ModalController.close()

      EventsController.sendEvent({
        type: 'track',
        event: 'CONNECT_SUCCESS',
        properties: { method: 'browser', name: this.wallet?.name || 'Unknown' }
      })
    } catch (error) {
      EventsController.sendEvent({
        type: 'track',
        event: 'CONNECT_ERROR',
        properties: { message: (error as BaseError)?.message ?? 'Unknown' }
      })
      this.error = true
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-wc-browser': W3mConnectingWcBrowser
  }
}
