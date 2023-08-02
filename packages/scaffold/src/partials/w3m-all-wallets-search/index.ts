import type { ExplorerListing } from '@web3modal/core'
import { ExplorerApiController, RouterController } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import styles from './styles.js'

@customElement('w3m-all-wallets-search')
export class W3mAllWalletsSearch extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private prevQuery = ''

  // -- State & Properties -------------------------------- //
  @state() private loading = true

  @property() private query = ''

  // -- Render -------------------------------------------- //
  public override render() {
    this.onSearch()

    return this.loading ? html`<wui-loading-spinner></wui-loading-spinner>` : this.walletsTemplate()
  }

  // Private Methods ------------------------------------- //
  private async onSearch() {
    if (this.query !== this.prevQuery) {
      this.prevQuery = this.query
      this.loading = true
      await ExplorerApiController.searchListings({ search: this.query })
      this.loading = false
    }
  }

  private walletsTemplate() {
    const { search, images } = ExplorerApiController.state

    if (!search.length) {
      return html`
        <wui-flex justifyContent="center" alignItems="center" gap="s" flexDirection="column">
          <wui-icon-box
            size="lg"
            iconcolor="fg-200"
            backgroundcolor="fg-300"
            icon="wallet"
            background="transparent"
          ></wui-icon-box>
          <wui-text color="fg-200" variant="paragraph-500">No Wallet found</wui-text>
        </wui-flex>
      `
    }

    return html`
      <wui-grid
        .padding=${['0', 's', 's', 's'] as const}
        gridTemplateColumns="repeat(4, 1fr)"
        rowGap="l"
        columnGap="xs"
      >
        ${search.map(
          listing => html`
            <wui-card-select
              imageSrc=${ifDefined(images[listing.image_id])}
              type="wallet"
              name=${listing.name}
              @click=${() => this.onConnectListing(listing)}
            ></wui-card-select>
          `
        )}
      </wui-grid>
    `
  }

  private onConnectListing(listing: ExplorerListing) {
    RouterController.push('ConnectingWalletConnect', { listing })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-all-wallets-search': W3mAllWalletsSearch
  }
}
