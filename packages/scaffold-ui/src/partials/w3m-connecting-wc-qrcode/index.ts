import { html } from 'lit'
import { property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import {
  AssetUtil,
  ConnectionController,
  EventsController,
  RouterController,
  ThemeController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon'
import '@reown/appkit-ui/wui-link'
import '@reown/appkit-ui/wui-qr-code'
import '@reown/appkit-ui/wui-shimmer'
import '@reown/appkit-ui/wui-text'
import '@reown/appkit-ui/wui-ux-by-reown'

import { W3mConnectingWidget } from '../../utils/w3m-connecting-widget/index.js'
import '../w3m-mobile-download-links/index.js'
import styles from './styles.js'

@customElement('w3m-connecting-wc-qrcode')
export class W3mConnectingWcQrcode extends W3mConnectingWidget {
  public static override styles = styles

  @property({ type: Boolean }) public basic = false

  public constructor() {
    super()
  }

  public override firstUpdated() {
    if (!this.basic) {
      EventsController.sendEvent({
        type: 'track',
        event: 'SELECT_WALLET',
        properties: {
          name: this.wallet?.name ?? 'WalletConnect',
          platform: 'qrcode',
          displayIndex: this.wallet?.display_index,
          walletRank: this.wallet?.order,
          view: RouterController.state.view
        }
      })
    }
  }

  public override disconnectedCallback() {
    super.disconnectedCallback()
    this.unsubscribe?.forEach(unsub => unsub())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    this.onRenderProxy()

    return html`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${['0', '5', '5', '5'] as const}
        gap="5"
      >
        <wui-shimmer width="100%"> ${this.qrCodeTemplate()} </wui-shimmer>
        <wui-text variant="lg-medium" color="primary"> Scan this QR Code with your phone </wui-text>
        ${this.copyTemplate()}
      </wui-flex>
      <w3m-mobile-download-links .wallet=${this.wallet}></w3m-mobile-download-links>
    `
  }

  // -- Private ------------------------------------------- //
  private onRenderProxy() {
    if (!this.ready && this.uri) {
      this.ready = true
    }
  }

  private qrCodeTemplate() {
    if (!this.uri || !this.ready) {
      return null
    }

    const alt = this.wallet ? this.wallet.name : undefined
    ConnectionController.setWcLinking(undefined)
    ConnectionController.setRecentWallet(this.wallet)

    const qrColor =
      ThemeController.state.themeVariables['--apkt-qr-color'] ??
      ThemeController.state.themeVariables['--w3m-qr-color']

    return html` <wui-qr-code
      theme=${ThemeController.state.themeMode}
      uri=${this.uri}
      imageSrc=${ifDefined(AssetUtil.getWalletImage(this.wallet))}
      color=${ifDefined(qrColor)}
      alt=${ifDefined(alt)}
      data-testid="wui-qr-code"
    ></wui-qr-code>`
  }

  private copyTemplate() {
    const inactive = !this.uri || !this.ready

    return html`<wui-button
      .disabled=${inactive}
      @click=${this.onCopyUri}
      variant="neutral-secondary"
      size="sm"
      data-testid="copy-wc2-uri"
    >
      Copy link
      <wui-icon size="sm" color="inherit" name="copy" slot="iconRight"></wui-icon>
    </wui-button>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-wc-qrcode': W3mConnectingWcQrcode
  }
}
