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
      <wui-grid
        .padding=${['0', 's', 's', 's'] as const}
        gridTemplateColumns="repeat(4, 1fr)"
        rowGap="l"
        columnGap="xs"
      >
        <wui-card-select-loader type="wallet"></wui-card-select-loader>
        <wui-card-select-loader type="wallet"></wui-card-select-loader>
        <wui-card-select-loader type="wallet"></wui-card-select-loader>
        <wui-card-select-loader type="wallet"></wui-card-select-loader>
        <wui-card-select-loader type="wallet"></wui-card-select-loader>
        <wui-card-select-loader type="wallet"></wui-card-select-loader>
        <wui-card-select-loader type="wallet"></wui-card-select-loader>
        <wui-card-select-loader type="wallet"></wui-card-select-loader>
        <wui-card-select-loader type="wallet"></wui-card-select-loader>
        <wui-card-select-loader type="wallet"></wui-card-select-loader>
        <wui-card-select-loader type="wallet"></wui-card-select-loader>
        <wui-card-select-loader type="wallet"></wui-card-select-loader>
      </wui-grid>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-all-wallets-view': W3mAllWalletsView
  }
}
