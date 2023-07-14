import {
  ConnectionController,
  ConstantsUtil,
  CoreHelperUtil,
  ModalController
} from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import styles from './styles'

@customElement('w3m-connecting-wc-view')
export class W3mConnectingWcView extends LitElement {
  public static styles = styles

  // -- Members ------------------------------------------- //
  private usnubscribe: (() => void)[] = []

  private interval?: ReturnType<typeof setTimeout> = undefined

  private lastRetry = Date.now()

  // -- State & Properties -------------------------------- //
  @state() private uri = ConnectionController.state.wcUri

  @state() private size = 0

  public constructor() {
    super()
    this.usnubscribe.push(ConnectionController.subscribe('wcUri', uri => (this.uri = uri)))
    this.initializeConnection()
    this.interval = setInterval(this.initializeConnection.bind(this), ConstantsUtil.TEN_SEC_MS)
  }

  public firstUpdated() {
    this.size = this.offsetWidth - 40
  }

  public disconnectedCallback() {
    clearTimeout(this.interval)
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
  private async initializeConnection(retry = false) {
    try {
      const { wcPairingExpiry } = ConnectionController.state
      if (retry || CoreHelperUtil.isPairingExpired(wcPairingExpiry)) {
        ConnectionController.connectWalletConnect()
        await ConnectionController.state.wcPromise
        ModalController.close()
      }
    } catch {
      if (CoreHelperUtil.isAllowedRetry(this.lastRetry)) {
        this.lastRetry = Date.now()
        this.initializeConnection(true)
      }
    }
  }

  private qrCodeTenmplate() {
    if (!this.uri || !this.size) {
      return html`<wui-shimmer borderRadius="l" width="100%"></wui-shimmer>`
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
