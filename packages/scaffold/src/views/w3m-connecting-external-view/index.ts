import { ConnectionController, ModalController } from '@web3modal/core'
import { customElement } from 'lit/decorators.js'
import { W3mConnectingWidget } from '../../utils/w3m-connecting-widget/index.js'

@customElement('w3m-connecting-external-view')
export class W3mConnectingExternalView extends W3mConnectingWidget {
  public constructor() {
    super()
    if (!this.connector) {
      throw new Error('w3m-connecting-view: No connector provided')
    }
    this.onConnect = this.onConnectProxy.bind(this)
    this.onAutoConnect = this.onConnectProxy.bind(this)
    this.isWalletConnect = false
  }

  // -- Private ------------------------------------------- //
  private async onConnectProxy() {
    try {
      this.error = false
      if (this.connector) {
        await ConnectionController.connectExternal(this.connector.id)
        ModalController.close()
      }
    } catch {
      this.error = true
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-external-view': W3mConnectingExternalView
  }
}
