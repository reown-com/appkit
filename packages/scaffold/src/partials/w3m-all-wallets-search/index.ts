import type { WcWallet } from '@web3modal/core'
import { ApiController, AssetUtil, ConnectorController, RouterController } from '@web3modal/core'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
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

    return this.loading
      ? html`<wui-loading-spinner color="accent-100"></wui-loading-spinner>`
      : this.walletsTemplate()
  }

  // Private Methods ------------------------------------- //
  private async onSearch() {
    if (this.query !== this.prevQuery) {
      this.prevQuery = this.query
      this.loading = true
      await ApiController.searchWallet({ search: this.query })
      this.loading = false
    }
  }

  private walletsTemplate() {
    const { search } = ApiController.state
    const { connectors } = ConnectorController.state
    const installedConnectors = connectors
      .filter(c => c.type === 'ANNOUNCED')
      .reduce<Record<string, boolean>>((acum, val) => {
        if (!val.info?.rdns) {
          return acum
        }
        acum[val.info.rdns] = true

        return acum
      }, {})
    const walletsWithInstalled: (WcWallet & { installed: boolean })[] = search.map(wallet => ({
      ...wallet,
      installed: Boolean(wallet.rdns) && Boolean(installedConnectors[wallet.rdns ?? ''])
    }))
    const sortedWallets = walletsWithInstalled.sort(
      (a, b) => Number(b.installed) - Number(a.installed)
    )

    if (!search.length) {
      return html`
        <wui-flex justifyContent="center" alignItems="center" gap="s" flexDirection="column">
          <wui-icon-box
            size="lg"
            iconColor="fg-200"
            backgroundColor="fg-300"
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
        ${sortedWallets.map(
          wallet => html`
            <wui-card-select
              imageSrc=${ifDefined(AssetUtil.getWalletImage(wallet))}
              type="wallet"
              name=${wallet.name}
              @click=${() => this.onConnectWallet(wallet)}
              .installed=${wallet.installed}
            ></wui-card-select>
          `
        )}
      </wui-grid>
    `
  }

  private onConnectWallet(wallet: WcWallet) {
    const { connectors } = ConnectorController.state
    const connector = connectors.find(({ explorerId }) => explorerId === wallet.id)
    if (connector) {
      RouterController.push('ConnectingExternal', { connector })
    } else {
      RouterController.push('ConnectingWalletConnect', { wallet })
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-all-wallets-search': W3mAllWalletsSearch
  }
}
