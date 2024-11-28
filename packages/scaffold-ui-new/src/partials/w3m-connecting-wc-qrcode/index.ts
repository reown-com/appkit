import {
  AssetUtil,
  ConnectionController,
  EventsController,
  ThemeController
} from '@reown/appkit-core'
import { customElement } from '@reown/appkit-ui'
import { html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { W3mConnectingWidget } from '../../utils/w3m-connecting-widget/index.js'
import styles from './styles.js'

@customElement('w3m-connecting-wc-qrcode')
export class W3mConnectingWcQrcode extends W3mConnectingWidget {
  public static override styles = styles

  public constructor() {
    super()
    window.addEventListener('resize', this.forceUpdate)
    EventsController.sendEvent({
      type: 'track',
      event: 'SELECT_WALLET',
      properties: { name: this.wallet?.name ?? 'WalletConnect', platform: 'qrcode' }
    })
  }

  public override disconnectedCallback() {
    super.disconnectedCallback()
    window.removeEventListener('resize', this.forceUpdate)
  }

  // -- Render -------------------------------------------- //
  public override render() {
    this.onRenderProxy()

    return html`
      <wui-flex flexDirection="column" alignItems="center" .padding=${[0, 4, 4, 4]} rowGap="4">
        <wui-shimmer borderRadius="4" width="100%"> ${this.qrCodeTemplate()} </wui-shimmer>

        <wui-button
          size="lg"
          ?fullWidth=${true}
          variant="neutral-secondary"
          @click=${this.onCopyUri}
        >
          <wui-icon size="sm" color="inverse" name="copy" slot="iconLeft"></wui-icon>
          Copy Link
        </wui-button>
      </wui-flex>
      <w3m-mobile-download-links .wallet=${this.wallet}></w3m-mobile-download-links>
    `
  }

  // -- Private ------------------------------------------- //
  private onRenderProxy() {
    if (!this.ready && this.uri) {
      // This setTimeout needed to avoid the beginning of the animation from not starting to resize immediately and some weird svg errors
      this.timeout = setTimeout(() => {
        this.ready = true
      }, 200)
    }
  }

  private qrCodeTemplate() {
    if (!this.uri || !this.ready) {
      return null
    }

    const size = this.getBoundingClientRect().width - 32
    const alt = this.wallet ? this.wallet.name : undefined
    ConnectionController.setWcLinking(undefined)
    ConnectionController.setRecentWallet(this.wallet)

    return html`<wui-qr-code
      size=${size}
      theme=${ThemeController.state.themeMode}
      uri=${this.uri}
      imageSrc=${ifDefined(AssetUtil.getWalletImage(this.wallet))}
      alt=${ifDefined(alt)}
      data-testid="wui-qr-code"
    ></wui-qr-code>`
  }

  private forceUpdate = () => {
    this.requestUpdate()
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-wc-qrcode': W3mConnectingWcQrcode
  }
}
