import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'

@customElement('w3m-connect-view')
export class W3mConnectView extends LitElement {
  // -- Render -------------------------------------------- //
  public render() {
    return html`
      <wui-flex flexDirection="column" padding="l" gap="xs">
        <wui-list-select name="Rainbow"></wui-list-select>
        <wui-list-select name="MetaMask"></wui-list-select>
        <wui-list-select name="WalletConnect"></wui-list-select>
        <wui-list-select name="View All" showAllWallets></wui-list-select>
      </wui-flex>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-view': W3mConnectView
  }
}
