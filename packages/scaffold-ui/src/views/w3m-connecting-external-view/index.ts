import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import type { BaseError } from '@reown/appkit-controllers'
import {
  ChainController,
  ConnectionController,
  EventsController,
  ModalController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'

import { W3mConnectingWidget } from '../../utils/w3m-connecting-widget/index.js'

@customElement('w3m-connecting-external-view')
export class W3mConnectingExternalView extends W3mConnectingWidget {
  // -- Members ------------------------------------------- //
  private externalViewUnsubscribe: (() => void)[] = []

  public constructor() {
    super()
    if (!this.connector) {
      throw new Error('w3m-connecting-view: No connector provided')
    }

    EventsController.sendEvent({
      type: 'track',
      event: 'SELECT_WALLET',
      properties: {
        name: this.connector.name ?? 'Unknown',
        platform: 'browser'
      }
    })
    this.onConnect = this.onConnectProxy.bind(this)
    this.onAutoConnect = this.onConnectProxy.bind(this)
    this.isWalletConnect = false
    this.externalViewUnsubscribe.push(
      ChainController.subscribeKey('activeCaipAddress', val => {
        if (val) {
          ModalController.close()
        }
      })
    )
  }

  public override disconnectedCallback() {
    this.externalViewUnsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Private ------------------------------------------- //
  private async onConnectProxy() {
    try {
      this.error = false
      if (this.connector) {
        /**
         * Coinbase SDK works with popups and popups requires user interaction to be opened since modern browsers block popups which triggered programmatically.
         * Instead of opening a popup in first render for `W3mConnectingWidget`, we need to trigger connection for Coinbase connector specifically when users select it.
         * And if there is an error, this condition will be skipped and the connection will be triggered as usual because we have `Try again` button in this view which is a user interaction as well.
         */
        if (this.connector.id !== CommonConstantsUtil.CONNECTOR_ID.COINBASE_SDK || !this.error) {
          await ConnectionController.connectExternal(this.connector, this.connector.chain)

          EventsController.sendEvent({
            type: 'track',
            event: 'CONNECT_SUCCESS',
            properties: { method: 'browser', name: this.connector.name || 'Unknown' }
          })
        }
      }
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
    'w3m-connecting-external-view': W3mConnectingExternalView
  }
}
