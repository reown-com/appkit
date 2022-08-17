import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import RouterCtrl from '../../controllers/RouterCtrl'

@customElement('w3m-select-network-view')
export class W3mSelectNetworkView extends LitElement {
  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <div>
        Select Network View
        <button @click=${() => RouterCtrl.replace('ConnectWallet')}>Go To ConnectWallet</button>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-select-network-view': W3mSelectNetworkView
  }
}
