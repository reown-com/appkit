import { WcConnectionCtrl } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { ThemeUtil } from '../../utils/ThemeUtil'
import { UiUtil } from '../../utils/UiUtil'
import styles from './styles.css'

@customElement('w3m-walletconnect-qr')
export class W3mWalletConnectQr extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ------------------------------------------- //
  @property() public walletId? = ''

  @property() public imageId? = ''

  @state() private uri? = ''

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    setTimeout(() => {
      const { pairingUri } = WcConnectionCtrl.state
      this.uri = pairingUri
    }, 0)
    this.unwatchWcConnection = WcConnectionCtrl.subscribe(connection => {
      if (connection.pairingUri) {
        this.uri = connection.pairingUri
      }
    })
  }

  public disconnectedCallback() {
    this.unwatchWcConnection?.()
  }

  // -- private ------------------------------------------------------ //
  private readonly unwatchWcConnection?: () => void = undefined

  private get overlayEl(): HTMLDivElement {
    return UiUtil.getShadowRootElement(this, '.w3m-qr-container') as HTMLDivElement
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <div class="w3m-qr-container">
        ${this.uri
          ? html`<w3m-qrcode
              size="${this.overlayEl.offsetWidth}"
              uri=${this.uri}
              walletId=${this.walletId}
              imageId=${this.imageId}
              data-testid="partial-qr-code"
            ></w3m-qrcode>`
          : html`<w3m-spinner data-testid="partial-qr-spinner"></w3m-spinner>`}
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-walletconnect-qr': W3mWalletConnectQr
  }
}
