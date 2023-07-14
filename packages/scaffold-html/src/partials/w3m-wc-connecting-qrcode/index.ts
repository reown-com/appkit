import { CoreHelperUtil } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import styles from './styles'

@customElement('w3m-connecting-wc-qrcode')
export class W3mConnectingWcQrcode extends LitElement {
  public static styles = styles

  // -- State & Properties -------------------------------- //
  @property() private uri?: string = undefined

  @state() private size = 0

  @state() private ready = false

  public firstUpdated() {
    this.size = this.offsetWidth - 40
  }

  // -- Render -------------------------------------------- //
  public render() {
    this.isReady()

    return html`
      <wui-flex .padding=${['s', 'xl', 'xl', 'xl'] as const} flexDirection="column" gap="s">
        <wui-flex justifyContent="space-between" alignItems="center">
          <wui-text variant="paragraph-500" color="fg-100">
            Scan this QR Code with your phone
          </wui-text>
          <wui-icon-link size="md" icon="copy" @click=${this.onCopyUri}></wui-icon-link>
        </wui-flex>

        <wui-shimmer borderRadius="l" width="100%"> ${this.qrCodeTenmplate()} </wui-shimmer>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private isReady() {
    if (this.uri && this.size) {
      setTimeout(() => (this.ready = true), 250)
    }
  }

  private qrCodeTenmplate() {
    if (!this.uri || !this.size || !this.ready) {
      return null
    }

    return html`<wui-qr-code size=${this.size} theme="dark" uri=${this.uri}></wui-qr-code>`
  }

  private onCopyUri() {
    try {
      if (this.uri) {
        CoreHelperUtil.copyToClopboard(this.uri)
      }
    } catch {
      // TASK: Show error toast
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-wc-qrcode': W3mConnectingWcQrcode
  }
}
