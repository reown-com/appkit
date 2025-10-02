import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import {
  AssetUtil,
  EventsController,
  RouterController,
  type WcWallet
} from '@reown/appkit-controllers'
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

  @state() private isImpressed = false

  @property() private explorerId = ''

  @property() private walletQuery = ''

  @property() private certified = false

  @property() private displayIndex = 0

  @property({ type: Object }) private wallet: (WcWallet & { installed: boolean }) | undefined =
    undefined

  // -- Lifecycle ----------------------------------------- //
  constructor() {
    super()
    this.observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.visible = true
            this.fetchImageSrc()
            this.sendImpressionEvent()
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
        <wui-flex flexDirection="row" alignItems="center" justifyContent="center" gap="1">
          <wui-text
            variant="md-regular"
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
        size="lg"
        imageSrc=${ifDefined(this.imageSrc)}
        name=${ifDefined(this.wallet?.name)}
        .installed=${this.wallet?.installed ?? false}
        badgeSize="sm"
      >
      </wui-wallet-image>
    `
  }

  private shimmerTemplate() {
    return html`<wui-shimmer width="56px" height="56px"></wui-shimmer>`
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

  private sendImpressionEvent() {
    if (!this.wallet || this.isImpressed) {
      return
    }

    this.isImpressed = true
    EventsController.sendWalletImpressionEvent({
      name: this.wallet.name,
      walletRank: this.wallet.order,
      explorerId: this.explorerId,
      view: RouterController.state.view,
      query: this.walletQuery,
      certified: this.certified,
      displayIndex: this.displayIndex
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-all-wallets-list-item': W3mAllWalletsListItem
  }
}
