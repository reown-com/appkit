import { CoreHelperUtil, SnackController } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'

@customElement('w3m-connecting-wc-web')
export class W3mConnectingWcWeb extends LitElement {
  // -- State & Properties -------------------------------- //
  @property() private uri?: string = undefined

  @state() private ready = Boolean(this.uri)

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
    if (!this.ready && this.uri) {
      setTimeout(() => (this.ready = true), 250)
    }
  }

  private qrCodeTenmplate() {
    if (!this.uri || !this.ready) {
      return null
    }
    const size = this.getBoundingClientRect().width - 40

    return html`<wui-qr-code size=${size} theme="dark" uri=${this.uri}></wui-qr-code>`
  }

  private onCopyUri() {
    try {
      if (this.uri) {
        CoreHelperUtil.copyToClopboard(this.uri)
        SnackController.showSuccess('Uri copied')
      }
    } catch {
      SnackController.showError('Failed to copy')
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-wc-web': W3mConnectingWcWeb
  }
}
