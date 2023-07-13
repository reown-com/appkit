import { ConnectionController, CoreHelperUtil } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'

@customElement('w3m-connecting-wc-view')
export class W3mConnectingWcView extends LitElement {
  // -- Members ------------------------------------------- //
  private usnubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() private uri = ConnectionController.state.walletConnectUri

  @state() private expiry = ConnectionController.state.walletConnectPairingExpiry

  @state() private size = 0

  public constructor() {
    super()
    this.usnubscribe.push(
      ...[
        ConnectionController.subscribe('walletConnectUri', uri => (this.uri = uri)),
        ConnectionController.subscribe(
          'walletConnectPairingExpiry',
          expiry => (this.expiry = expiry)
        )
      ]
    )
    this.initializeConnection()
  }

  public firstUpdated() {
    this.size = this.offsetWidth - 40
  }

  public disconnectedCallback() {
    this.usnubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public render() {
    return html`
      <wui-flex .padding=${['s', 'xl', 'xl', 'xl'] as const} flexDirection="column" gap="s">
        <wui-flex justifyContent="space-between" alignItems="center">
          <wui-text variant="paragraph-500" color="fg-100">
            Scan this QR Code with your phone
          </wui-text>
          <wui-icon-link size="md" icon="copy" @click=${this.onCopyUri}></wui-icon-link>
        </wui-flex>

        ${this.qrCodeTenmplate()}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private async initializeConnection() {
    if (this.expiry && CoreHelperUtil.isActivePairingExpiry(this.expiry)) {
      try {
        await ConnectionController.state.walletConnectPromise
      } catch {
        // TODO: Show toast error, retry logic
      }
    } else {
      ConnectionController.connectWalletConnect()
      await ConnectionController.state.walletConnectPromise
    }
  }

  private qrCodeTenmplate() {
    if (!this.uri || !this.size) {
      // TODO: Create propper placeholder
      return html`<div style="width: 100%; aspect-ratio: 1 / 1;"></div>`
    }

    return html`<wui-qr-code size=${this.size} theme="dark" uri=${this.uri}></wui-qr-code>`
  }

  private onCopyUri() {
    try {
      if (this.uri) {
        CoreHelperUtil.copyToClopboard(this.uri)
      }
    } catch {
      // TODO: Show error toast
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-wc-view': W3mConnectingWcView
  }
}
