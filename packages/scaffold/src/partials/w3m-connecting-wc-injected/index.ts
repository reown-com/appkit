import type { BaseError } from '@web3modal/core'
import { ConnectionController, EventsController, ModalController } from '@web3modal/core'
import { customElement } from 'lit/decorators.js'
import { W3mConnectingWidget } from '../../utils/w3m-connecting-widget/index.js'

@customElement('w3m-connecting-wc-injected')
export class W3mConnectingWcInjected extends W3mConnectingWidget {
  public constructor() {
    super()
    if (!this.wallet) {
      throw new Error('w3m-connecting-wc-injected: No wallet provided')
    }
    this.onConnect = this.onConnectProxy.bind(this)
    this.onAutoConnect = this.onConnectProxy.bind(this)
    EventsController.sendEvent({
      type: 'SYSTEM',
      name: 'SELECT_WALLET',
      data: { name: this.wallet.name, platform: 'injected' }
    })
  }

  // -- Private ------------------------------------------- //
  private async onConnectProxy() {
    try {
      this.error = false
      await ConnectionController.connectExternal({ id: 'injected' })
      ModalController.close()
    } catch (error) {
      EventsController.sendEvent({
        type: 'SYSTEM',
        name: 'CONNECT_ERROR',
        data: { message: (error as BaseError)?.message ?? 'Unknown' }
      })
      this.error = true
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-wc-injected': W3mConnectingWcInjected
  }
}
