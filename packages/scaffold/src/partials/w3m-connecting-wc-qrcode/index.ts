import {
  AssetUtil,
  ConnectionController,
  CoreHelperUtil,
  RouterController,
  SnackController,
  ThemeController
} from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import styles from './styles.js'

@customElement('w3m-connecting-wc-qrcode')
export class W3mConnectingWcQrcode extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  private timeout?: ReturnType<typeof setTimeout> = undefined

  private readonly wallet = RouterController.state.data?.wallet

  // -- State & Properties -------------------------------- //
  @state() private uri = ConnectionController.state.wcUri

  @state() private ready = false

  public constructor() {
    super()
    this.unsubscribe.push(ConnectionController.subscribeKey('wcUri', val => (this.uri = val)))
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
    clearTimeout(this.timeout)
  }

  // -- Render -------------------------------------------- //
  public override render() {
    this.isReady()

    return html`
      <wui-flex padding="xl" flexDirection="column" gap="xl" alignItems="center">
        <wui-shimmer borderRadius="l" width="100%"> ${this.qrCodeTenmplate()} </wui-shimmer>

        <wui-text variant="paragraph-500" color="fg-100">
          Scan this QR Code with your phone
        </wui-text>

        <wui-button variant="fullWidth" @click=${this.onCopyUri}>
          <wui-icon size="sm" color="inherit" slot="iconLeft" name="copy"></wui-icon>
          Copy Link
        </wui-button>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private isReady() {
    if (!this.ready && this.uri) {
      this.timeout = setTimeout(() => (this.ready = true), 250)
    }
  }

  private qrCodeTenmplate() {
    if (!this.uri || !this.ready) {
      return null
    }
    const size = this.getBoundingClientRect().width - 40
    const alt = this.wallet ? this.wallet.name : undefined

    return html`<wui-qr-code
      size=${size}
      theme=${ThemeController.state.themeMode}
      uri=${this.uri}
      imageSrc=${ifDefined(AssetUtil.getWalletImage(this.wallet?.image_id))}
      alt=${ifDefined(alt)}
    ></wui-qr-code>`
  }

  private onCopyUri() {
    try {
      if (this.uri) {
        CoreHelperUtil.copyToClopboard(this.uri)
        SnackController.showSuccess('Link copied')
      }
    } catch {
      SnackController.showError('Failed to copy')
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-wc-qrcode': W3mConnectingWcQrcode
  }
}
