import { html, LitElement, svg } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { getDots } from '../../utils/QrCode'
import { global } from '../../utils/Theme'
import styles from './styles'

@customElement('w3m-qrcode')
export default class W3mQrCode extends LitElement {
  public static styles = [global, styles]

  // -- state & properties ------------------------------------------- //
  @property() public uri = 'uri'
  @property() public logo = 'uri'
  @property() public size = 400

  // -- private ------------------------------------------------------ //
  private readonly logoSize = this.size / 4

  private svgTemplate() {
    return svg`
      <svg height=${this.size} width=${this.size}>
        ${getDots(this.uri, this.size, this.logoSize)}
      </svg>
    `
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <div class="w3m-qrcode">
        <img src=${this.logo} width=${this.logoSize} height=${this.logoSize} />
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
