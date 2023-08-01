import { ConnectionController, ModalController, RouterController } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

@customElement('w3m-connecting-external-view')
export class W3mConnectingExternalView extends LitElement {
  // -- Members ------------------------------------------- //
  private readonly connector = RouterController.state.data?.connector

  // -- State & Properties -------------------------------- //
  @state() private error = false

  // -- Render -------------------------------------------- //
  public override render() {
    if (!this.connector) {
      throw new Error('w3m-connecting-view: No connector provided')
    }

    return html`
      <w3m-connecting-widget
        name=${ifDefined(this.connector.name)}
        .error=${this.error}
        .onConnect=${this.onConnect.bind(this)}
      ></w3m-connecting-widget>
    `
  }

  // -- Private ------------------------------------------- //
  private async onConnect() {
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
