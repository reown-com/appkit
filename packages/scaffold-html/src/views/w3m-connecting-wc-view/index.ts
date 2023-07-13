import { ConnectionController, CoreHelperUtil } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'

@customElement('w3m-connecting-wc-view')
export class W3mConnectingWcView extends LitElement {
  // -- Members ------------------------------------------- //
  private usnubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() private uri?: string = undefined

  @state() private expiry?: number = undefined

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
  }

  public firstUpdated() {
    this.initializeConnection()
  }

  public disconnectedCallback() {
    this.usnubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public render() {
    return html` <wui-flex padding="xl"> ${this.qrCodeTenmplate()} </wui-flex> `
  }

  // -- Private ------------------------------------------- //
  private async initializeConnection() {
    const { walletConnectPairingExpiry, walletConnectPromise, walletConnectUri } =
      ConnectionController.state

    if (
      walletConnectPairingExpiry &&
      walletConnectUri &&
      walletConnectPromise &&
      CoreHelperUtil.isActivePairingExpiry(walletConnectPairingExpiry)
    ) {
      try {
        this.uri = walletConnectUri
        this.expiry = walletConnectPairingExpiry
        await walletConnectPromise
      } catch {
        // TASK: Show toast erorr, retry logic
      }
    } else {
      ConnectionController.connectWalletConnect()
      await ConnectionController.state.walletConnectPromise
    }
  }

  private qrCodeTenmplate() {
    if (!this.uri) {
      return null
    }
    const padding = 40
    const size = this.offsetWidth - padding

    return html`<wui-qr-code size=${size} theme="dark" uri=${this.uri}></wui-qr-code>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-wc-view': W3mConnectingWcView
  }
}
