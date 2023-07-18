import { ThemeCtrl } from '@web3modal/core'
import { html, LitElement, svg } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
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

  @property() public imageId?: string = undefined

  @property() public walletId?: string = undefined

  @property() public imageUrl?: string = undefined

  // -- private ------------------------------------------------------ //
  private svgTemplate() {
    const isLightMode = ThemeCtrl.state.themeMode === 'light'
    const size = isLightMode ? this.size : this.size - 18 * 2

    return svg`                
      <svg height=${size} width=${size} data-testid="component-qrcode-svg">
        ${QrCodeUtil.generate(this.uri, size, size / 4)}
      </svg>
    `
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const classes = {
      'w3m-dark': ThemeCtrl.state.themeMode === 'dark'
    }

    return html`
      <div style=${`width: ${this.size}px`} class=${classMap(classes)}>
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
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-qrcode': W3mQrCode
  }
}
