import { ConfigCtrl } from '@web3modal/core'
import { html, LitElement, svg } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { scss } from '../../style/utils'
import { getDots } from '../../utils/QrCode'
import { WALLET_CONNECT_ICON_COLORED } from '../../utils/Svgs'
import { global, color } from '../../utils/Theme'
import '../w3m-wallet-image'
import styles from './styles.css'

@customElement('w3m-qrcode')
export default class W3mQrCode extends LitElement {
  public static styles = [global, styles]

  // -- state & properties ------------------------------------------- //
  @property() public uri = ''
  @property({ type: Number }) public size = 0
  @property() public logoSrc? = ''

  protected dynamicStyles() {
    const { overlay, foreground } = color()

    return html`<style>
      .w3m-qrcode-container svg:first-child path:first-child {
        fill: ${foreground.accent};
      }

      .w3m-qrcode-container svg:first-child path:last-child {
        stroke: ${overlay.thin};
      }
    </style>`
  }

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
      ${this.dynamicStyles()}
      <div class="w3m-qrcode-container">
        ${this.logoSrc
          ? html`<w3m-wallet-image src=${this.logoSrc}></w3m-wallet-image>`
          : WALLET_CONNECT_ICON_COLORED}
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
