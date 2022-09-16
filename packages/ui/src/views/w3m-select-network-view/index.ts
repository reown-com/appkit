import { RouterCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'

@customElement('w3m-select-network-view')
export class W3mSelectNetworkView extends LitElement {
  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      Select Network View
      <button @click=${() => RouterCtrl.replace('ConnectWallet')}>Go To ConnectWallet</button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-select-network-view': W3mSelectNetworkView
  }
}
