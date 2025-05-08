import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import type { WcWallet } from '@reown/appkit-controllers'
import { ApiController, ConnectorController, CoreHelperUtil } from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-card-select-loader'
import '@reown/appkit-ui/wui-grid'

import { WalletUtil } from '../../utils/WalletUtil.js'
import '../w3m-all-wallets-list-item/index.js'
import styles from './styles.js'

// -- Helpers --------------------------------------------- //
const PAGINATOR_ID = 'local-paginator'

@customElement('w3m-all-wallets-list')
export class W3mAllWalletsList extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  private paginationObserver?: IntersectionObserver = undefined

  // -- State & Properties -------------------------------- //
  @state() private loading = !ApiController.state.wallets.length

  @state() private wallets = ApiController.state.wallets

  @state() private recommended = ApiController.state.recommended

  @state() private featured = ApiController.state.featured

  @state() private filteredWallets = ApiController.state.filteredWallets

  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        ApiController.subscribeKey('wallets', val => (this.wallets = val)),
        ApiController.subscribeKey('recommended', val => (this.recommended = val)),
        ApiController.subscribeKey('featured', val => (this.featured = val)),
        ApiController.subscribeKey('filteredWallets', val => (this.filteredWallets = val))
      ]
    )
  }

  public override firstUpdated() {
    this.initialFetch()
    this.createPaginationObserver()
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
    this.paginationObserver?.disconnect()
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-grid
        data-scroll=${!this.loading}
        .padding=${['0', 's', 's', 's'] as const}
        columnGap="xxs"
        rowGap="l"
        justifyContent="space-between"
      >
        ${this.loading ? this.shimmerTemplate(16) : this.walletsTemplate()}
        ${this.paginationLoaderTemplate()}
      </wui-grid>
    `
  }

  // Private Methods ------------------------------------- //
  private async initialFetch() {
    this.loading = true
    const gridEl = this.shadowRoot?.querySelector('wui-grid')
    if (gridEl) {
      await ApiController.fetchWalletsByPage({ page: 1 })
      await gridEl.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 200,
        fill: 'forwards',
        easing: 'ease'
      }).finished
      this.loading = false
      gridEl.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 200,
        fill: 'forwards',
        easing: 'ease'
      })
    }
  }

  private shimmerTemplate(items: number, id?: string) {
    return [...Array(items)].map(
      () => html`
        <wui-card-select-loader type="wallet" id=${ifDefined(id)}></wui-card-select-loader>
      `
    )
  }

  private walletsTemplate() {
    const wallets =
      this.filteredWallets?.length > 0
        ? CoreHelperUtil.uniqueBy(
            [...this.featured, ...this.recommended, ...this.filteredWallets],
            'id'
          )
        : CoreHelperUtil.uniqueBy([...this.featured, ...this.recommended, ...this.wallets], 'id')
    const walletsWithInstalled = WalletUtil.markWalletsAsInstalled(wallets)

    return walletsWithInstalled.map(
      wallet => html`
        <w3m-all-wallets-list-item
          @click=${() => this.onConnectWallet(wallet)}
          .wallet=${wallet}
        ></w3m-all-wallets-list-item>
      `
    )
  }

  private paginationLoaderTemplate() {
    const { wallets, recommended, featured, count } = ApiController.state
    const columns = window.innerWidth < 352 ? 3 : 4
    const currentWallets = wallets.length + recommended.length
    const minimumRows = Math.ceil(currentWallets / columns)
    let shimmerCount = minimumRows * columns - currentWallets + columns
    shimmerCount -= wallets.length ? featured.length % columns : 0

    if (count === 0 && featured.length > 0) {
      return null
    }

    if (count === 0 || [...featured, ...wallets, ...recommended].length < count) {
      return this.shimmerTemplate(shimmerCount, PAGINATOR_ID)
    }

    return null
  }

  private createPaginationObserver() {
    const loaderEl = this.shadowRoot?.querySelector(`#${PAGINATOR_ID}`)
    if (loaderEl) {
      this.paginationObserver = new IntersectionObserver(([element]) => {
        if (element?.isIntersecting && !this.loading) {
          const { page, count, wallets } = ApiController.state
          if (wallets.length < count) {
            ApiController.fetchWalletsByPage({ page: page + 1 })
          }
        }
      })
      this.paginationObserver.observe(loaderEl)
    }
  }

  private onConnectWallet(wallet: WcWallet) {
    ConnectorController.selectWalletConnector(wallet)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-all-wallets-list': W3mAllWalletsList
  }
}
