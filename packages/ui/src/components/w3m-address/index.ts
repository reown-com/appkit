import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { formatAddress } from '../../utils/UiHelpers'
import '../w3m-text'

@customElement('w3m-address')
export class W3mAddress extends LitElement {
  // -- state & properties ------------------------------------------- //
  @property() public address = ''
  @property() public variant = ''

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <w3m-text variant=${this.variant} color="primary">${formatAddress(this.address)}</w3m-text>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-address': W3mAddress
  }
}
