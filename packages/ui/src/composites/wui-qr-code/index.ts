import { html, LitElement, svg } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { QrCodeUtil } from '../../utils/QrCode'
import { resetStyles } from '../../utils/ThemeUtil'
import styles from './styles'
import '../../components/wui-icon'
import '../../components/wui-image'
import { ThemeType } from '../../utils/TypesUtil'

@customElement('wui-qr-code')
export class WuiQrCode extends LitElement {
  public static styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public uri = ''

  @property({ type: Number }) public size = 0

  @property() public theme: ThemeType = 'dark'

  @property() public imageSrc?: string = undefined

  @property() public alt?: string = undefined

  // -- Render -------------------------------------------- //
  public render() {
    this.dataset.theme = this.theme
    this.style.cssText = `--local-size: ${this.size}px`

    return html`${this.templateVisual()} ${this.templateSvg()}`
  }

  // -- Private ------------------------------------------- //
  private templateSvg() {
    const size = this.theme === 'light' ? this.size : this.size - 16 * 2

    return svg`
      <svg height=${size} width=${size}>
        ${QrCodeUtil.generate(this.uri, size, size / 4)}
      </svg>
    `
  }

  private templateVisual() {
    if (this.imageSrc && this.alt) {
      return html`<wui-image src=${this.imageSrc} alt=${this.alt}></wui-image>`
    }

    return html`<wui-icon size="inherit" color="inherit" name="walletConnect"></wui-icon>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-qr-code': WuiQrCode
  }
}
