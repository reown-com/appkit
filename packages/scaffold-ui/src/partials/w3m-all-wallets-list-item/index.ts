import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { AssetUtil, type WcWallet } from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon'
import '@reown/appkit-ui/wui-shimmer'
import '@reown/appkit-ui/wui-text'
import '@reown/appkit-ui/wui-wallet-image'

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
    const certified = this.wallet?.badge_type === 'certified'

    return html`
      <button>
        ${this.imageTemplate()}
        <wui-flex flexDirection="row" alignItems="center" justifyContent="center" gap="3xs">
          <wui-text
            variant="tiny-500"
            color="inherit"
            class=${ifDefined(certified ? 'certified' : undefined)}
            >${this.wallet?.name}</wui-text
          >
          ${certified ? html`<wui-icon size="sm" name="walletConnectBrown"></wui-icon>` : null}
        </wui-flex>
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
