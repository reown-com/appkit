import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'

@customElement('w3m-wallet-login-list')
export class W3mWalletLoginList extends LitElement {
  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" gap="xs">
        <w3m-connector-list></w3m-connector-list>
        <w3m-all-wallets-widget></w3m-all-wallets-widget>
      </wui-flex>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-wallet-login-list': W3mWalletLoginList
  }
}
