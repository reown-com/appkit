import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'

import styles from './styles.js'
@customElement('w3m-wallet-login-list')
export class W3mWalletLoginList extends LitElement {
  public static override styles = styles

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" gap="xs">
        <w3m-connect-walletconnect-widget></w3m-connect-walletconnect-widget>
        <w3m-connect-recent-widget></w3m-connect-recent-widget>
        <w3m-connect-announced-widget></w3m-connect-announced-widget>
        <w3m-connect-injected-widget></w3m-connect-injected-widget>
        <w3m-connect-featured-widget></w3m-connect-featured-widget>
        <w3m-connect-custom-widget></w3m-connect-custom-widget>
        <w3m-connect-coinbase-widget></w3m-connect-coinbase-widget>
        <w3m-connect-recommended-widget></w3m-connect-recommended-widget>
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
