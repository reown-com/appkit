import { AssetUtil, ConnectionController, EventsController, ThemeController } from '@web3modal/core'
import { customElement } from '@web3modal/ui'
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
      <wui-flex padding="xl" flexDirection="column" gap="xl" alignItems="center">
        <wui-shimmer borderRadius="l" width="100%"> ${this.qrCodeTemplate()} </wui-shimmer>

        <wui-text variant="paragraph-500" color="fg-100">
          Scan this QR Code with your phone
        </wui-text>

        <wui-link @click=${this.onCopyUri} color="fg-200">
          <wui-icon size="sm" color="fg-200" slot="iconLeft" name="copy"></wui-icon>
          Copy Link
        </wui-link>
      </wui-flex>

      <w3m-mobile-download-links .wallet=${this.wallet}></w3m-mobile-download-links>
    `
  }

  // -- Private ------------------------------------------- //
  private onRenderProxy() {
    if (!this.ready && this.uri) {
      this.timeout = setTimeout(() => {
        this.ready = true
      }, 200)
    }
  }

  private qrCodeTemplate() {
    if (!this.uri || !this.ready) {
      return null
    }
    const size = this.getBoundingClientRect().width - 40
    const alt = this.wallet ? this.wallet.name : undefined
    ConnectionController.setWcLinking(undefined)
    ConnectionController.setRecentWallet(this.wallet)

    return html`<wui-qr-code
      size=${size}
      theme=${ThemeController.state.themeMode}
      uri=${this.uri}
      imageSrc=${ifDefined(AssetUtil.getWalletImage(this.wallet))}
      alt=${ifDefined(alt)}
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
