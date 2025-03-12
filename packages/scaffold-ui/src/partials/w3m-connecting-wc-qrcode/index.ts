import { html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'

import {
  AssetUtil,
  ConnectionController,
  EventsController,
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
    this.unsubscribe?.forEach(unsub => unsub())
    window.removeEventListener('resize', this.forceUpdate)
  }

  // -- Render -------------------------------------------- //
  public override render() {
    this.onRenderProxy()

    return html`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${['0', 'xl', 'xl', 'xl']}
        gap="xl"
      >
        <wui-shimmer borderRadius="l" width="100%"> ${this.qrCodeTemplate()} </wui-shimmer>

        <wui-text variant="paragraph-500" color="fg-100">
          Scan this QR Code with your phone
        </wui-text>
        ${this.copyTemplate()}
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

    const size = this.getBoundingClientRect().width - 40
    const alt = this.wallet ? this.wallet.name : undefined
    ConnectionController.setWcLinking(undefined)
    ConnectionController.setRecentWallet(this.wallet)

    return html` <wui-qr-code
      size=${size}
      theme=${ThemeController.state.themeMode}
      uri=${this.uri}
      imageSrc=${ifDefined(AssetUtil.getWalletImage(this.wallet))}
      color=${ifDefined(ThemeController.state.themeVariables['--w3m-qr-color'])}
      alt=${ifDefined(alt)}
      data-testid="wui-qr-code"
    ></wui-qr-code>`
  }

  private copyTemplate() {
    const inactive = !this.uri || !this.ready

    return html`<wui-link
      .disabled=${inactive}
      @click=${this.onCopyUri}
      color="fg-200"
      data-testid="copy-wc2-uri"
    >
      <wui-icon size="xs" color="fg-200" slot="iconLeft" name="copy"></wui-icon>
      Copy link
    </wui-link>`
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
