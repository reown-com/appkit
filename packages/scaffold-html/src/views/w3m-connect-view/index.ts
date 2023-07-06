import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'

@customElement('w3m-connect-view')
export class W3mConnectView extends LitElement {
  // -- Render -------------------------------------------- //
  public render() {
    return html`
      <wui-flex>
        <w3m-header>Connect wallet</w3m-header>
      </wui-flex>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-view': W3mConnectView
  }
}
