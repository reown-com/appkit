import { AssetUtil, ConnectionController, ModalController, RouterController } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

@customElement('w3m-connecting-wc-injected')
export class W3mConnectingWcInjected extends LitElement {
  // -- Members ------------------------------------------- //
  private readonly wallet = RouterController.state.data?.wallet

  // -- State & Properties -------------------------------- //
  @state() private error = false

  @property({ type: Boolean }) public multiPlatfrom = false

  // -- Render -------------------------------------------- //
  public override render() {
    if (!this.wallet) {
      throw new Error('w3m-connecting-wc-injected: No wallet provided')
    }

    return html`
      <w3m-connecting-widget
        name=${this.wallet.name}
        imageSrc=${ifDefined(AssetUtil.getWalletImage(this.wallet.image_id))}
        .error=${this.error}
        .onConnect=${this.onConnect.bind(this)}
      ></w3m-connecting-widget>
    `
  }

  // -- Private ------------------------------------------- //
  private async onConnect() {
    try {
      this.error = false
      await ConnectionController.connectInjected()
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
