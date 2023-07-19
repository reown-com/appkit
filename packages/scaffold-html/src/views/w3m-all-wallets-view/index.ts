import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import styles from './styles'

@customElement('w3m-all-wallets-view')
export class W3mAllWalletsView extends LitElement {
  public static styles = styles

  // -- Render -------------------------------------------- //
  public render() {
    return html`
      <wui-flex padding="s">
        <wui-search-bar></wui-search-bar>
      </wui-flex>
      <w3m-all-wallets-list></w3m-all-wallets-list>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-all-wallets-view': W3mAllWalletsView
  }
}
