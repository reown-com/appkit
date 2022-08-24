import { ConfigCtrl } from '@web3modal/core'
import { html, LitElement, svg } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { getDots } from '../../utils/QrCode'
import { WALLET_CONNECT_ICON_GRADIENT } from '../../utils/Svgs'
import { global } from '../../utils/Theme'
import styles from './styles'

@customElement('w3m-qrcode')
export default class W3mQrCode extends LitElement {
  public static styles = [global, styles]

  // -- state & properties ------------------------------------------- //
  @property() public uri = ''
  @property() public size = 0
  @property() public logo? = ''

  // -- private ------------------------------------------------------ //

  private svgTemplate() {
    const theme = ConfigCtrl.state.theme ?? 'light'

    return svg`
      <svg height=${this.size} width=${this.size}>
        ${getDots(this.uri, this.size, this.size / 4, theme)}
      </svg>
    `
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <div class="w3m-qrcode-container">
        ${this.logo ? html`<img src=${this.logo} />` : WALLET_CONNECT_ICON_GRADIENT}
        ${this.svgTemplate()}
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-qrcode': W3mQrCode
  }
}
