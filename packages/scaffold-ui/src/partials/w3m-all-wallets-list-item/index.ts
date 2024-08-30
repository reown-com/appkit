import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { AssetUtil, type WcWallet } from '@web3modal/core'
import styles from './styles.js'

@customElement('w3m-all-wallets-list-item')
export class W3mAllWalletsListItem extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private observer = new IntersectionObserver(() => undefined)

  // -- State & Properties -------------------------------- //
  @state() private visible = false

  @state() private imageSrc: string | undefined = undefined

  @state() private imageLoading = false

  @property() private wallet: (WcWallet & { installed: boolean }) | undefined = undefined

  // -- Lifecycle ----------------------------------------- //
  constructor() {
    super()
    this.observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.visible = true
            this.fetchImageSrc()
          } else {
            this.visible = false
          }
        })
      },
      { threshold: 0.01 }
    )
  }

  public override firstUpdated() {
    this.observer.observe(this)
  }

  public override disconnectedCallback() {
    this.observer.disconnect()
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <button ontouchstart>
        ${this.imageTemplate()}
        <wui-text variant="tiny-500" color="inherit">${this.wallet?.name}</wui-text>
      </button>
    `
  }

  private imageTemplate() {
    if ((!this.visible && !this.imageSrc) || this.imageLoading) {
      return this.shimmerTemplate()
    }

    return html`
      <wui-wallet-image
        size="md"
        imageSrc=${ifDefined(this.imageSrc)}
        name=${this.wallet?.name}
        .installed=${this.wallet?.installed}
        badgeSize="sm"
      >
      </wui-wallet-image>
    `
  }

  private shimmerTemplate() {
    return html`<wui-shimmer width="56px" height="56px" borderRadius="xs"></wui-shimmer>`
  }

  private async fetchImageSrc() {
    if (!this.wallet) {
      return
    }
    this.imageSrc = AssetUtil.getWalletImage(this.wallet)

    if (this.imageSrc) {
      return
    }

    this.imageLoading = true
    this.imageSrc = await AssetUtil.fetchWalletImage(this.wallet.image_id)
    this.imageLoading = false
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-all-wallets-list-item': W3mAllWalletsListItem
  }
}
