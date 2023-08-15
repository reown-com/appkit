import type { ApiWallet } from '@web3modal/core'
import { ApiController, RouterController } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { animate } from 'motion'
import styles from './styles.js'

@customElement('w3m-all-wallets-list')
export class W3mAllWalletsList extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  private paginationObserver?: IntersectionObserver = undefined

  // -- State & Properties -------------------------------- //
  @state() private initial = !ApiController.state.wallets.length

  @state() private wallets = ApiController.state.wallets

  @state() private recommended = ApiController.state.recommended

  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        ApiController.subscribeKey('wallets', val => (this.wallets = val)),
        ApiController.subscribeKey('recommended', val => (this.recommended = val))
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
        data-scroll=${!this.initial}
        .padding=${['0', 's', 's', 's'] as const}
        gridTemplateColumns="repeat(4, 1fr)"
        rowGap="l"
        columnGap="xs"
      >
        ${this.initial ? this.shimmerTemplate() : this.walletsTemplate()}
        ${this.paginationLoaderTemplate()}
      </wui-grid>
    `
  }

  // Private Methods ------------------------------------- //
  private async initialFetch() {
    const gridEl = this.shadowRoot?.querySelector('wui-grid')
    if (this.initial && gridEl) {
      await ApiController.fetchWallets({ page: 1 })
      await animate(gridEl, { opacity: [1, 0] }, { duration: 0.2 }).finished
      this.initial = false
      animate(gridEl, { opacity: [0, 1] }, { duration: 0.2 })
    }
  }

  private shimmerTemplate() {
    return [...Array(16)].map(
      () => html`<wui-card-select-loader type="wallet"></wui-card-select-loader>`
    )
  }

  private walletsTemplate() {
    const { images } = ApiController.state
    const wallets = [...this.recommended, ...this.wallets]

    return wallets.map(
      wallet => html`
        <wui-card-select
          imageSrc=${ifDefined(images[wallet.image_id])}
          type="wallet"
          name=${wallet.name}
          @click=${() => this.onConnectListing(wallet)}
        ></wui-card-select>
      `
    )
  }

  private paginationLoaderTemplate() {
    const { wallets, count } = ApiController.state
    if (count === 0 || wallets.length < count) {
      return html`<wui-loading-spinner color="blue-100"></wui-loading-spinner>`
    }

    return null
  }

  private createPaginationObserver() {
    const loaderEl = this.shadowRoot?.querySelector('wui-loading-spinner')
    if (loaderEl) {
      this.paginationObserver = new IntersectionObserver(([element]) => {
        if (element?.isIntersecting && !this.initial) {
          const { page, count, wallets } = ApiController.state
          if (wallets.length < count) {
            ApiController.fetchWallets({ page: page + 1 })
          }
        }
      })
      this.paginationObserver.observe(loaderEl)
    }
  }

  private onConnectListing(wallet: ApiWallet) {
    RouterController.push('ConnectingWalletConnect', { wallet })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-all-wallets-list': W3mAllWalletsList
  }
}
