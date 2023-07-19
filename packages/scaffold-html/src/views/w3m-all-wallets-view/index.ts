import { CoreHelperUtil, ExplorerApiController } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { animate } from 'motion'
import styles from './styles'

@customElement('w3m-all-wallets-view')
export class W3mAllWalletsView extends LitElement {
  public static styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() private initial = !ExplorerApiController.state.listings.length

  @state() private listings = ExplorerApiController.state.listings

  public constructor() {
    super()
    this.unsubscribe.push(
      ExplorerApiController.subscribeKey('listings', val => (this.listings = val))
    )
  }

  public firstUpdated() {
    this.initialFetch()
  }

  public disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

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
        ${this.initial ? this.loaderTemplate() : this.walletsTemplate()}
      </wui-grid>
    `
  }

  // Private Methods ------------------------------------- //
  private async initialFetch() {
    const gridEl = this.shadowRoot?.querySelector('wui-grid')
    if (this.initial && gridEl) {
      await Promise.all([ExplorerApiController.fetchListings(), CoreHelperUtil.wait(300)])
      await animate(gridEl, { opacity: 0 }, { duration: 0.2 }).finished
      this.initial = false
      animate(gridEl, { opacity: 1 }, { duration: 0.2 })
    }
  }

  private loaderTemplate() {
    return [...Array(16)].map(
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
