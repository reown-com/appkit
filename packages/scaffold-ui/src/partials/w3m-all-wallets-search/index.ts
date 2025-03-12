import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'

import type { BadgeType, WcWallet } from '@reown/appkit-core'
import { ApiController, ConnectorController } from '@reown/appkit-core'
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

  @property() private query = ''

  @property() private badge?: BadgeType

  // -- Render -------------------------------------------- //
  public override render() {
    this.onSearch()

    return this.loading
      ? html`<wui-loading-spinner color="accent-100"></wui-loading-spinner>`
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
          gap="s"
          flexDirection="column"
        >
          <wui-icon-box
            size="lg"
            iconColor="fg-200"
            backgroundColor="fg-300"
            icon="wallet"
            background="transparent"
          ></wui-icon-box>
          <wui-text data-testid="no-wallet-found-text" color="fg-200" variant="paragraph-500">
            No Wallet found
          </wui-text>
        </wui-flex>
      `
    }

    return html`
      <wui-grid
        data-testid="wallet-list"
        .padding=${['0', 's', 's', 's'] as const}
        rowGap="l"
        columnGap="xs"
        justifyContent="space-between"
      >
        ${wallets.map(
          wallet => html`
            <w3m-all-wallets-list-item
              @click=${() => this.onConnectWallet(wallet)}
              .wallet=${wallet}
              data-testid="wallet-search-item-${wallet.id}"
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
