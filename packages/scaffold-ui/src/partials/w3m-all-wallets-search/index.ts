import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'

import type { BadgeType, WcWallet } from '@reown/appkit-controllers'
import { ApiController, ConnectorController, OptionsController } from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-grid'
import '@reown/appkit-ui/wui-icon-box'
import '@reown/appkit-ui/wui-loading-spinner'
import '@reown/appkit-ui/wui-text'

import { WalletUtil } from '../../utils/WalletUtil.js'
import '../w3m-all-wallets-list-item/index.js'
import styles from './styles.js'

@customElement('w3m-all-wallets-search')
export class W3mAllWalletsSearch extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private prevQuery = ''

  private prevBadge?: BadgeType = undefined

  // -- State & Properties -------------------------------- //
  @state() private loading = true

  @state() private mobileFullScreen = OptionsController.state.enableMobileFullScreen

  @property() private query = ''

  @property() private badge?: BadgeType

  // -- Render -------------------------------------------- //
  public override render() {
    if (this.mobileFullScreen) {
      this.setAttribute('data-mobile-fullscreen', 'true')
    }

    this.onSearch()

    return this.loading
      ? html`<wui-loading-spinner color="accent-primary"></wui-loading-spinner>`
      : this.walletsTemplate()
  }

  // Private Methods ------------------------------------- //
  private async onSearch() {
    if (this.query.trim() !== this.prevQuery.trim() || this.badge !== this.prevBadge) {
      this.prevQuery = this.query
      this.prevBadge = this.badge
      this.loading = true
      await ApiController.searchWallet({ search: this.query, badge: this.badge })
      this.loading = false
    }
  }

  private walletsTemplate() {
    const { search } = ApiController.state
    const wallets = WalletUtil.markWalletsAsInstalled(search)

    if (!search.length) {
      return html`
        <wui-flex
          data-testid="no-wallet-found"
          justifyContent="center"
          alignItems="center"
          gap="3"
          flexDirection="column"
        >
          <wui-icon-box size="lg" color="default" icon="wallet"></wui-icon-box>
          <wui-text data-testid="no-wallet-found-text" color="secondary" variant="md-medium">
            No Wallet found
          </wui-text>
        </wui-flex>
      `
    }

    return html`
      <wui-grid
        data-testid="wallet-list"
        .padding=${['0', '3', '3', '3'] as const}
        rowGap="4"
        columngap="2"
        justifyContent="space-between"
      >
        ${wallets.map(
          wallet => html`
            <w3m-all-wallets-list-item
              @click=${() => this.onConnectWallet(wallet)}
              .wallet=${wallet}
              data-testid="wallet-search-item-${wallet.id}"
              explorerId=${wallet.id}
              certified=${this.badge === 'certified'}
              walletQuery=${this.query}
            ></w3m-all-wallets-list-item>
          `
        )}
      </wui-grid>
    `
  }

  private onConnectWallet(wallet: WcWallet) {
    ConnectorController.selectWalletConnector(wallet)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-all-wallets-search': W3mAllWalletsSearch
  }
}
