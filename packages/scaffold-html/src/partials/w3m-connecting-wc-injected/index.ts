import {
  ConnectionController,
  ExplorerApiController,
  ModalController,
  RouterController
} from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'

@customElement('w3m-connecting-wc-injected')
export class W3mConnectingWcInjected extends LitElement {
  // -- Members ------------------------------------------- //
  private readonly listing = RouterController.state.data?.listing

  private readonly images = ExplorerApiController.state.images

  // -- State & Properties -------------------------------- //
  @state() private error = false

  // -- Render -------------------------------------------- //
  public render() {
    if (!this.listing) {
      throw new Error('w3m-connecting-wc-injected: No listing provided')
    }

    const label = `Continue in ${this.listing.name}`
    const subLabel = this.error ? 'Connection declined' : 'Accept connection request in the wallet'

    return html`
      <w3m-connecting-widget
        .error=${this.error}
        .onConnect=${this.onConnect.bind(this)}
        label=${label}
        imageSrc=${this.images[this.listing.image_id]}
        subLabel=${subLabel}
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
