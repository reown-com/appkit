import { AssetUtil, ConnectionController, ModalController } from '@web3modal/core'
import { html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { WcConnectingLitElement } from '../../utils/WcConnectingLitElement.js'

@customElement('w3m-connecting-wc-injected')
export class W3mConnectingWcInjected extends WcConnectingLitElement {
  // -- Render -------------------------------------------- //
  public override render() {
    if (!this.wallet) {
      throw new Error('w3m-connecting-wc-injected: No wallet provided')
    }

    return html`
      <w3m-connecting-widget
        name=${this.wallet.name}
        imageSrc=${ifDefined(AssetUtil.getWalletImage(this.wallet.image_id))}
        .error=${Boolean(this.error)}
        .onConnect=${this.onConnect.bind(this)}
      ></w3m-connecting-widget>
    `
  }

  // -- Private ------------------------------------------- //
  private async onConnect() {
    try {
      this.error = false
      await ConnectionController.connectExternal('injected')
      ModalController.close()
    } catch {
      this.error = true
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-wc-injected': W3mConnectingWcInjected
  }
}
