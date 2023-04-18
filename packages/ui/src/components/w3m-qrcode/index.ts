import { ThemeCtrl } from '@web3modal/core'
import { html, LitElement, svg } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { QrCodeUtil } from '../../utils/QrCode'
import { SvgUtil } from '../../utils/SvgUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import styles from './styles.css'

@customElement('w3m-qrcode')
export class W3mQrCode extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ------------------------------------------- //
  @property() public uri = ''
  @property({ type: Number }) public size = 0
  @property() public imageId? = ''
  @property() public walletId? = ''
  @property() public imageUrl? = ''

  // -- private ------------------------------------------------------ //
  private svgTemplate() {
    const themeMode = ThemeCtrl.state.themeMode ?? 'light'

    return svg`
      <svg height=${this.size} width=${this.size}>
        ${QrCodeUtil.generate(this.uri, this.size, this.size / 4, themeMode)}
      </svg>
    `
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <div>
        ${this.walletId || this.imageUrl
          ? html`
              <w3m-wallet-image
                walletId=${this.walletId}
                imageId=${this.imageId}
                imageUrl=${this.imageUrl}
              ></w3m-wallet-image>
            `
          : SvgUtil.WALLET_CONNECT_ICON_COLORED}
        ${this.svgTemplate()}
        <w3m-theme-context></w3m-theme-context>
      </div>
    `
  }
}

export default W3mQrCode

declare global {
  interface HTMLElementTagNameMap {
    'w3m-qrcode': W3mQrCode
  }
}
