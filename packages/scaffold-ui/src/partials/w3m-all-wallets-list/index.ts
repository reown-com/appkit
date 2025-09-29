import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import {
  ApiController,
  ConnectorController,
  CoreHelperUtil,
  OptionsController,
  type WcWallet
} from '@reown/appkit-controllers'
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

  @state() private badge?: 'certified' | undefined

  @state() private mobileFullScreen = OptionsController.state.enableMobileFullScreen

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
    if (this.mobileFullScreen) {
      this.setAttribute('data-mobile-fullscreen', 'true')
    }

    return html`
      <wui-grid
        data-scroll=${!this.loading}
        .padding=${['0', '3', '3', '3'] as const}
        gap="2"
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

  private getWallets() {
    const wallets = [...this.featured, ...this.recommended]
    if (this.filteredWallets?.length > 0) {
      wallets.push(...this.filteredWallets)
    } else {
      wallets.push(...this.wallets)
    }

    const uniqueWallets = CoreHelperUtil.uniqueBy(wallets, 'id')
    const walletsWithInstalled = WalletUtil.markWalletsAsInstalled(uniqueWallets)

    return WalletUtil.markWalletsWithDisplayIndex(walletsWithInstalled)
  }

  private walletsTemplate() {
    const wallets = this.getWallets()

    return wallets.map(
      wallet => html`
        <w3m-all-wallets-list-item
          data-testid="wallet-search-item-${wallet.id}"
          @click=${() => this.onConnectWallet(wallet)}
          .wallet=${wallet}
          explorerId=${wallet.id}
          certified=${this.badge === 'certified'}
        ></w3m-all-wallets-list-item>
      `
    )
  }

  private paginationLoaderTemplate() {
    const { wallets, recommended, featured, count, mobileFilteredOutWalletsLength } =
      ApiController.state
    const columns = window.innerWidth < 352 ? 3 : 4
    const currentWallets = wallets.length + recommended.length
    const minimumRows = Math.ceil(currentWallets / columns)
    let shimmerCount = minimumRows * columns - currentWallets + columns
    shimmerCount -= wallets.length ? featured.length % columns : 0

    if (count === 0 && featured.length > 0) {
      return null
    }

    if (
      count === 0 ||
      [...featured, ...wallets, ...recommended].length <
        count - (mobileFilteredOutWalletsLength ?? 0)
    ) {
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
