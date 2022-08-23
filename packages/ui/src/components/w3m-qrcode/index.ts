import { LitElement, html, svg, TemplateResult } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import QRCodeUtil from 'qrcode'
import styles from './styles'
import { global } from '../../utils/Theme'
import { generateDots } from '../../utils/QrCodeGeneration'

@customElement('w3m-qrcode')
export default class W3mQrCode extends LitElement {
  public static styles = [global, styles]
  @property() public uri: string = 'uri'
  @property() public logo: string = 'uri'
  @property() public size: number = 200
  @property() public logoSize: number = 50
  @property() public logoMargin: number = 10
  @property() public logoBackground: string = 'black'

  protected render() {
    const logoPosition = this.size / 2 - this.logoSize / 2
    const logoWrapperSize = this.logoSize + this.logoMargin * 2
    const innerSvg = svg`
        <defs>
          <clipPath id="clip-wrapper">
            <rect height=${logoWrapperSize} width=${logoWrapperSize} />
          </clipPath>
          <clipPath id="clip-logo">
            <rect height=${this.logoSize} width=${this.logoSize} />
          </clipPath>
        </defs>
        <rect fill="transparent" height=${this.size} width=${this.size} />
    `
    return html`
      <div class="w3m-qrcode" style="width: ${this.size}; height: ${this.size}">
        <div class="w3m-logo-image" style="top: ${logoPosition}px; width: ${this.size}">
          <img
            style="background: ${this.logoBackground}"
            src=${this.logo}
            width=${this.logoSize}
            height=${this.logoSize}
          />
        </div>
        <svg height=${this.size} width=${this.size} style="all: revert">
          ${innerSvg}${generateDots(this.uri, this.size, this.logoSize)}
        </svg>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-qrcode': W3mQrCode
  }
}
