import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'

@customElement('w3m-select-network-view')
export class W3mSelectNetworkView extends LitElement {
  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <w3m-modal-header title="Select Network"></w3m-modal-header>
      <w3m-modal-content>Yes</w3m-modal-content>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-select-network-view': W3mSelectNetworkView
  }
}
