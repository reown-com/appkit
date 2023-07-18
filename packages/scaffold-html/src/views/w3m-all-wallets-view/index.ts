import { ExplorerApiController } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import styles from './styles'

@customElement('w3m-all-wallets-view')
export class W3mAllWalletsView extends LitElement {
  public static styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() private listings = ExplorerApiController.state.listings

  public constructor() {
    super()
    this.unsubscribe.push(
      ExplorerApiController.subscribeKey('listings', val => (this.listings = val))
    )
    this.initialFetch()
  }

  public disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public render() {
    const isLoading = !this.listings.length

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
        ${isLoading ? this.loaderTemplate() : this.walletsTemplate()}
      </wui-grid>
    `
  }

  // Private Methods ------------------------------------- //
  private initialFetch() {
    const { listings } = ExplorerApiController.state
    if (!listings.length) {
      ExplorerApiController.fetchWallets()
    }
  }

  private loaderTemplate() {
    return [...Array(12)].map(
      () => html`<wui-card-select-loader type="wallet"></wui-card-select-loader>`
    )
  }

  private walletsTemplate() {
    return this.listings.map(
      wallet => html` <wui-card-select type="wallet" name=${wallet.name}></wui-card-select> `
    )
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-all-wallets-view': W3mAllWalletsView
  }
}
