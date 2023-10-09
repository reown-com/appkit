import { RouterController } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'

@customElement('w3m-downloads-view')
export class W3mDownloadsView extends LitElement {
  // -- Members ------------------------------------------- //
  private wallet = RouterController.state.data?.wallet

  // -- Render -------------------------------------------- //
  public override render() {
    if (!this.wallet) {
      throw new Error('w3m-downloads-view')
    }

    return html`yup`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-downloads-view': W3mDownloadsView
  }
}
