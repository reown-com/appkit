import { CoreHelperUtil } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import styles from './styles'

@customElement('w3m-all-wallets-view')
export class W3mAllWalletsView extends LitElement {
  public static styles = styles

  // -- State & Properties -------------------------------- //
  @state() private search = ''

  // -- Render -------------------------------------------- //
  public render() {
    const isSearch = this.search.length >= 2

    return html`
      <wui-flex padding="s">
        <wui-search-bar @inputChange=${this.onInputChange.bind(this)}></wui-search-bar>
      </wui-flex>
      ${isSearch
        ? html`<w3m-all-wallets-search query=${this.search}></w3m-all-wallets-search>`
        : html`<w3m-all-wallets-list></w3m-all-wallets-list>`}
    `
  }

  // -- Private ------------------------------------------- //
  private onInputChange(event: CustomEvent) {
    this.onDebouncedSearch(event.detail)
  }

  private onDebouncedSearch = CoreHelperUtil.debounce((value: string) => {
    this.search = value
  })
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-all-wallets-view': W3mAllWalletsView
  }
}
