import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'

@customElement('w3m-connect-view')
export class W3mConnectView extends LitElement {
  // -- Render -------------------------------------------- //
  public render() {
    return html`
      <wui-flex flexDirection="column">
        <w3m-header>
          <wui-icon-link slot="left">1</wui-icon-link>
          Connect wallet
          <wui-icon-link slot="right">1</wui-icon-link>
        </w3m-header>

        <wui-separator></wui-separator>

        <wui-flex flexDirection="column" padding="l" gap="xs">
          <wui-list-select name="Rainbow"></wui-list-select>
          <wui-list-select name="MetaMask"></wui-list-select>
          <wui-list-select name="WalletConnect"></wui-list-select>
        </wui-flex>
      </wui-flex>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-view': W3mConnectView
  }
}
