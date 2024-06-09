import type { BaseError } from '@web3modal/core'
import {
  ConnectionController,
  EventsController,
  ModalController,
  RouterController,
  StorageUtil
} from '@web3modal/core'
import { customElement } from '@web3modal/ui'
import { W3mConnectingWidget } from '../../utils/w3m-connecting-widget/index.js'

@customElement('w3m-connecting-external-view')
export class W3mConnectingExternalView extends W3mConnectingWidget {
  // -- Members ------------------------------------------- //
  protected readonly chainToConnect = RouterController.state.data?.chainToConnect

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
  }

  // -- Private ------------------------------------------- //
  private async onConnectProxy() {
    try {
      this.error = false
      if (this.connector) {
        if (this.connector.imageUrl) {
          StorageUtil.setConnectedWalletImageUrl(this.connector.imageUrl)
        }
        console.log(
          '>>> ConnectionController.connectExternal: ',
          this.connector,
          this.chainToConnect
        )
        await ConnectionController.connectExternal(this.connector, this.chainToConnect)

        // if (OptionsController.state.isSiweEnabled) {
        //   RouterController.push('ConnectingSiwe')
        // } else {
        // }
        ModalController.close()

        EventsController.sendEvent({
          type: 'track',
          event: 'CONNECT_SUCCESS',
          properties: { method: 'browser', name: this.connector.name || 'Unknown' }
        })
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
